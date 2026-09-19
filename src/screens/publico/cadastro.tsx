'use client';

import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { CampoFormulario } from '@/components/layout/campo-formulario';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  obterModoAplicacao,
  type ModoAplicacao,
} from '@/config/modo-aplicacao';
import { useAutenticacaoApi } from '@/contexts/autenticacao-api';
import { useMunicipiosApi } from '@/contexts/municipios-api';
import { LayoutAutenticacao } from '@/layouts/autenticacao';
import { ErroApi } from '@/services/api/problem-details';
import type { RespostaCadastro } from '@/types/api/autenticacao';
import type { Municipio } from '@/types/api/municipios';

function somenteDigitos(value: string): string {
  return value.replace(/\D/g, '');
}

function normalizarRg(value: string): string {
  return value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
}

function senhaAtendePolitica(value: string): boolean {
  return (
    value.length >= 8 &&
    value.length <= 128 &&
    /[A-Z]/.test(value) &&
    /[a-z]/.test(value) &&
    /\d/.test(value) &&
    /[^A-Za-z0-9]/.test(value)
  );
}

function mensagemCadastro(error: unknown): string {
  if (error instanceof ErroApi) {
    const mensagens: Record<string, string> = {
      DADOS_INVALIDOS:
        error.problem.erros?.[0]?.mensagem ??
        'Revise os dados informados e tente novamente.',
      EMAIL_INDISPONIVEL: 'Este e-mail não está disponível.',
      NOME_USUARIO_INDISPONIVEL: 'Este nome de usuário não está disponível.',
      CPF_INDISPONIVEL: 'Este CPF já está associado a uma conta.',
      RG_INDISPONIVEL: 'Este RG já está associado a uma conta.',
      MUNICIPIO_NAO_ENCONTRADO: 'O município informado não está disponível.',
      MUNICIPIO_INATIVO: 'O município informado não está disponível.',
      TERMOS_NAO_ACEITOS: 'É necessário aceitar os termos de uso.',
      LIMITE_EXCEDIDO:
        'Muitas tentativas foram realizadas. Aguarde antes de tentar novamente.',
    };
    const mensagem = mensagens[error.problem.codigo ?? ''];
    if (mensagem) return mensagem;
  }
  return 'Não foi possível iniciar o cadastro agora. Tente novamente.';
}

