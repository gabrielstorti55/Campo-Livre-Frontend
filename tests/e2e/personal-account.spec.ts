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

test('cadastro novo confirma o e-mail antes de entrar sem vínculos automáticos', async ({
  page,
}) => {
  await page.goto('/cadastro');
  await page.getByLabel('Nome completo').fill('Ana Souza');
  await page.getByLabel('Nome de usuário').fill('anasouzae2e');
  await page.getByLabel('E-mail').fill('ana-e2e@campolivre.test');
  await page.getByLabel('Telefone (opcional)').fill('(16) 99999-9999');
  await page.getByLabel('CPF').fill('123.456.789-01');
  await page.getByLabel('Número do RG').fill('12.345.678-9');
  await page.getByLabel('Órgão expedidor').fill('SSP');
  await page.getByLabel('UF do RG').fill('SP');
  await page.getByLabel('Data de nascimento').fill('2000-01-01');
  await page.getByLabel('Senha', { exact: true }).fill('senha-segura');
  await page.getByLabel('Confirmar senha').fill('senha-segura');
  await page.getByLabel('Aceito os termos de uso').check();
  await page.getByRole('button', { name: 'Criar conta pessoal' }).click();

  await expect(
    page.getByRole('heading', { name: 'Confirme seu e-mail' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Abrir confirmação simulada' }).click();
  await expect(page).toHaveURL(/\/confirmar-email$/);
  await expect(
    page.getByRole('heading', { name: 'E-mail confirmado' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Ir para o acesso' }).click();

  await page.getByLabel('E-mail').fill('ana-e2e@campolivre.test');
  await page.getByLabel('Senha', { exact: true }).fill('senha-segura');
  await page.getByRole('button', { name: 'Entrar' }).click();

  await expect(page).toHaveURL(/\/minha-area$/);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Ana Souza' }),
  ).toBeVisible();
  await expect(
    page.getByText('Você ainda não participa de nenhum time'),
  ).toBeVisible();
  expect(await page.evaluate(() => sessionStorage.length)).toBe(0);
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
});

test('login não exige papel global e abre a área pessoal neutra', async ({
  page,
}) => {
  await page.goto('/login');

  await expect(page.getByText('Entrar como')).toHaveCount(0);
  await page.getByLabel('E-mail').fill('pessoa@campolivre.test');
  await page.getByLabel('Senha').fill('senha-mock');
  await page.getByRole('button', { name: 'Entrar' }).click();

  await expect(page).toHaveURL(/\/minha-area$/);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Marcos Oliveira' }),
  ).toBeVisible();
});

test('conta sem vínculos entra em uma área pessoal vazia', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill('sem-time@campolivre.test');
  await page.getByLabel('Senha').fill('senha-mock');
  await page.getByRole('button', { name: 'Entrar' }).click();

  await expect(page).toHaveURL(/\/minha-area$/);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Lucas Ferreira' }),
  ).toBeVisible();
  await expect(
    page.getByText('Você ainda não participa de nenhum time'),
  ).toBeVisible();
  await expect(page.getByText('Nenhum campeonato organizado')).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Entrar em um time' }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Criar um time' })).toBeVisible();

  expect(await page.evaluate(() => sessionStorage.length)).toBe(0);
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
});

test('@dominio-prototipo troca atleta por organizador preservando a mesma sessão pessoal', async ({
  page,
}) => {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill('pessoa@campolivre.test');
  await page.getByLabel('Senha').fill('senha-mock');
  await page.getByRole('button', { name: 'Entrar' }).click();

  await page.getByRole('link', { name: 'Abrir área esportiva' }).click();
  await expect(page).toHaveURL(/\/atleta\/inicio$/);
  await page.getByRole('button', { name: 'Abrir menu' }).click();
  await page.getByRole('link', { name: 'Perfil', exact: true }).click();
  await page
    .getByRole('button', { name: 'Trocar para contexto Organizador' })
    .click();

  await expect(page).toHaveURL(/\/organizador\/inicio$/);

  expect(await page.evaluate(() => sessionStorage.length)).toBe(0);
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
});
