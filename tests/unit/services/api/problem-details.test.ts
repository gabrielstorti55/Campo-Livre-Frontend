import { describe, expect, it } from 'vitest';

import {
  mapearErrosDeCampo,
  normalizarProblemDetails,
} from '@/services/api/problem-details';

describe('normalizarProblemDetails', () => {
  it('preserva somente campos reconhecidos de uma resposta RFC 9457', () => {
    expect(
      normalizarProblemDetails({
        type: 'https://campolivre.app/problemas/credenciais-invalidas',
        title: 'Credenciais inválidas',
        status: 401,
        detail: 'E-mail ou senha inválidos.',
        codigo: 'CREDENCIAIS_INVALIDAS',
        segredoInterno: 'não pode vazar',
        erros: [{ campo: 'email', mensagem: 'Inválido' }],
      }),
    ).toEqual({
      type: 'https://campolivre.app/problemas/credenciais-invalidas',
      title: 'Credenciais inválidas',
      status: 401,
      detail: 'E-mail ou senha inválidos.',
      codigo: 'CREDENCIAIS_INVALIDAS',
      erros: [{ campo: 'email', mensagem: 'Inválido' }],
    });
  });

  it('produz um problema seguro quando o corpo é inválido', () => {
    expect(normalizarProblemDetails('<html>erro</html>', 503)).toEqual({
      type: 'about:blank',
      title: 'Não foi possível concluir a solicitação',
      status: 503,
      codigo: 'RESPOSTA_INVALIDA',
    });
  });

  it('mapeia somente erros pertencentes aos campos conhecidos da tela', () => {
    const problema = normalizarProblemDetails({
      status: 400,
      codigo: 'DADOS_INVALIDOS',
      erros: [
        { campo: 'email', mensagem: 'Informe um e-mail válido.' },
        { campo: 'senha', mensagem: 'A senha é obrigatória.' },
        { campo: 'campoInterno', mensagem: 'Não deve aparecer.' },
      ],
    });

    expect(mapearErrosDeCampo(problema, ['email', 'senha'] as const)).toEqual({
      email: 'Informe um e-mail válido.',
      senha: 'A senha é obrigatória.',
    });
  });
});
