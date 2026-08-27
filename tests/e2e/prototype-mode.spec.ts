import { expect, test } from '@playwright/test';

test('@prototipo modo protótipo é identificado antes de permitir uma jornada simulada', async ({
  page,
}) => {
  await page.goto('/login');

  const indicator = page.getByRole('status');
  await expect(indicator).toContainText('Modo de demonstração');
  await expect(indicator).toContainText('Dados simulados e não persistidos');

  await page.getByLabel('E-mail').fill('sem-time@campolivre.test');
  await page.getByLabel('Senha').fill('senha-mock');
  await page.getByRole('button', { name: 'Entrar' }).click();

  await expect(page).toHaveURL(/\/minha-area$/);
});