export function TelaCadastro({
  modo = obterModoAplicacao(),
}: {
  modo?: ModoAplicacao;
}) {
  const api = useAutenticacaoApi();
  const municipiosApi = useMunicipiosApi();
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [cadastro, setCadastro] = useState<RespostaCadastro | null>(null);
  const [emailCadastro, setEmailCadastro] = useState('');
  const [reenvio, setReenvio] = useState<string | null>(null);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [municipioId, setMunicipioId] = useState('');
  const [carregandoMunicipios, setCarregandoMunicipios] = useState(true);
  const [erroMunicipios, setErroMunicipios] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    municipiosApi
      .listarMunicipios({ pagina: 1, tamanho: 100 })
      .then((pagina) => {
        if (!ativo) return;
        setMunicipios(pagina.itens);
        setMunicipioId((atual) => atual || pagina.itens[0]?.id || '');
      })
      .catch(() => {
        if (ativo) {
          setErroMunicipios(
            'Não foi possível carregar os municípios disponíveis.',
          );
        }
      })
      .finally(() => {
        if (ativo) setCarregandoMunicipios(false);
      });

    return () => {
      ativo = false;
    };
  }, [municipiosApi]);

  if (cadastro) {
    return (
      <LayoutAutenticacao>
        <div aria-live="polite">
          <CheckCircle2 className="h-9 w-9 text-success" aria-hidden="true" />
          <p className="mt-6 mb-3 text-xs font-semibold tracking-[0.14em] text-green-dark uppercase">
            Cadastro iniciado
          </p>
          <h1 className="font-display text-3xl font-semibold text-foreground">
            Confirme seu e-mail
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            A conta ainda não está ativa. Use o link enviado ao seu e-mail para
            concluir a confirmação.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-6"
            onClick={async () => {
              setReenvio(null);
              try {
                await api.reenviarConfirmacaoEmail(emailCadastro);
                setReenvio('Um novo envio foi solicitado.');
              } catch {
                setReenvio('Não foi possível solicitar um novo envio agora.');
              }
            }}
          >
            Reenviar confirmação
          </Button>
          {reenvio ? (
            <p role="status" className="mt-3 text-sm text-muted-foreground">
              {reenvio}
            </p>
          ) : null}
          {modo === 'prototipo' ? (
            <Link
              href={`/confirmar-email?token=${encodeURIComponent(`prototipo:${cadastro.cadastroId}`)}`}
              className="mt-6 block text-sm font-semibold text-green-dark underline-offset-4 hover:underline"
            >
              Abrir confirmação simulada
            </Link>
          ) : null}
        </div>
      </LayoutAutenticacao>
    );
  }

  return (
    <LayoutAutenticacao>
      <p className="mb-3 text-xs font-semibold tracking-[0.14em] text-green-dark uppercase">
        Nova conta pessoal
      </p>
      <h1 className="font-display text-3xl font-semibold tracking-[-0.025em] text-foreground">
        Crie sua conta
      </h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Sua conta é única. Capacidades e permissões surgem somente dos vínculos
        associados a ela.
      </p>

      <form
        className="mt-8 space-y-5"
        onSubmit={async (event) => {
          event.preventDefault();
          if (enviando || !municipioId) return;
          const form = new FormData(event.currentTarget);
          const senha = String(form.get('senha') ?? '');
          const confirmacao = String(form.get('confirmarSenha') ?? '');
          if (senha !== confirmacao) {
            setErro('As senhas informadas não coincidem.');
            return;
          }
          if (!senhaAtendePolitica(senha)) {
            setErro(
              'A senha deve ter de 8 a 128 caracteres, com maiúscula, minúscula, número e símbolo.',
            );
            return;
          }

          const email = String(form.get('email') ?? '')
            .trim()
            .toLowerCase();

          setErro(null);
          setEnviando(true);
          try {
            const response = await api.cadastrar({
              nome: String(form.get('nome') ?? '').trim(),
              nomeUsuario: String(form.get('nomeUsuario') ?? '').trim(),
              email,
              telefone: String(form.get('telefone') ?? '').trim() || null,
              cpf: somenteDigitos(String(form.get('cpf') ?? '')),
              rgNumero: normalizarRg(String(form.get('rgNumero') ?? '')),
              rgOrgaoExpedidor: String(
                form.get('rgOrgaoExpedidor') ?? '',
              ).trim(),
              rgUf: String(form.get('rgUf') ?? '')
                .trim()
                .toUpperCase(),
              dataNascimento: String(form.get('dataNascimento') ?? ''),
              municipioId,
              senha,
              termosAceitos: true,
            });
            setEmailCadastro(email);
            setCadastro(response);
          } catch (error) {
            setErro(mensagemCadastro(error));
          } finally {
            setEnviando(false);
          }
        }}
      >
        <CampoFormulario label="Nome completo" htmlFor="nome-completo-field">
          <Input
            id="nome-completo-field"
            name="nome"
            autoComplete="name"
            required
          />
        </CampoFormulario>
        <CampoFormulario label="Nome de usuário" htmlFor="nome-usuario-field">
          <Input
            id="nome-usuario-field"
            name="nomeUsuario"
            autoComplete="username"
            required
          />
        </CampoFormulario>
        <CampoFormulario label="E-mail" htmlFor="e-mail-field">
          <Input
            id="e-mail-field"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </CampoFormulario>
        <CampoFormulario label="Telefone (opcional)" htmlFor="telefone-field">
          <Input
            id="telefone-field"
            name="telefone"
            type="tel"
            autoComplete="tel"
          />
        </CampoFormulario>
        <div className="grid gap-5 sm:grid-cols-2">
          <CampoFormulario label="CPF" htmlFor="cpf-field">
            <Input id="cpf-field" name="cpf" inputMode="numeric" required />
          </CampoFormulario>
          <CampoFormulario label="Número do RG" htmlFor="rg-field">
            <Input id="rg-field" name="rgNumero" required />
          </CampoFormulario>
        </div>
        <div className="grid gap-5 sm:grid-cols-[1fr_5rem]">
          <CampoFormulario label="Órgão expedidor" htmlFor="rg-orgao-field">
            <Input id="rg-orgao-field" name="rgOrgaoExpedidor" required />
          </CampoFormulario>
          <CampoFormulario label="UF do RG" htmlFor="rg-uf-field">
            <Input id="rg-uf-field" name="rgUf" maxLength={2} required />
          </CampoFormulario>
        </div>
        <CampoFormulario label="Data de nascimento" htmlFor="nascimento-field">
          <Input
            id="nascimento-field"
            name="dataNascimento"
            type="date"
            required
          />
        </CampoFormulario>
        <CampoFormulario label="Município" htmlFor="municipio-field">
          <select
            id="municipio-field"
            name="municipioId"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={municipioId}
            onChange={(event) => setMunicipioId(event.target.value)}
            disabled={carregandoMunicipios || Boolean(erroMunicipios)}
            required
          >
            <option value="">
              {carregandoMunicipios
                ? 'Carregando municípios...'
                : 'Selecione um município'}
            </option>
            {municipios.map((municipio) => (
              <option key={municipio.id} value={municipio.id}>
                {municipio.nome} — {municipio.uf}
              </option>
            ))}
          </select>
          {erroMunicipios ? (
            <p role="alert" className="mt-2 text-sm text-destructive">
              {erroMunicipios}
            </p>
          ) : null}
        </CampoFormulario>
        <CampoFormulario label="Senha" htmlFor="senha-field">
          <Input
            id="senha-field"
            name="senha"
            type="password"
            autoComplete="new-password"
            minLength={8}
            maxLength={128}
            required
          />
        </CampoFormulario>
        <CampoFormulario
          label="Confirmar senha"
          htmlFor="confirmar-senha-field"
        >
          <Input
            id="confirmar-senha-field"
            name="confirmarSenha"
            type="password"
            autoComplete="new-password"
            minLength={8}
            maxLength={128}
            required
          />
        </CampoFormulario>
        <label className="flex items-start gap-3 text-sm text-muted-foreground">
          <input
            name="termosAceitos"
            type="checkbox"
            required
            className="mt-1"
          />
          <span>Aceito os termos de uso</span>
        </label>
        {erro ? (
          <p role="alert" className="text-sm text-destructive">
            {erro}
          </p>
        ) : null}
        <Button
          variant="campo"
          type="submit"
          disabled={enviando || carregandoMunicipios || !municipioId}
          className="h-11 w-full"
        >
          {enviando ? 'Criando…' : 'Criar conta pessoal'}
        </Button>
      </form>

      <p className="mt-8 border-t border-border pt-6 text-sm text-muted-foreground">
        Já participa do CampoLivre?{' '}
        <Link
          href="/login"
          className="font-display font-semibold text-green-mid"
        >
          Acessar minha conta
        </Link>
      </p>
    </LayoutAutenticacao>
  );
}
