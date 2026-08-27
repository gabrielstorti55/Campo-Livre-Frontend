import { describe, expect, it } from 'vitest';

import { criarApisAplicacao } from '@/layouts/provedores-aplicacao';
import { AutenticacaoHttp } from '@/services/autenticacao/autenticacao-http';
import { CamposHttp } from '@/services/campos/campos-http';
import { TimesHttp } from '@/services/times/times-http';

describe('criarApisAplicacao', () => {
  it('seleciona somente adapters HTTP no modo integrado', () => {
    const apis = criarApisAplicacao('integrado');

    expect(apis.autenticacao).toBeInstanceOf(AutenticacaoHttp);
    expect(apis.times).toBeInstanceOf(TimesHttp);
    expect(apis.campos).toBeInstanceOf(CamposHttp);
  });

  it('compartilha somente em memória a identidade do protótipo', async () => {
    const apis = criarApisAplicacao('prototipo');
    const login = await apis.autenticacao.login({
      email: 'sem-time@campolivre.test',
      senha: 'senha-mock',
      plataforma: 'WEB',
    });

    const pagina = await apis.times.listarMeusConvites(
      login.accessToken,
      1,
      20,
    );

    expect(pagina.itens[0]?.time.nome).toBe('Leões FC');
  });
});
