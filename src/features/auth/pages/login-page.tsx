import { ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { AuthShell } from '@/features/auth/components/auth-shell';
import {
  getContextHome,
  useSession,
} from '@/features/auth/session/session-context';
import { Field } from '@/shared/components/campo-livre-ui';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

export function LoginPage() {
  const navigate = useNavigate();
  const { signInWithMock } = useSession();

  return (
    <AuthShell>
      <div className="flex h-full flex-col justify-center py-2">
        <div className="mb-7">
          <p className="mb-2 text-xs font-semibold tracking-[0.14em] text-green-dark uppercase">
            Bem-vindo de volta
          </p>

          <h1 className="font-display text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">
            Entre no CampoLivre
          </h1>

          <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
            Acesse sua conta para realizar ações que dependem da sua identidade.
          </p>
        </div>

        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            const session = signInWithMock();
            navigate(getContextHome(session.activeContext));
          }}
        >
          <Field label="E-mail" htmlFor="e-mail-field">
            <Input
              id="e-mail-field"
              type="email"
              autoComplete="email"
              required
              placeholder="seu@email.com"
              className="h-11"
            />
          </Field>

          <div>
            <div className="flex items-end justify-between gap-4">
              <Field label="Senha" htmlFor="senha-field">
                <Input
                  id="senha-field"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="Digite sua senha"
                  className="h-11"
                />
              </Field>
            </div>

            <div className="mt-1.5 text-right">
              <Link
                to="/recuperar-senha"
                className="text-xs font-medium text-green-dark underline-offset-4 hover:underline sm:text-sm"
              >
                Esqueci minha senha
              </Link>
            </div>
          </div>

          <Button
            variant="campo"
            type="submit"
            className="group mt-2 h-11 w-full"
          >
            <span>Entrar</span>

            <ArrowRight
              className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Button>
        </form>

        <div className="mt-7 border-t border-border pt-5">
          <p className="text-sm text-muted-foreground">
            Ainda não faz parte do CampoLivre?
          </p>

          <Link
            to="/cadastro"
            className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-green-dark underline-offset-4 hover:underline"
          >
            Criar minha conta
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
