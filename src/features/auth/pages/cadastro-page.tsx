import { Link, useNavigate } from 'react-router-dom';
import { Shirt, Trophy } from 'lucide-react';
import { useState } from 'react';

import {
  Field,
  OutlineButton,
  PrimaryButton,
} from '@/shared/components/campo-livre-ui';
import { AuthShell } from '@/features/auth/components/auth-shell';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { cn } from '@/shared/lib/utils';

export function CadastroPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [perfil, setPerfil] = useState<'atleta' | 'organizador'>('atleta');

  return (
    <AuthShell>
      <h1 className="font-display text-2xl font-bold text-foreground">
        Criar conta
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Passo {step} de 2 — {step === 1 ? 'escolha seu perfil' : 'seus dados'}
      </p>

      {step === 1 ? (
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                { key: 'atleta', label: 'Atleta', icon: Shirt },
                { key: 'organizador', label: 'Organizador', icon: Trophy },
              ] as const
            ).map((opt) => {
              const Icon = opt.icon;
              const selected = perfil === opt.key;
              return (
                <Button
                  key={opt.key}
                  type="button"
                  variant="outline"
                  aria-pressed={selected}
                  onClick={() => setPerfil(opt.key)}
                  className={cn(
                    'h-auto min-h-28 flex-col gap-2 rounded-2xl p-5 text-center',
                    selected
                      ? 'border-green-mid bg-green-pale hover:bg-green-pale'
                      : 'bg-white hover:border-green-light',
                  )}
                >
                  <Icon className="h-7 w-7 text-green-dark" />
                  <span className="font-display text-sm font-semibold text-foreground">
                    {opt.label}
                  </span>
                </Button>
              );
            })}
          </div>
          <PrimaryButton className="w-full" onClick={() => setStep(2)}>
            Continuar
          </PrimaryButton>
        </div>
      ) : (
        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            navigate(
              perfil === 'organizador'
                ? '/organizador/inicio'
                : '/atleta/inicio',
            );
          }}
        >
          <Field label="Nome completo">
            <Input required placeholder="Seu nome" />
          </Field>
          <Field label="E-mail">
            <Input type="email" required placeholder="voce@email.com" />
          </Field>
          <Field label="Senha">
            <Input type="password" required placeholder="••••••••" />
          </Field>
          <Field label="Confirmar senha">
            <Input type="password" required placeholder="••••••••" />
          </Field>
          <Field label="Cidade">
            <Input required placeholder="Franca, SP" />
          </Field>
          <div className="flex gap-3">
            <OutlineButton
              type="button"
              className="flex-1"
              onClick={() => setStep(1)}
            >
              Voltar
            </OutlineButton>
            <PrimaryButton type="submit" className="flex-1">
              Criar conta
            </PrimaryButton>
          </div>
        </form>
      )}

      <p className="mt-5 text-center text-sm text-muted-foreground">
        Já tenho conta{' '}
        <Link to="/login" className="font-display font-semibold text-green-mid">
          Entrar
        </Link>
      </p>
    </AuthShell>
  );
}
