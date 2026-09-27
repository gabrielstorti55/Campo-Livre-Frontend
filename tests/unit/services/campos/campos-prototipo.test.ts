import { describe, expect, it } from 'vitest';

import { CamposPrototipo } from '@/services/campos/campos-prototipo';

describe('CamposPrototipo como porta de gestão', () => {
  it('atualiza dados e estado operacional no mesmo catálogo consultado pela tela', async () => {
    const api = new CamposPrototipo();

    const atualizado = await api.atualizarCampo(
      'campo-prototipo-1',
      'token-prototipo',
      { nome: 'Estádio Municipal Renovado' },
    );
    expect(atualizado.nome).toBe('Estádio Municipal Renovado');

    const estado = await api.alterarEstadoOperacional(
      'campo-prototipo-1',
      'token-prototipo',
      {
        statusOperacional: 'EM_MANUTENCAO',
        motivo: 'Reparo do gramado',
        confirmacao: true,
      },
    );
    expect(estado).toMatchObject({
      id: 'campo-prototipo-1',
      estadoAnterior: 'ATIVO',
      statusOperacional: 'EM_MANUTENCAO',
      alterado: true,
    });

    await expect(
      api.consultarCampo('campo-prototipo-1'),
    ).resolves.toMatchObject({
      nome: 'Estádio Municipal Renovado',
      statusOperacional: 'EM_MANUTENCAO',
    });
  });
});
