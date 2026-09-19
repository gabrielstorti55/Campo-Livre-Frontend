import { describe, expect, it, vi } from 'vitest';

import { AdministracaoGlobalHttp } from '@/services/administracao-global/administracao-global-http';

describe('AdministracaoGlobalHttp', () => {
  it('lista administradores com paginação e somente filtros preenchidos', async () => {
    const request = vi.fn().mockResolvedValue({ itens: [] });
    const api = new AdministracaoGlobalHttp({ request });

    await api.listarAdministradores('token', {
      pagina: 2,
      tamanho: 20,
      nome: '  Maria Silva  ',
      email: '   ',
    });

    expect(request).toHaveBeenCalledWith(
      '/administradores?pagina=2&tamanho=20&nome=Maria+Silva',
      { accessToken: 'token' },
    );
  });

  it('busca conta elegível pelo e-mail exato codificado', async () => {
    const request = vi.fn().mockResolvedValue({ itens: [] });
    const api = new AdministracaoGlobalHttp({ request });

    await api.buscarUsuarioPorEmail('pessoa+teste@example.test', 'token');

    expect(request).toHaveBeenCalledWith(
      '/usuarios/busca-institucional?email=pessoa%2Bteste%40example.test',
      { accessToken: 'token' },
    );
  });

  it('bloqueia com o corpo estrito publicado', async () => {
    const request = vi.fn().mockResolvedValue({ usuarioId: 'usuario-2' });
    const api = new AdministracaoGlobalHttp({ request });

    await api.bloquearUsuario(
      'usuario-2',
      { categoria: 'FRAUDE', motivo: '  Evidência confirmada  ' },
      'token',
    );

    expect(request).toHaveBeenCalledWith('/usuarios/usuario-2/bloqueio', {
      method: 'POST',
      accessToken: 'token',
      body: {
        categoria: 'FRAUDE',
        motivo: 'Evidência confirmada',
        confirmacao: true,
      },
    });
  });

  it('desbloqueia com justificativa e confirmação explícita', async () => {
    const request = vi.fn().mockResolvedValue({ usuarioId: 'usuario-2' });
    const api = new AdministracaoGlobalHttp({ request });

    await api.desbloquearUsuario('usuario-2', '  Revisão concluída  ', 'token');

    expect(request).toHaveBeenCalledWith('/usuarios/usuario-2/desbloqueio', {
      method: 'POST',
      accessToken: 'token',
      body: { justificativa: 'Revisão concluída', confirmacao: true },
    });
  });

  it('concede autoridade com confirmação explícita', async () => {
    const request = vi.fn().mockResolvedValue({ usuarioId: 'usuario-2' });
    const api = new AdministracaoGlobalHttp({ request });

    await api.concederAdministrador('usuario-2', 'token');

    expect(request).toHaveBeenCalledWith('/usuarios/usuario-2/administrador', {
      method: 'POST',
      accessToken: 'token',
      body: { confirmacao: true },
    });
  });

  it('revoga autoridade com justificativa e confirmação explícita', async () => {
    const request = vi.fn().mockResolvedValue({ usuarioId: 'usuario-2' });
    const api = new AdministracaoGlobalHttp({ request });

    await api.revogarAdministrador(
      'usuario-2',
      '  Mudança de função  ',
      'token',
    );

    expect(request).toHaveBeenCalledWith(
      '/usuarios/usuario-2/revogacao-administrador',
      {
        method: 'POST',
        accessToken: 'token',
        body: { justificativa: 'Mudança de função', confirmacao: true },
      },
    );
  });

  it('lista Prefeituras com filtros administrativos', async () => {
    const request = vi.fn().mockResolvedValue({ itens: [] });
    const api = new AdministracaoGlobalHttp({ request });
    await api.listarPrefeituras('token', {
      nome: ' Franca ',
      uf: 'SP',
      pagina: 2,
    });
    expect(request).toHaveBeenCalledWith(
      '/prefeituras?pagina=2&tamanho=20&nome=Franca&uf=SP',
      { accessToken: 'token' },
    );
  });

  it('cria Prefeitura com idempotência e dados estritos', async () => {
    const request = vi.fn().mockResolvedValue({ id: 'pref-1' });
    const api = new AdministracaoGlobalHttp({ request });
    const entrada = {
      municipioId: 'municipio-1',
      nomeOficial: 'Prefeitura de Franca',
      cnpj: null,
      emailContatoPublico: 'esporte@example.test',
      telefoneContatoPublico: null,
      responsavelInicialUsuarioId: 'usuario-1',
    };
    await api.criarPrefeitura(entrada, 'token', 'idempotency-key');
    expect(request).toHaveBeenCalledWith('/prefeituras', {
      method: 'POST',
      accessToken: 'token',
      headers: { 'Idempotency-Key': 'idempotency-key' },
      body: entrada,
    });
  });

  it('edita apenas os campos administrativos enviados', async () => {
    const request = vi.fn().mockResolvedValue({ id: 'pref-1' });
    const api = new AdministracaoGlobalHttp({ request });
    await api.editarPrefeitura('pref-1', { nomeOficial: 'Novo nome' }, 'token');
    expect(request).toHaveBeenCalledWith('/prefeituras/pref-1', {
      method: 'PATCH',
      accessToken: 'token',
      body: { nomeOficial: 'Novo nome' },
    });
  });
});
