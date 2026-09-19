import { describe, expect, it, vi } from 'vitest';

import { ConsentimentosHttp } from '@/services/consentimentos/consentimentos-http';

describe('ConsentimentosHttp', () => {
  it('inicia o consentimento usando a continuidade parental em cookie', async () => {
    const request = vi.fn().mockResolvedValue({ consentimentoId: 'c-1' });
    const api = new ConsentimentosHttp({ request });
    const entrada = {
      responsavel: {
        nomeCompleto: 'Maria da Silva',
        cpf: '529.982.247-25',
        dataNascimento: '1980-01-02',
        email: ' MARIA@EXEMPLO.COM ',
        relacaoComMenor: 'Mãe',
        declaraResponsabilidadeLegal: true,
      },
      senhaRevogacao: 'Senha segura 123',
      termoVersao: '2026-09',
      aceitaConsentimento: true,
    };

    await api.iniciar(entrada);

    expect(request).toHaveBeenCalledWith('/consentimentos-responsavel', {
      method: 'POST',
      credentials: 'include',
      body: {
        ...entrada,
        responsavel: { ...entrada.responsavel, email: 'maria@exemplo.com' },
      },
    });
  });

  it('consulta o estado parental com token codificado na rota', async () => {
    const request = vi
      .fn()
      .mockResolvedValue({ proximaAcao: 'ENVIAR_DOCUMENTO' });
    const api = new ConsentimentosHttp({ request });

    await api.consultarParental('token/com espaço');

    expect(request).toHaveBeenCalledWith(
      '/consentimentos-responsavel/parental/token%2Fcom%20espa%C3%A7o',
    );
  });

  it('envia o documento no campo multipart exigido sem definir Content-Type', async () => {
    const request = vi.fn().mockResolvedValue({ tentativaId: 't-1' });
    const api = new ConsentimentosHttp({ request });
    const documento = new File(['bytes'], 'documento.jpg', {
      type: 'image/jpeg',
    });

    await api.enviarDocumento('token', documento);

    const [rota, opcoes] = request.mock.calls[0] as [
      string,
      { method: string; body: FormData },
    ];
    expect(rota).toBe('/consentimentos-responsavel/parental/token/documentos');
    expect(opcoes.method).toBe('POST');
    expect(opcoes.body).toBeInstanceOf(FormData);
    expect(opcoes.body.get('documento')).toBe(documento);
    expect(opcoes).not.toHaveProperty('headers');
  });

  it('consulta os efeitos e executa a revogação com confirmação explícita', async () => {
    const request = vi.fn().mockResolvedValue({});
    const api = new ConsentimentosHttp({ request });

    await api.consultarRevogacao('token-revogacao');
    await api.revogar('token-revogacao', 'senha-secreta');

    expect(request).toHaveBeenNthCalledWith(
      1,
      '/revogacoes-consentimento/consultas',
      {
        method: 'POST',
        body: { tokenRevogacao: 'token-revogacao' },
      },
    );
    expect(request).toHaveBeenNthCalledWith(2, '/revogacoes-consentimento', {
      method: 'POST',
      body: {
        tokenRevogacao: 'token-revogacao',
        senhaRevogacao: 'senha-secreta',
        confirmacao: true,
      },
    });
  });
});
