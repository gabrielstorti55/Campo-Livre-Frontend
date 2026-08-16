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
      page.getByRole('navigation', { name: 'Navegação pública' }),
    ).toBeVisible();
  }

  const session = await page.evaluate(() =>
    sessionStorage.getItem('campo-livre:mock-personal-session'),
  );
  expect(session).toBeNull();
});

test('sidebar pública pode ser recolhida e expandida no desktop', async ({
  page,
}) => {
  await page.goto('/campeonatos');

  const sidebar = page.locator('aside').filter({ hasText: 'CampoLivre' }).first();
  await expect(sidebar).toBeVisible();

  await page.getByRole('button', { name: 'Recolher menu lateral' }).click();
  await expect(
    page.getByRole('button', { name: 'Expandir menu lateral' }),
  ).toBeVisible();

  await page.getByRole('button', { name: 'Expandir menu lateral' }).click();
  await expect(
    page.getByRole('button', { name: 'Recolher menu lateral' }),
  ).toBeVisible();
});

test('menu público abre como drawer no mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/times');

  await page.getByRole('button', { name: 'Abrir menu' }).click();
  await expect(
    page.getByRole('navigation', { name: 'Navegação pública móvel' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Partidas' }).last().click();
  await expect(page).toHaveURL(/\/partidas$/);
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
