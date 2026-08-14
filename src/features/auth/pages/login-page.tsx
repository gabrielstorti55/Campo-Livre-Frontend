import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

import { AuthShell } from '@/features/auth/components/auth-shell';
import { Field } from '@/shared/components/campo-livre-ui';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

export function LoginPage() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState('atleta');

  return (
    <AuthShell>
      <div className="mb-8">
        <p className="mb-3 text-xs font-semibold tracking-[0.14em] text-green-dark uppercase">
          Área do participante
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-[-0.025em] text-foreground">
          Acesse sua conta
        </h1>
        <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
          Entre com seus dados para acompanhar times, partidas e campeonatos.
        </p>
      </div>

      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          navigate(
            perfil === 'organizador'
              ? '/organizador/inicio'
              : perfil === 'prefeitura'
                ? '/prefeitura/painel'
                : '/atleta/inicio',
          );
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

        <div>
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
          <div className="mt-2 text-right">
            <Link
              to="/recuperar-senha"
              className="text-sm font-medium text-green-dark underline-offset-4 hover:underline"
            >
              Esqueci minha senha
            </Link>
          </div>
        </div>

        <Field label="Perfil" htmlFor="perfil-field">
          <Select value={perfil} onValueChange={setPerfil}>
            <SelectTrigger id="perfil-field" className="h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="atleta">Atleta / Capitão</SelectItem>
              <SelectItem value="organizador">Organizador</SelectItem>
              <SelectItem value="prefeitura">Prefeitura</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Button variant="campo" type="submit" className="mt-2 h-11 w-full">
          Entrar
        </Button>
      </form>

      <div className="mt-8 border-t border-border pt-6">
        <p className="text-sm text-muted-foreground">
          Ainda não participa do CampoLivre?
        </p>
        <Link
          to="/cadastro"
          className="mt-2 inline-flex text-sm font-semibold text-green-dark underline-offset-4 hover:underline"
        >
          Criar conta
        </Link>
      </div>
    </AuthShell>
  );
}
