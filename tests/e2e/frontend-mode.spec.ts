import { expect, test } from '@playwright/test';

test('@integrado modo integrado não exibe indicador de protótipo nem recorre ao login simulado', async ({
  page,
}) => {
  await page.goto('/login');
  await expect(page.getByLabel('E-mail')).toBeVisible();

  await expect(page.getByText('Modo de demonstração')).toHaveCount(0);
  await page.getByLabel('E-mail').fill('pessoa@campolivre.test');
  await page.getByLabel('Senha').fill('senha-mock');
  await page.getByRole('button', { name: 'Entrar' }).click();

  await expect(
    page.getByText(
      'Não foi possível entrar agora. Verifique sua conexão e tente novamente.',
      { exact: true },
    ),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
  expect(await page.evaluate(() => sessionStorage.length)).toBe(0);
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
});

test('@integrado consulta municípios reais por HTTP no cadastro, sem credencial', async ({
  page,
}) => {
  let consulta:
    | { pathname: string; search: string; authorization: string | undefined }
    | undefined;

  await page.route('**/api/v1/municipios**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    consulta = {
      pathname: url.pathname,
      search: url.search,
      authorization: request.headers()['authorization'],
    };
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        itens: [
          {
            id: '00000000-0000-4000-8000-000000000001',
            nome: 'Franca',
            uf: 'SP',
            codigoIbge: '3516200',
          },
        ],
        pagina: 1,
        tamanho: 100,
        totalItens: 1,
        totalPaginas: 1,
      }),
    });
  });

  await page.goto('/cadastro');

  await expect(page.getByLabel('Município')).toContainText('Franca — SP');
  expect(consulta).toEqual({
    pathname: '/api/v1/municipios',
    search: '?pagina=1&tamanho=100',
    authorization: undefined,
  });
});

test('@integrado áreas ainda simuladas falham fechadas', async ({ page }) => {
  await page.goto('/times/criar');

  await expect(
    page.getByRole('heading', { name: 'Funcionalidade ainda não integrada' }),
  ).toBeVisible();
  await expect(page.getByText('Modo de demonstração')).toHaveCount(0);
  await expect(page.getByText('Campeonatos em destaque')).toHaveCount(0);
});

test('@integrado libera somente participantes e artilharia completos do campeonato', async ({
  page,
}) => {
  const autorizacoes: Array<string | undefined> = [];
  await page.route('**/api/v1/campeonatos/camp-1/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    autorizacoes.push(request.headers()['authorization']);
    if (url.pathname.endsWith('/times')) {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          itens: [
            {
              timeId: 'time-1',
              nome: 'Leões Integrados',
              sigla: 'LEI',
              escudoUrl: null,
              statusParticipacao: 'ATIVO',
              ordemInscricao: 1,
            },
          ],
          pagina: 1,
          tamanho: 20,
          totalItens: 1,
          totalPaginas: 1,
        }),
      });
      return;
    }
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        itens: [
          {
            posicao: 1,
            jogador: {
              nome: 'João Integrado',
              nomeUsuario: 'joao',
              fotoUrl: null,
              anonimo: false,
            },
            timeContextual: {
              id: 'time-1',
              nome: 'Leões Integrados',
              sigla: 'LEI',
            },
            gols: 4,
            partidasComAtuacao: 3,
          },
        ],
        pagina: 1,
        tamanho: 20,
        totalItens: 1,
        totalPaginas: 1,
      }),
    });
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/campeonatos/camp-1/participantes');
  await expect(page.getByText('Leões Integrados')).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.goto('/campeonatos/camp-1/artilharia');
  await expect(page.getByText('João Integrado').first()).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(autorizacoes).toEqual([undefined, undefined]);
});

