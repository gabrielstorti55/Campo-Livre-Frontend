import { expect, test } from '@playwright/test';

async function loginAsAthlete(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill('pessoa@campolivre.test');
  await page.getByLabel('Senha').fill('senha-mock');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/atleta\/inicio$/);
}

async function loginAsMunicipality(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill('prefeitura@campolivre.test');
  await page.getByLabel('Senha').fill('senha-mock');
  await page.getByRole('button', { name: 'Entrar' }).click();
}

test('usa um cabeçalho de página semântico nas áreas autenticadas', async ({
  page,
}) => {
  await loginAsAthlete(page);
  await page.goto('/atleta/perfil');

  await expect(
    page.getByRole('heading', { level: 1, name: 'Marcos Oliveira' }),
  ).toBeVisible();
});

test('propaga a identidade editorial para o shell autenticado', async ({
  page,
}) => {
  await loginAsAthlete(page);

  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('body')).toHaveCSS('font-family', /IBM Plex Sans/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveCSS(
    'font-family',
    /Barlow Condensed/,
  );
  await expect(page.locator('body')).toHaveCSS(
    'background-color',
    'rgb(245, 241, 230)',
  );

  const menuButton = page.getByRole('button', { name: 'Abrir menu' });
  const radius = Number.parseFloat(
    await menuButton.evaluate(
      (element) => getComputedStyle(element).borderRadius,
    ),
  );
  expect(radius).toBeLessThanOrEqual(8);
  await menuButton.click();

  const dialog = page.getByRole('dialog', { name: 'Menu principal' });
  await expect(dialog.locator('img[src="/soccer-field.jpg"]')).toHaveCount(0);
  await expect(dialog.getByText('LigaPro', { exact: true })).toHaveCount(0);
});

test('libera toda a largura e oferece o menu principal no cabeçalho móvel', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await loginAsAthlete(page);
  await page.goto('/atleta/inicio');

  const main = page.getByRole('main');
  const mainBox = await main.boundingBox();

  expect(mainBox?.x).toBe(0);
  expect(mainBox?.width).toBe(390);

  await page.getByRole('button', { name: 'Abrir menu' }).click();
  await expect(
    page.getByRole('dialog', { name: 'Menu principal' }),
  ).toBeVisible();
  await expect(
    page.getByRole('navigation', { name: 'Navegação principal' }),
  ).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Abrir menu' })).toBeFocused();
});

test('oferece atalho de teclado para o conteúdo principal', async ({
  page,
}) => {
  await loginAsMunicipality(page);
  await page.goto('/prefeitura/painel');
  await page.keyboard.press('Tab');

  const skipLink = page.getByRole('link', {
    name: 'Ir para o conteúdo principal',
  });
  await expect(skipLink).toBeFocused();
  await skipLink.press('Enter');
  await expect(page).toHaveURL(/#conteudo-principal$/);
});

test('mantém títulos completos quando o cabeçalho móvel possui ação', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await loginAsMunicipality(page);
  await page.goto('/prefeitura/campos');

  const title = page.getByRole('heading', {
    level: 1,
    name: 'Campos cadastrados',
  });
  await expect(title).toBeVisible();
  await expect(title).toHaveCSS('text-overflow', 'clip');
});

test('oferece uma saída segura em rotas inexistentes', async ({ page }) => {
  await page.goto('/rota-inexistente');

  const backLink = page.getByRole('link', { name: 'Voltar ao acesso' });
  await expect(backLink).toBeVisible();
  await backLink.click();
  await expect(page).toHaveURL(/\/login$/);
});
