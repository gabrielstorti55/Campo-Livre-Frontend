import { expect, test } from '@playwright/test';

import { preaquecerRota } from './fixtures/autenticacao';

test('login inválido usa mensagem neutra e não cria sessão persistida', async ({
  page,
}) => {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill('inexistente@campolivre.test');
  await page.getByLabel('Senha').fill('senha-errada');
  await page.getByRole('button', { name: 'Entrar' }).click();

  await expect(page.getByText('E-mail ou senha inválidos.')).toHaveText(
    'E-mail ou senha inválidos.',
  );
  expect(await page.evaluate(() => sessionStorage.length)).toBe(0);
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
});

test('login mantém credenciais somente em memória e abre a conta privada', async ({
  page,
}) => {
  await preaquecerRota(page, '/minha-conta');
  await page.goto('/login');
  await page.getByLabel('E-mail').fill('sem-time@campolivre.test');
  await page.getByLabel('Senha').fill('senha-mock');
  await page.getByRole('button', { name: 'Entrar' }).click();

  await expect(page).toHaveURL(/\/minha-area$/);
  await page.getByRole('link', { name: 'Consultar dados da conta' }).click();
  await expect(
    page.getByRole('heading', { name: 'Minha conta' }),
  ).toBeVisible();
  await expect(page.getByText('•••••••••11')).toBeVisible();
  await expect(page.getByText('•••••••11 · SSP/SP')).toBeVisible();
  expect(await page.evaluate(() => sessionStorage.length)).toBe(0);
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
});

test('rota privada preserva somente retorno interno seguro', async ({
  page,
}) => {
  test.setTimeout(90_000);
  await page.goto('/atleta/perfil');
  await expect(page).toHaveURL(/\/login\?returnTo=%2Fatleta%2Fperfil$/, {
    timeout: 45_000,
  });

  await page.getByLabel('E-mail').fill('pessoa@campolivre.test');
  await page.getByLabel('Senha').fill('senha-mock');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/atleta\/perfil$/);
});

test('destino externo de retorno é ignorado', async ({ page }) => {
  await page.goto('/login?returnTo=https%3A%2F%2Fmalicioso.test');
  await page.getByLabel('E-mail').fill('sem-time@campolivre.test');
  await page.getByLabel('Senha').fill('senha-mock');
  await page.getByRole('button', { name: 'Entrar' }).click();

  await expect(page).toHaveURL(/\/minha-area$/);
});
