import { expect, test } from '@playwright/test';

test('entrada pública prioriza campeonatos em andamento e suas partidas', async ({
  page,
}) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', { name: 'Campeonatos em andamento' }),
  ).toBeVisible();
  const campeonatosEmAndamento = page.getByRole('region', {
    name: 'Campeonatos em andamento',
  });
  await expect(
    campeonatosEmAndamento.getByRole('link', { name: /Copa Franca 2026/ }),
  ).toBeVisible();
  await expect(
    campeonatosEmAndamento.getByRole('link', { name: /Liga Bairro Sul/ }),
  ).toBeVisible();
  await expect(campeonatosEmAndamento.getByText('Copa Verão 2026')).toHaveCount(
    0,
  );

  const proximasPartidas = page.getByRole('region', {
    name: 'Agenda de partidas',
  });
  await expect(proximasPartidas).toBeVisible();
  await expect(proximasPartidas.getByText('14 de ago.')).toHaveCount(0);
  await expect(
    proximasPartidas.getByRole('link', { name: /Time A.*Leões FC/ }),
  ).toBeVisible();
  await expect(
    proximasPartidas.getByRole('link', { name: 'Ver agenda completa' }),
  ).toBeVisible();
});

test('entrada pública continua responsiva sem rolagem horizontal', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const pageOverflows = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(pageOverflows).toBe(false);
});
