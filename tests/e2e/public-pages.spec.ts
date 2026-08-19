import { expect, test } from '@playwright/test';

test('rotas públicas abrem sem sessão e possuem links compartilháveis', async ({
  page,
}) => {
  const routes = [
    '/campeonatos',
    '/campeonatos/1',
    '/times',
    '/times/1',
    '/partidas',
    '/partidas/1',
  ];

  for (const route of routes) {
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(new RegExp(`${route.replace('/', '\\/')}$`));
    await expect(
      page.getByRole('button', { name: 'Abrir menu público' }),
    ).toBeVisible();
  }

  const session = await page.evaluate(() =>
    sessionStorage.getItem('campo-livre:mock-personal-session'),
  );
  expect(session).toBeNull();
});

test('menu público é opcional e pode ser aberto e fechado', async ({
  page,
}) => {
  await page.goto('/campeonatos');

  await expect(
    page.getByRole('navigation', { name: 'Navegação pública' }),
  ).toHaveCount(0);
  await page.getByRole('button', { name: 'Abrir menu público' }).click();
  await expect(
    page.getByRole('navigation', { name: 'Navegação pública' }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Campeonatos' })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await page.getByRole('button', { name: 'Fechar menu lateral' }).click();
  await expect(
    page.getByRole('navigation', { name: 'Navegação pública' }),
  ).toHaveCount(0);
});

test('conta autenticada usa a mesma página canônica com acesso à sua área', async ({
  page,
}) => {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill('pessoa@campolivre.test');
  await page.getByLabel('Senha').fill('senha-mock');
  await page.getByRole('button', { name: 'Entrar' }).click();

  await page.goto('/campeonatos/1');

  await expect(
    page.getByRole('heading', { name: 'Copa Franca 2026' }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Minha área' })).toBeVisible();
  await expect(page.getByText('Próximo jogo')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Criar conta' })).toHaveCount(0);
});

test('campeonato público mostra classificação e resultados sem dados pessoais', async ({
  page,
}) => {
  await page.goto('/campeonatos/1');

  await expect(
    page.getByRole('heading', { name: 'Copa Franca 2026' }),
  ).toBeVisible();
  await expect(page.getByText('Marcos Oliveira')).toHaveCount(0);
  await expect(page.getByText('João Silva')).toHaveCount(0);

  await page.getByRole('tab', { name: 'Classificação' }).click();
  await expect(page.getByRole('table')).toBeVisible();
});

test('classificação pública permanece legível sem estourar a página no mobile', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/campeonatos/1');
  await page.getByRole('tab', { name: 'Classificação' }).click();

  await expect(page.getByRole('table')).toBeVisible();

  const pageOverflows = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(pageOverflows).toBe(false);
});

test('times públicos não expõem elenco nem dados pessoais de atletas', async ({
  page,
}) => {
  await page.goto('/times/1');

  await expect(page.getByRole('heading', { name: 'Time A' })).toBeVisible();
  await expect(
    page.getByText('Elenco e dados pessoais de atletas não são exibidos'),
  ).toBeVisible();
  await expect(page.getByText('Marcos Oliveira')).toHaveCount(0);
});

test('prevê estados vazio e erro nas consultas públicas', async ({ page }) => {
  await page.goto('/campeonatos');
  await page.getByPlaceholder('Buscar campeonatos...').fill('inexistente xyz');
  await expect(
    page.getByRole('heading', { name: 'Nenhum campeonato encontrado' }),
  ).toBeVisible();

  await page.goto('/campeonatos/999');
  await expect(
    page.getByRole('heading', { name: 'Campeonato não encontrado' }),
  ).toBeVisible();
});