test('@integrado consulta campos publicamente sem credencial ou reservas', async ({
  page,
}) => {
  const autorizacoes: Array<string | undefined> = [];
  await page.route('**/api/v1/campos**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    autorizacoes.push(request.headers()['authorization']);
    if (url.pathname === '/api/v1/campos/campo-1') {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'campo-1',
          nome: 'Estádio Municipal',
          descricao: 'Campo público para partidas.',
          endereco: 'Avenida do Estádio, 100',
          municipio: { id: 'municipio-1', nome: 'Franca', uf: 'SP' },
          statusOperacional: 'ATIVO',
          prefeitura: {
            nomeOficial: 'Prefeitura Municipal de Franca',
            emailInstitucional: 'esportes@franca.sp.gov.br',
          },
          aviso:
            'Cadastro informativo; não representa reserva ou autorização de uso.',
        }),
      });
      return;
    }
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        itens: [
          {
            id: 'campo-1',
            nome: 'Estádio Municipal',
            endereco: 'Avenida do Estádio, 100',
            municipio: { id: 'municipio-1', nome: 'Franca', uf: 'SP' },
            statusOperacional: 'ATIVO',
          },
        ],
        pagina: 1,
        tamanho: 20,
        totalItens: 1,
        totalPaginas: 1,
      }),
    });
  });

  await page.goto('/campos');
  await expect(
    page.getByRole('heading', { name: 'Estádio Municipal' }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: /reservar/i })).toHaveCount(0);
  const linkCampo = page.getByRole('link', { name: 'Consultar campo' });
  await expect(linkCampo).toHaveAttribute('href', '/campos/campo-1');
  await page.goto('/campos/campo-1');
  await expect(page).toHaveURL(/\/campos\/campo-1$/);
  await expect(page.getByText(/não representa reserva/i)).toBeVisible();
  expect(autorizacoes).toEqual([undefined, undefined]);
});

test('@integrado consulta convites por HTTP sem liberar outras telas simuladas', async ({
  page,
}) => {
  let consultaConvites: {
    url: string;
    authorization: string | undefined;
  } | null = null;
  await page.route('**/api/v1/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.pathname === '/api/v1/login/renovacoes') {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          accessToken: 'access-integrado',
          tokenTipo: 'Bearer',
          accessTokenExpiraEm: '2030-01-01T00:15:00.000Z',
          refreshToken: null,
          refreshTokenExpiraEm: '2030-01-30T00:00:00.000Z',
        }),
      });
      return;
    }
    if (url.pathname === '/api/v1/minha-conta') {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'conta-integrada-1',
          nome: 'Ana Souza',
          nomeUsuario: 'anasouza',
          email: 'ana@campolivre.test',
          emailPendente: null,
          emailConfirmado: true,
          telefone: null,
          cpf: '00000000000',
          rg: { numero: '000000000', orgaoExpedidor: 'SSP', uf: 'SP' },
          dataNascimento: '1997-01-01',
          idade: 29,
          municipio: { id: 'municipio-franca', nome: 'Franca', uf: 'SP' },
          fotoUrl: null,
          biografia: null,
          posicaoPrincipal: null,
          status: 'ATIVA',
          organizadorHabilitado: false,
          administrador: false,
          criadoEm: '2026-01-01T00:00:00.000Z',
          atualizadoEm: '2026-01-01T00:00:00.000Z',
        }),
      });
      return;
    }
    if (url.pathname === '/api/v1/minha-conta/convites-time') {
      consultaConvites = {
        url: request.url(),
        authorization: request.headers()['authorization'],
      };
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          itens: [
            {
              id: 'convite-integrado-1',
              time: {
                id: 'time-1',
                nome: 'Leões FC',
                sigla: 'LEO',
                escudoUrl: null,
              },
              remetente: { nome: 'Rafael Lima', nomeUsuario: 'rafaellima' },
              expiraEm: '2030-01-07T12:00:00.000Z',
            },
          ],
          pagina: 1,
          tamanho: 20,
          totalItens: 1,
          totalPaginas: 1,
        }),
      });
      return;
    }
    await route.abort();
  });

  await page.goto('/atleta/time/buscar');

  await expect(page.getByRole('heading', { name: 'Leões FC' })).toBeVisible();
  expect(consultaConvites).not.toBeNull();
  expect(new URL(consultaConvites!.url).search).toBe('?pagina=1&tamanho=20');
  expect(consultaConvites!.authorization).toBe('Bearer access-integrado');
  await expect(
    page.getByRole('heading', { name: 'Funcionalidade ainda não integrada' }),
  ).toHaveCount(0);

  await page.goto('/atleta/inicio');
  await expect(
    page.getByRole('heading', { name: 'Olá, Ana Souza' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Funcionalidade ainda não integrada' }),
  ).toHaveCount(0);

  await page.goto('/atleta/campeonato/camp-1');
  await expect(
    page.getByRole('heading', { name: 'Funcionalidade ainda não integrada' }),
  ).toBeVisible();
});
