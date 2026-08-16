import { Link, useNavigate } from 'react-router-dom';

import { AuthShell } from '@/features/auth/components/auth-shell';
import { Field } from '@/shared/components/campo-livre-ui';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

export function CadastroPage() {
  const navigate = useNavigate();

  return (
    <AuthShell>
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

          // TODO(auth-api): enviar somente os dados da conta pessoal quando o
          // contrato de cadastro estiver disponível. Não enviar perfil global.
          navigate('/login');
        }}
      >
        <Field label="Nome completo" htmlFor="nome-completo-field">
          <Input
            id="nome-completo-field"
            autoComplete="name"
            required
            placeholder="Seu nome"
            className="h-11"
          />
        </Field>

        <Field label="E-mail" htmlFor="e-mail-field">
          <Input
            id="e-mail-field"
            type="email"
            autoComplete="email"
            required
            placeholder="voce@email.com"
            className="h-11"
          />
        </Field>

        <Field label="Senha" htmlFor="senha-field">
          <Input
            id="senha-field"
            type="password"
            autoComplete="new-password"
            required
            placeholder="Digite uma senha"
            className="h-11"
          />
        </Field>

        <Field label="Confirmar senha" htmlFor="confirmar-senha-field">
          <Input
            id="confirmar-senha-field"
            type="password"
            autoComplete="new-password"
            required
            placeholder="Repita a senha"
            className="h-11"
          />
        </Field>

        <Field label="Cidade" htmlFor="cidade-field">
          <Input
            id="cidade-field"
            required
            placeholder="Franca, SP"
            className="h-11"
          />
        </Field>

        <Button variant="campo" type="submit" className="h-11 w-full">
          Criar conta pessoal
        </Button>
      </form>

      <p className="mt-8 border-t border-border pt-6 text-sm text-muted-foreground">
        Já participa do CampoLivre?{' '}
        <Link to="/login" className="font-display font-semibold text-green-mid">
          Acessar minha conta
        </Link>
      </p>
    </AuthShell>
  );
}
