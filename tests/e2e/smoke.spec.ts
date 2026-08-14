import { expect, test } from '@playwright/test';

test('abre a aplicação na tela de login sem erro de página', async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.goto('/', { waitUntil: 'domcontentloaded' });

  await expect(page).toHaveURL(/\/login$/);
  await expect(page).toHaveTitle(/CampoLivre LigaPro/);
  await expect(
    page.getByRole('heading', { name: 'Acesse sua conta' }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test('renderiza as áreas principais e rotas parametrizadas sem erro', async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

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
