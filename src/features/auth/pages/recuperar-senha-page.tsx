import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

import { AuthShell } from '@/features/auth/components/auth-shell';
import { Field } from '@/shared/components/campo-livre-ui';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

export function RecuperarSenhaPage() {
  const [enviado, setEnviado] = useState(false);

  return (
    <AuthShell>
      {enviado ? (
        <div aria-live="polite">
          <CheckCircle2 className="h-9 w-9 text-success" />
          <p className="mt-6 mb-3 text-xs font-semibold tracking-[0.14em] text-green-dark uppercase">
            Solicitação recebida
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-[-0.025em] text-foreground">
            Confira seu e-mail
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
            Enviamos as instruções de recuperação. Se a mensagem não aparecer,
            verifique também a caixa de spam.
          </p>
          <Link
            to="/login"
            className="mt-8 inline-flex text-sm font-semibold text-green-dark underline-offset-4 hover:underline"
          >
            Voltar para o acesso
          </Link>
        </div>
      ) : (
        <>
          <p className="mb-3 text-xs font-semibold tracking-[0.14em] text-green-dark uppercase">
            Recuperação de acesso
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-[-0.025em] text-foreground">
            Esqueceu sua senha?
          </h1>
          <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
            Informe o e-mail usado no cadastro para receber as instruções de
            redefinição.
          </p>
          <form
            className="mt-8 space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              setEnviado(true);
            }}
          >
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
            <Button variant="campo" type="submit" className="h-11 w-full">
              Enviar instruções
            </Button>
          </form>
          <p className="mt-8 border-t border-border pt-6 text-sm">
            <Link
              to="/login"
              className="font-semibold text-green-dark underline-offset-4 hover:underline"
            >
              Voltar para o acesso
            </Link>
          </p>
        </>
      )}
    </AuthShell>
  );
}
