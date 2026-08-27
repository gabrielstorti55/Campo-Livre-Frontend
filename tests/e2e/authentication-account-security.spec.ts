import { expect, test } from '@playwright/test';

test('@prototipo solicita e confirma reativação por link sem manter token na URL', async ({
  page,
}) => {
  await page.goto('/solicitar-reativacao');
  await page.getByLabel('E-mail').fill('inativa@campolivre.test');
  await page.getByRole('button', { name: 'Enviar link' }).click();
  await expect(page.getByText(/se a conta puder ser reativada/i)).toBeVisible();
  await page.getByRole('link', { name: 'Abrir reativação simulada' }).click();

  await expect(page).toHaveURL(/\/confirmar-reativacao$/);
  await expect(
    page.getByRole('heading', { name: 'Conta reativada' }),
  ).toBeVisible();
  await expect(page).not.toHaveURL(/token=/);
  expect(await page.evaluate(() => sessionStorage.length)).toBe(0);
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
});

test('@prototipo conclui reativação, alteração de e-mail e troca de senha sem persistir credenciais', async ({
  page,
}) => {
  await page.goto('/reativar-conta');
  await page.getByLabel('E-mail').fill('inativa@campolivre.test');
  await page.getByLabel('Senha').fill('senha-mock');
  await page
    .getByLabel(
      'Confirmo que desejo cancelar a eliminação e reativar minha conta',
    )
    .check();
  await page.getByRole('button', { name: 'Reativar conta' }).click();
  await expect(
    page.getByRole('heading', { name: 'Conta reativada' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Entrar novamente' }).click();

  await page.getByLabel('E-mail').fill('inativa@campolivre.test');
  await page.getByLabel('Senha').fill('senha-mock');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/minha-area$/);

  await page.getByRole('link', { name: 'Consultar dados da conta' }).click();
  await page.getByRole('link', { name: 'Alterar e-mail' }).click();
  await page.getByLabel('Novo e-mail').fill('inativa-nova@campolivre.test');
  await page.getByRole('button', { name: 'Enviar confirmação' }).click();
  await expect(page.getByText(/e-mail atual continua válido/i)).toBeVisible();
  await page.getByRole('link', { name: 'Abrir confirmação simulada' }).click();
  await expect(page).toHaveURL(/\/confirmar-alteracao-email$/);
  await expect(
    page.getByRole('heading', { name: 'E-mail alterado' }),
  ).toBeVisible();

  await page.getByRole('link', { name: 'Ir para o acesso' }).click();
  await page.getByLabel('E-mail').fill('inativa-nova@campolivre.test');
  await page.getByLabel('Senha').fill('senha-mock');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/minha-area$/);

  await page.getByRole('link', { name: 'Consultar dados da conta' }).click();
  await page.getByRole('link', { name: 'Alterar senha' }).click();
  await page.getByLabel('Senha atual').fill('senha-mock');
  await page.getByLabel('Nova senha', { exact: true }).fill('senha-nova');
  await page.getByLabel('Confirmar nova senha').fill('senha-nova');
  await page.getByRole('button', { name: 'Alterar senha' }).click();
  await expect(page).toHaveURL(/\/login$/);

  await page.getByLabel('E-mail').fill('inativa-nova@campolivre.test');
  await page.getByLabel('Senha').fill('senha-nova');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/minha-area$/);

  expect(await page.evaluate(() => sessionStorage.length)).toBe(0);
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
  await expect(page).not.toHaveURL(/token=/);
});
