'use client';

import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

import { CampoFormulario } from '@/components/layout/campo-formulario';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  obterModoAplicacao,
  type ModoAplicacao,
} from '@/config/modo-aplicacao';
import { useAutenticacaoApi } from '@/contexts/autenticacao-api';
import { LayoutAutenticacao } from '@/layouts/autenticacao';
import { ErroApi } from '@/services/api/problem-details';
import type { RespostaCadastro } from '@/types/api/autenticacao';

const MUNICIPIO_FRANCA_PROTOTIPO = '00000000-0000-4000-8000-000000000001';

function somenteDigitos(value: string): string {
  return value.replace(/\D/g, '');
}

function mensagemCadastro(error: unknown): string {
  if (error instanceof ErroApi) {
    const mensagens: Record<string, string> = {
      EMAIL_INDISPONIVEL: 'Este e-mail não está disponível.',
      NOME_USUARIO_INDISPONIVEL: 'Este nome de usuário não está disponível.',
      CPF_INDISPONIVEL: 'Este CPF já está associado a uma conta.',
      RG_INDISPONIVEL: 'Este RG já está associado a uma conta.',
      MUNICIPIO_INATIVO: 'O município informado não está disponível.',
      TERMOS_NAO_ACEITOS: 'É necessário aceitar os termos de uso.',
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
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [cadastro, setCadastro] = useState<RespostaCadastro | null>(null);
  const [reenvio, setReenvio] = useState<string | null>(null);
  const integradoBloqueado = modo === 'integrado';

  if (
    cadastro?.status === 'AGUARDANDO_CONSENTIMENTO' ||
    cadastro?.proximaAcao === 'INFORMAR_RESPONSAVEL' ||
    cadastro?.consentimentoResponsavelNecessario
  ) {
    return (
      <LayoutAutenticacao>
        <div aria-live="polite">
          <p className="mb-3 text-xs font-semibold tracking-[0.14em] text-warning uppercase">
            Fluxo indisponível nesta etapa
          </p>
          <h1 className="font-display text-3xl font-semibold text-foreground">
            Cadastro de menor não concluído
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            A API informou que este cadastro exige o fluxo do responsável. Essa
            jornada ainda depende das definições canônicas de consentimento e
            não será simulada pelo frontend.
          </p>
          <Link
            href="/login"
            className="mt-7 inline-flex text-sm font-semibold text-green-dark underline-offset-4 hover:underline"
          >
            Voltar ao acesso
          </Link>
        </div>
      </LayoutAutenticacao>
    );
  }

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
                await api.reenviarConfirmacaoEmail(cadastro.cadastroToken);
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
              href={`/confirmar-email?token=${encodeURIComponent(cadastro.cadastroToken)}`}
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

      {integradoBloqueado ? (
        <p
          role="status"
          className="mt-5 border-l-2 border-warning pl-3 text-sm text-muted-foreground"
        >
          O cadastro integrado aguarda o catálogo público de municípios exigido
          para selecionar o `municipioId`. Nenhum cadastro será simulado.
        </p>
      ) : (
        <p className="mt-5 text-sm text-muted-foreground">
          Município de demonstração: Franca, SP.
        </p>
      )}

      <form
        className="mt-8 space-y-5"
        onSubmit={async (event) => {
          event.preventDefault();
          if (enviando || integradoBloqueado) return;
          const form = new FormData(event.currentTarget);
          const senha = String(form.get('senha') ?? '');
          const confirmacao = String(form.get('confirmarSenha') ?? '');
          if (senha !== confirmacao) {
            setErro('As senhas informadas não coincidem.');
            return;
          }

          setErro(null);
          setEnviando(true);
          try {
            const response = await api.cadastrar({
              nome: String(form.get('nome') ?? '').trim(),
              nomeUsuario: String(form.get('nomeUsuario') ?? '').trim(),
              email: String(form.get('email') ?? '')
                .trim()
                .toLowerCase(),
              telefone: String(form.get('telefone') ?? '').trim() || null,
              cpf: somenteDigitos(String(form.get('cpf') ?? '')),
              rgNumero: somenteDigitos(String(form.get('rgNumero') ?? '')),
              rgOrgaoExpedidor: String(
                form.get('rgOrgaoExpedidor') ?? '',
              ).trim(),
              rgUf: String(form.get('rgUf') ?? '')
                .trim()
                .toUpperCase(),
              dataNascimento: String(form.get('dataNascimento') ?? ''),
              municipioId: MUNICIPIO_FRANCA_PROTOTIPO,
              senha,
              termosAceitos: true,
            });
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
        <CampoFormulario label="Senha" htmlFor="senha-field">
          <Input
            id="senha-field"
            name="senha"
            type="password"
            autoComplete="new-password"
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
          disabled={enviando || integradoBloqueado}
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
