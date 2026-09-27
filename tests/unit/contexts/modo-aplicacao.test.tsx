import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AvisoDadosDemonstrativos } from '@/components/layout/aviso-dados-demonstrativos';
import {
  ProvedorModoAplicacao,
  useModoAplicacao,
} from '@/contexts/modo-aplicacao';

function LeitorModo() {
  const modo = useModoAplicacao();
  return <p>Modo atual: {modo}</p>;
}

describe('experiência híbrida', () => {
  it('expõe o modo atual para telas compartilhadas', () => {
    render(
      <ProvedorModoAplicacao modo="hibrido">
        <LeitorModo />
      </ProvedorModoAplicacao>,
    );

    expect(screen.getByText('Modo atual: hibrido')).toBeVisible();
  });

  it('identifica dados demonstrativos dentro da própria tela híbrida', () => {
    render(
      <ProvedorModoAplicacao modo="hibrido">
        <AvisoDadosDemonstrativos />
      </ProvedorModoAplicacao>,
    );

    expect(screen.getByRole('note')).toHaveTextContent('Dados demonstrativos');
  });

  it('não adiciona o aviso local a uma tela totalmente integrada', () => {
    render(
      <ProvedorModoAplicacao modo="integrado">
        <AvisoDadosDemonstrativos />
      </ProvedorModoAplicacao>,
    );

    expect(screen.queryByRole('note')).toBeNull();
  });
});
