import { expect, test } from '@playwright/test';

test('piloto público usa a tipografia editorial e o canvas de campo aprovados', async ({
  page,
}) => {
  await page.goto('/');

  const publicFont = await page
    .locator('main')
    .evaluate((element) => getComputedStyle(element).fontFamily);
  expect(publicFont).toContain('IBM Plex Sans');

  const heading = page.getByRole('heading', {
    level: 1,
    name: 'Campeonatos em andamento',
  });
  const headingFont = await heading.evaluate(
    (element) => getComputedStyle(element).fontFamily,
  );
  expect(headingFont).toContain('Barlow Condensed');
  await expect(page.locator('body')).toHaveCSS(
    'background-color',
    'rgb(245, 241, 230)',
  );
  await expect(page.locator('main')).toHaveCSS(
    'background-color',
    'rgb(245, 241, 230)',
  );
});

test('entrada pública não depende de fotografia e abandona cartões excessivamente arredondados', async ({
  page,
}) => {
  await page.goto('/');

  await expect(page.locator('main img')).toHaveCount(0);
  const campeonato = page
    .getByRole('region', { name: 'Campeonatos em andamento' })
    .getByRole('link', { name: /Copa Franca 2026/ });
  const radius = await campeonato.evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).borderRadius),
  );
  expect(radius).toBeLessThanOrEqual(16);
});

test('detalhe da partida apresenta um placar editorial identificável', async ({
  page,
}) => {
  await page.goto('/partidas/3');

  const placar = page.getByRole('region', { name: 'Placar da partida' });
  await expect(placar).toContainText('Time A');
  await expect(placar).toContainText('3 × 1');
  await expect(placar).toContainText('Bairro Sul FC');

  const font = await placar.evaluate(
    (element) => getComputedStyle(element).fontFamily,
  );
  expect(font).toContain('Barlow Condensed');
});
