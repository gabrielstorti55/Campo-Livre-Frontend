import { expect, test } from '@playwright/test';

test('visitante vê o resumo de uma partida com resultado publicado', async ({
  page,
}) => {
  await page.goto('/partidas/3');

  await expect(
    page.getByRole('heading', { name: 'Resumo da partida' }),
  ).toBeVisible();
  await expect(page.getByText('3 × 1')).toBeVisible();
  await expect(page.getByText('Resultado publicado')).toBeVisible();

  const session = await page.evaluate(() =>
    sessionStorage.getItem('campo-livre:mock-personal-session'),
  );
  expect(session).toBeNull();
});

test('eventos esportivos publicados aparecem no resumo', async ({ page }) => {
  await page.goto('/partidas/3');

  await expect(page.getByRole('heading', { name: 'Gols' })).toBeVisible();
  await expect(page.getByText('Marcos Oliveira')).toBeVisible();
  await expect(page.getByText("12'")).toBeVisible();

  await expect(page.getByRole('heading', { name: 'Cartões' })).toBeVisible();
  await expect(page.getByText('Diego Souza')).toBeVisible();
  await expect(page.getByText('Rogério Lima')).toBeVisible();

  await expect(
    page.getByRole('heading', { name: 'Substituições' }),
  ).toBeVisible();
  await expect(page.getByText('Vitor Nunes')).toBeVisible();
});

test('partida sem resultado publicado não expõe eventos nem placar final', async ({
  page,
}) => {
  await page.goto('/partidas/4');

  await expect(
    page.getByText(
      'O resumo da partida será disponibilizado após a publicação do resultado.',
    ),
  ).toBeVisible();
  await expect(page.getByText('Aguardando publicação')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Gols' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Cartões' })).toHaveCount(0);
  await expect(page.getByText('2 × 0')).toHaveCount(0);
});

test('observações administrativas privadas não aparecem na página canônica', async ({
  page,
}) => {
  await page.goto('/partidas/3');

  await expect(
    page.getByText('Revisar documento do árbitro antes do arquivamento.'),
  ).toHaveCount(0);
});

test('página canônica não possui controles de edição da súmula', async ({
  page,
}) => {
  await page.goto('/partidas/3');

  await expect(
    page.getByRole('button', { name: 'Confirmar resultado e súmula' }),
  ).toHaveCount(0);
  await expect(page.locator('input[type="number"]')).toHaveCount(0);
  await expect(page.getByRole('combobox')).toHaveCount(0);
});

test('conta autenticada usa a mesma rota canônica da partida', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill('pessoa@campolivre.test');
  await page.getByLabel('Senha').fill('senha-mock');
  await page.getByRole('button', { name: 'Entrar' }).click();

  await page.goto('/partidas/3');

  await expect(page).toHaveURL(/\/partidas\/3$/);
  await expect(
    page.getByRole('heading', { name: 'Resumo da partida' }),
  ).toBeVisible();
  await expect(page.getByText('3 × 1')).toBeVisible();
});
