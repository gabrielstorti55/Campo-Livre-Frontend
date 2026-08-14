import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';

import { AuthShell } from '@/features/auth/components/auth-shell';
import { Field } from '@/shared/components/campo-livre-ui';
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
      <h1 className="font-display text-2xl font-bold text-foreground">
        Bem-vindo!
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Entre para acompanhar seus campeonatos.
      </p>

      <form
        className="mt-6 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
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
        <Field label="Entrar como" htmlFor="entrar-como-field">
          <Select value={perfil} onValueChange={setPerfil}>
            <SelectTrigger id="entrar-como-field">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="atleta">Atleta / Capitão</SelectItem>
              <SelectItem value="organizador">Organizador</SelectItem>
              <SelectItem value="prefeitura">Prefeitura</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Button variant="campo" type="submit" className="w-full">
          Entrar
        </Button>
      </form>

      <div className="mt-5 flex items-center justify-between text-sm">
        <Link
          to="/cadastro"
          className="font-display font-semibold text-green-mid"
        >
          Criar minha conta
        </Link>
        <Link
          to="/recuperar-senha"
          className="text-muted-foreground hover:text-foreground"
        >
          Esqueceu a senha?
        </Link>
      </div>
    </AuthShell>
  );
}
