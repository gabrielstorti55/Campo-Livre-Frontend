import { Link, useNavigate } from 'react-router-dom';

import { AuthShell } from '@/features/auth/components/auth-shell';
import { Field } from '@/shared/components/campo-livre-ui';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

export function LoginPage() {
  const navigate = useNavigate();

  return (
    <AuthShell>
      <div className="flex h-full flex-col justify-center py-2">
        <div className="mb-6">
          <p className="mb-2 text-xs font-semibold tracking-[0.14em] text-green-dark uppercase">
            Área do participante
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-[-0.025em] text-foreground">
            Acesse sua conta
          </h1>
          <p className="mt-1.5 max-w-sm text-sm leading-6 text-muted-foreground">
            Entre com seus dados para acompanhar times, partidas e campeonatos
            da sua região.
          </p>
        </div>

        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            navigate('/atleta/inicio');
          }}
        >
          <Field label="E-mail" htmlFor="e-mail-field">
            <Input
              id="e-mail-field"
              type="email"
              autoComplete="email"
              required
              placeholder="voce@email.com"
              className="h-10"
            />
          </Field>

          <div>
            <Field label="Senha" htmlFor="senha-field">
              <Input
                id="senha-field"
                type="password"
                autoComplete="current-password"
                required
                placeholder="Digite sua senha"
                className="h-10"
              />
            </Field>
            <div className="mt-1.5 text-right">
              <Link
                to="/recuperar-senha"
                className="text-xs sm:text-sm font-medium text-green-dark underline-offset-4 hover:underline"
              >
                Esqueci minha senha
              </Link>
            </div>
          </div>

          <Button variant="campo" type="submit" className="mt-2 h-10 w-full">
            Entrar
          </Button>
        </form>

        <div className="mt-6 border-t border-border pt-4">
          <p className="text-sm text-muted-foreground">
            Ainda não participa do CampoLivre?
          </p>
          <Link
            to="/cadastro"
            className="mt-1 inline-flex text-sm font-semibold text-green-dark underline-offset-4 hover:underline"
          >
            Criar conta
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
