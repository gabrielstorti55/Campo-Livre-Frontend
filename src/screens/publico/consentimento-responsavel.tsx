'use client';

import { useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useConsentimentosApi } from '@/contexts/consentimentos-api';
import { LayoutAutenticacao } from '@/layouts/autenticacao';
import { ErroApi } from '@/services/api/problem-details';

const TERMO_VERSAO = '2026-09';

function mensagemErro(error: unknown): string {
  if (error instanceof ErroApi) {
    const mensagens: Record<string, string> = {
      CONTINUIDADE_PARENTAL_INVALIDA:
        'A continuidade deste cadastro expirou. Confirme novamente o e-mail do menor.',
      RESPONSAVEL_MENOR: 'O responsável precisa ter 18 anos ou mais.',
      DECLARACAO_OBRIGATORIA: 'É necessário declarar a responsabilidade legal.',
      CONSENTIMENTO_NAO_ACEITO: 'É necessário aceitar o consentimento.',
      SENHA_FORA_DA_POLITICA:
        'A senha de revogação não atende à política de segurança.',
      CONTA_NAO_AGUARDA_CONSENTIMENTO:
        'Esta conta não aguarda mais consentimento.',
      LIMITE_EXCEDIDO: 'Muitas tentativas. Aguarde antes de tentar novamente.',
    };
    return (
      mensagens[error.problem.codigo] ??
      'Não foi possível registrar o consentimento.'
    );
  }
  return 'Não foi possível registrar o consentimento.';
}

export function TelaConsentimentoResponsavel() {
  const api = useConsentimentosApi();
  const [enviando, setEnviando] = useState(false);
  const [concluido, setConcluido] = useState(false);
  const [erro, setErro] = useState('');

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setEnviando(true);
    setErro('');
    try {
      await api.iniciar({
        responsavel: {
          nomeCompleto: String(form.get('nomeCompleto') ?? ''),
          cpf: String(form.get('cpf') ?? ''),
          dataNascimento: String(form.get('dataNascimento') ?? ''),
          email: String(form.get('email') ?? ''),
          relacaoComMenor: String(form.get('relacaoComMenor') ?? ''),
          declaraResponsabilidadeLegal:
            form.get('declaraResponsabilidadeLegal') === 'on',
        },
        senhaRevogacao: String(form.get('senhaRevogacao') ?? ''),
        termoVersao: TERMO_VERSAO,
        aceitaConsentimento: form.get('aceitaConsentimento') === 'on',
      });
      setConcluido(true);
    } catch (error) {
      setErro(mensagemErro(error));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <LayoutAutenticacao>
      <p className="text-xs font-semibold tracking-[0.14em] text-green-dark uppercase">
        Consentimento parental
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold">
        Responsável legal
      </h1>
      {concluido ? (
        <div aria-live="polite" className="mt-6 space-y-3 text-sm leading-6">
          <p className="font-semibold text-success">
            O envio do link foi aceito.
          </p>
          <p>
            Confira o e-mail informado para acessar a etapa de envio do
            documento. A entrega depende do serviço de e-mail.
          </p>
          <p>
            Guarde a senha de revogação em local seguro. Ela não é recuperável
            nem enviada por e-mail.
          </p>
        </div>
      ) : (
        <form onSubmit={enviar} className="mt-6 space-y-4">
          <Campo
            label="Nome completo"
            name="nomeCompleto"
            autoComplete="name"
          />
          <Campo label="CPF" name="cpf" inputMode="numeric" />
          <Campo label="Data de nascimento" name="dataNascimento" type="date" />
          <Campo
            label="E-mail"
            name="email"
            type="email"
            autoComplete="email"
          />
          <Campo label="Relação com o menor" name="relacaoComMenor" />
          <Campo
            label="Senha de revogação"
            name="senhaRevogacao"
            type="password"
            autoComplete="new-password"
          />
          <label className="flex gap-3 text-sm leading-5">
            <input
              required
              name="declaraResponsabilidadeLegal"
              type="checkbox"
            />{' '}
            Declaro que sou responsável legal pelo menor.
          </label>
          <label className="flex gap-3 text-sm leading-5">
            <input required name="aceitaConsentimento" type="checkbox" />{' '}
            Autorizo o tratamento dos dados para validar o consentimento,
            conforme o termo {TERMO_VERSAO}.
          </label>
          <p className="text-xs text-muted-foreground">
            O documento será enviado em uma etapa separada e analisado pelos
            serviços do CampoLivre. Esta tela não simula análise ou aprovação.
          </p>
          {erro ? (
            <p role="alert" className="text-sm text-destructive">
              {erro}
            </p>
          ) : null}
          <Button type="submit" disabled={enviando}>
            {enviando ? 'Registrando…' : 'Registrar consentimento'}
          </Button>
        </form>
      )}
    </LayoutAutenticacao>
  );
}

function Campo({
  label,
  name,
  ...props
}: { label: string; name: string } & React.ComponentProps<'input'>) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <Input className="mt-1" name={name} required {...props} />
    </label>
  );
}
