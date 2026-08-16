import { expect, test } from '@playwright/test';

test('cadastro público cria conta pessoal sem escolher perfil global', async ({
  page,
}) => {
  await page.goto('/cadastro');

  await expect(
    page.getByRole('heading', { name: 'Crie sua conta' }),
  ).toBeVisible();
  await expect(page.getByText('Nova conta pessoal')).toBeVisible();
  await expect(page.getByText('Prefeitura')).toHaveCount(0);
  await expect(page.getByText('Atleta', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Organizador', { exact: true })).toHaveCount(0);
});

test('login não exige papel global e abre a área autenticada da sessão', async ({
  page,
}) => {
  await page.goto('/login');

  await expect(page.getByText('Entrar como')).toHaveCount(0);
  await page.getByLabel('E-mail').fill('pessoa@campolivre.test');
  await page.getByLabel('Senha').fill('senha-mock');
  await page.getByRole('button', { name: 'Entrar' }).click();

  await expect(page).toHaveURL(/\/atleta\/inicio$/);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Marcos Oliveira' }),
  ).toBeVisible();
});

test('troca atleta por organizador preservando a mesma sessão pessoal', async ({
  page,
}) => {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill('pessoa@campolivre.test');
  await page.getByLabel('Senha').fill('senha-mock');
  await page.getByRole('button', { name: 'Entrar' }).click();

  const sessionBefore = await page.evaluate(() =>
    JSON.parse(
      sessionStorage.getItem('campo-livre:mock-personal-session') ?? '{}',
    ),
  );

  await page.goto('/atleta/perfil');
  await page
    .getByRole('button', { name: 'Trocar para contexto Organizador' })
    .click();

  await expect(page).toHaveURL(/\/organizador\/inicio$/);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Marcos Oliveira' }),
  ).toBeVisible();

  const sessionAfter = await page.evaluate(() =>
    JSON.parse(
      sessionStorage.getItem('campo-livre:mock-personal-session') ?? '{}',
    ),
  );

  expect(sessionAfter.sessionId).toBe(sessionBefore.sessionId);
  expect(sessionAfter.account.id).toBe(sessionBefore.account.id);
  expect(sessionAfter.activeContext).toBe('organizador');
  expect(sessionAfter.capabilities).toEqual(['atleta', 'organizador']);
});
