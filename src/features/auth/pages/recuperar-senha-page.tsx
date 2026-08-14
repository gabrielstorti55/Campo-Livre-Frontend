import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';

import { Field } from '@/shared/components/campo-livre-ui';
import { Input } from '@/shared/components/ui/input';
import { AuthShell } from '@/features/auth/components/auth-shell';

export function RecuperarSenhaPage() {
  const [enviado, setEnviado] = useState(false);

  return (
    <AuthShell>
      {enviado ? (
        <div className="py-4 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
          <h1 className="mt-3 font-display text-xl font-bold text-foreground">
            Link enviado!
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enviamos um link de recuperação para o seu e-mail. Verifique também
            a caixa de spam.
          </p>
          <Link
            to="/login"
            className="mt-5 inline-block font-display text-sm font-semibold text-green-mid"
          >
            Voltar para o login
          </Link>
        </div>
      ) : (
        <>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Recuperar senha
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Informe seu e-mail e enviaremos um link de redefinição.
          </p>
          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setEnviado(true);
            }}
          >
            <Field label="E-mail" htmlFor="e-mail-field">
              <Input
                id="e-mail-field"
                type="email"
                required
                placeholder="voce@email.com"
              />
            </Field>
            <Button variant="campo" type="submit" className="w-full">
              Enviar link
            </Button>
          </form>
          <p className="mt-5 text-center text-sm">
            <Link
              to="/login"
              className="font-display font-semibold text-green-mid"
            >
              Voltar para o login
            </Link>
          </p>
        </>
      )}
    </AuthShell>
  );
}
