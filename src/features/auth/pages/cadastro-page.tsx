import { Link, useNavigate } from 'react-router-dom';
import { Shirt, Trophy } from 'lucide-react';
import { useState } from 'react';

import { AuthShell } from '@/features/auth/components/auth-shell';
import { Field } from '@/shared/components/campo-livre-ui';
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
      <p className="mb-3 text-xs font-semibold tracking-[0.14em] text-green-dark uppercase">
        Novo participante
      </p>
      <h1 className="font-display text-3xl font-semibold tracking-[-0.025em] text-foreground">
        Crie sua conta
      </h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Passo {step} de 2 — {step === 1 ? 'escolha seu perfil' : 'seus dados'}
      </p>

      {step === 1 ? (
        <div className="mt-8 space-y-5">
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
            ).map((option) => {
              const Icon = option.icon;
              return (
                <RadioGroupItem
                  key={option.key}
                  value={option.key}
                  aria-label={option.label}
                  className={cn(
                    'flex h-auto min-h-24 w-auto flex-col items-center justify-center gap-2 rounded-md border p-4 text-center shadow-none',
                    'data-[state=checked]:border-green-mid data-[state=checked]:bg-green-pale',
                    'data-[state=unchecked]:bg-white data-[state=unchecked]:hover:border-green-light',
                  )}
                >
                  <Icon className="h-6 w-6 text-green-dark" />
                  <span className="font-display text-sm font-semibold text-foreground">
                    {option.label}
                  </span>
                </RadioGroupItem>
              );
            })}
          </RadioGroup>
          <Button
            variant="campo"
            className="h-11 w-full"
            onClick={() => setStep(2)}
          >
            Continuar
          </Button>
        </div>
      ) : (
        <form
          className="mt-8 space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            navigate(
              perfil === 'organizador'
                ? '/organizador/inicio'
                : '/atleta/inicio',
            );
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
          <div className="flex gap-3">
            <Button
              variant="campoOutline"
              type="button"
              className="h-11 flex-1"
              onClick={() => setStep(1)}
            >
              Voltar
            </Button>
            <Button variant="campo" type="submit" className="h-11 flex-1">
              Criar conta
            </Button>
          </div>
        </form>
      )}

      <p className="mt-8 border-t border-border pt-6 text-sm text-muted-foreground">
        Já participa do CampoLivre?{' '}
        <Link to="/login" className="font-display font-semibold text-green-mid">
          Acessar minha conta
        </Link>
      </p>
    </AuthShell>
  );
}
