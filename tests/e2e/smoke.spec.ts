import { expect, test } from '@playwright/test';

test('abre a aplicação na área pública sem exigir autenticação', async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.goto('/', { waitUntil: 'domcontentloaded' });

  await expect(page).toHaveURL(/\/$/);
  await expect(page).toHaveTitle(/CampoLivre LigaPro/);
  await expect(
    page.getByRole('heading', {
      name: 'Campeonatos em andamento',
    }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Entrar' }).first(),
  ).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test('renderiza as áreas principais e rotas parametrizadas sem erro', async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.goto('/login');
  await page.getByLabel('E-mail').fill('pessoa@campolivre.test');
  await page.getByLabel('Senha').fill('senha-mock');
  await page.getByRole('button', { name: 'Entrar' }).click();

  const routes = [
    '/atleta/inicio',
    '/atleta/campeonato/1',
    '/atleta/time/1',
    '/organizador/inicio',
    '/organizador/campeonato/1',
    '/prefeitura/painel',
  ];

  for (const route of routes) {
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('main')).toBeVisible();
  }

  expect(pageErrors).toEqual([]);
});
