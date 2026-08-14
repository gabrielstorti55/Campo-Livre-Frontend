import { expect, test } from '@playwright/test';

test('usa um cabeçalho de página semântico nas áreas autenticadas', async ({
  page,
}) => {
  await page.goto('/atleta/inicio');

  await expect(
    page.getByRole('heading', { level: 1, name: 'Marcos Oliveira' }),
  ).toBeVisible();
});

test('libera toda a largura para o conteúdo e fixa a navegação no rodapé móvel', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/atleta/inicio');

  const main = page.getByRole('main');
  const navigation = page.getByRole('navigation', {
    name: 'Navegação principal',
  });

  const mainBox = await main.boundingBox();
  const navigationBox = await navigation.boundingBox();

  expect(mainBox?.x).toBe(0);
  expect(mainBox?.width).toBe(390);
  expect(navigationBox?.x).toBe(0);
  expect(navigationBox?.width).toBe(390);
  expect(
    (navigationBox?.y ?? 0) + (navigationBox?.height ?? 0),
  ).toBeGreaterThanOrEqual(840);
});

test('oferece atalho de teclado para o conteúdo principal', async ({
  page,
}) => {
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
