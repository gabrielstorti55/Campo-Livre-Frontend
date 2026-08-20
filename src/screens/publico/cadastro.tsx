'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { LayoutAutenticacao } from '@/layouts/autenticacao';
import { useSessao } from '@/hooks/use-sessao';
import { CampoFormulario } from '@/components/layout/campo-formulario';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function TelaCadastro() {
  const router = useRouter();
  const { registerMockAccount } = useSessao();

  return (
    <LayoutAutenticacao>
      <p className="mb-3 text-xs font-semibold tracking-[0.14em] text-green-dark uppercase">
        Nova conta pessoal
      </p>

      <h1 className="font-display text-3xl font-semibold tracking-[-0.025em] text-foreground">
        Crie sua conta
      </h1>

      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Sua conta é única. Suas capacidades no CampoLivre serão definidas pelos
        vínculos e permissões associados a ela.
      </p>

      <form
        className="mt-8 space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);

          // TODO(auth-api): substituir o mock pelo retorno do cadastro real.
          registerMockAccount({
            name: String(form.get('nome') ?? '').trim(),
            city: String(form.get('cidade') ?? '').trim(),
            email: String(form.get('email') ?? '').trim(),
          });
          router.push('/login');
        }}
      >
        <CampoFormulario label="Nome completo" htmlFor="nome-completo-field">
          <Input
            id="nome-completo-field"
            name="nome"
            autoComplete="name"
            required
            placeholder="Seu nome"
            className="h-11"
          />
        </CampoFormulario>

        <CampoFormulario label="E-mail" htmlFor="e-mail-field">
          <Input
            id="e-mail-field"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="voce@email.com"
            className="h-11"
          />
        </CampoFormulario>

        <CampoFormulario label="Senha" htmlFor="senha-field">
          <Input
            id="senha-field"
            name="senha"
            type="password"
            autoComplete="new-password"
            required
            placeholder="Digite uma senha"
            className="h-11"
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
            placeholder="Repita a senha"
            className="h-11"
          />
        </CampoFormulario>

        <CampoFormulario label="Cidade" htmlFor="cidade-field">
          <Input
            id="cidade-field"
            name="cidade"
            required
            placeholder="Franca, SP"
            className="h-11"
          />
        </CampoFormulario>

        <Button variant="campo" type="submit" className="h-11 w-full">
          Criar conta pessoal
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
