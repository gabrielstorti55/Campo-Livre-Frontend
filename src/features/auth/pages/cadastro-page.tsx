import { Link, useNavigate } from 'react-router-dom';
import { Shirt, Trophy } from 'lucide-react';
import { useState } from 'react';

import { Field } from '@/shared/components/campo-livre-ui';
import { AuthShell } from '@/features/auth/components/auth-shell';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
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
          <RadioGroup
            value={perfil}
            onValueChange={(value) => setPerfil(value as typeof perfil)}
            aria-label="Escolha seu perfil"
            className="grid grid-cols-2 gap-3"
          >
            {(
              [
                { key: 'atleta', label: 'Atleta', icon: Shirt },
                { key: 'organizador', label: 'Organizador', icon: Trophy },
              ] as const
            ).map((opt) => {
              const Icon = opt.icon;
              return (
                <RadioGroupItem
                  key={opt.key}
                  value={opt.key}
                  aria-label={opt.label}
                  className={cn(
                    'h-auto min-h-28 w-auto flex-col gap-2 rounded-2xl border p-5 text-center shadow-none',
                    'data-[state=checked]:border-green-mid data-[state=checked]:bg-green-pale',
                    'data-[state=unchecked]:bg-white data-[state=unchecked]:hover:border-green-light',
                  )}
                >
                  <Icon className="h-7 w-7 text-green-dark" />
                  <span className="font-display text-sm font-semibold text-foreground">
                    {opt.label}
                  </span>
                </RadioGroupItem>
              );
            })}
          </RadioGroup>
          <Button variant="campo" className="w-full" onClick={() => setStep(2)}>
            Continuar
          </Button>
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
          <Field label="Nome completo" htmlFor="nome-completo-field">
            <Input id="nome-completo-field" required placeholder="Seu nome" />
          </Field>
          <Field label="E-mail" htmlFor="e-mail-field">
            <Input
              id="e-mail-field"
              type="email"
              required
              placeholder="voce@email.com"
            />
          </Field>
          <Field label="Senha" htmlFor="senha-field">
            <Input
              id="senha-field"
              type="password"
              required
              placeholder="••••••••"
            />
          </Field>
          <Field label="Confirmar senha" htmlFor="confirmar-senha-field">
            <Input
              id="confirmar-senha-field"
              type="password"
              required
              placeholder="••••••••"
            />
          </Field>
          <Field label="Cidade" htmlFor="cidade-field">
            <Input id="cidade-field" required placeholder="Franca, SP" />
          </Field>
          <div className="flex gap-3">
            <Button
              variant="campoOutline"
              type="button"
              className="flex-1"
              onClick={() => setStep(1)}
            >
              Voltar
            </Button>
            <Button variant="campo" type="submit" className="flex-1">
              Criar conta
            </Button>
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
