import { expect, test } from '@playwright/test';

import { preaquecerRota } from './fixtures/autenticacao';

test('catálogo público de campeonatos oferece os filtros documentados', async ({
  page,
}) => {
  await page.goto('/campeonatos');
  const filtros = page.getByRole('region', { name: 'Filtros de campeonatos' });

  await expect(filtros.getByLabel('Estado do campeonato')).toBeVisible();
  await expect(filtros.getByLabel('Município')).toBeVisible();
  await expect(filtros.getByLabel('UF')).toBeVisible();

  await filtros.getByLabel('Município').selectOption({ label: 'Batatais/SP' });
  await expect(
    page.getByRole('link', { name: /Torneio Amigos 2025/ }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: /Copa Franca 2026/ }),
  ).toHaveCount(0);
});

test('detalhe do campeonato usa participantes e partidas vinculados ao recurso', async ({
  page,
}) => {
  await preaquecerRota(page, '/campeonatos/1/participantes');
  await page.goto('/campeonatos/1');
  await page.getByRole('link', { name: 'Times participantes' }).click();

  await expect(
    page.getByRole('heading', { level: 2, name: 'Time 1' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { level: 2, name: 'Time 3' }),
  ).toHaveCount(0);
});

test('campo aparece somente como contexto público da partida', async ({
  page,
}) => {
  await page.goto('/partidas/3');
  await expect(
    page.getByText('Campo Vera Cruz', { exact: true }),
  ).toBeVisible();
  await expect(page.locator('a[href^="/campos"]')).toHaveCount(0);
});

test('catálogo de atletas falha explicitamente enquanto a busca não está publicada', async ({
  page,
}) => {
  await page.goto('/atletas');
  await expect(
    page.getByRole('heading', { name: 'Atletas', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', {
      name: 'Catálogo de atletas ainda indisponível',
    }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: /Marcos Oliveira/ })).toHaveCount(
    0,
  );
});

test('artilharia pública pertence ao detalhe do campeonato', async ({
  page,
}) => {
  await preaquecerRota(page, '/campeonatos/1/artilharia');
  await page.goto('/campeonatos/1');
  await page.getByRole('link', { name: 'Artilharia' }).click();
  await expect(
    page.getByRole('heading', { name: 'Artilharia', exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('table')).toContainText('Marcos Oliveira');
  await expect(page.getByRole('table')).toContainText('7');
  await expect(page.getByText('Destaque da artilharia')).toBeVisible();
});

test('menu oferece Campos, mas não publica uma jornada genérica de rankings', async ({
  page,
}) => {
  await preaquecerRota(page, '/campos');
  await page.goto('/');
  await page.getByRole('button', { name: 'Abrir menu público' }).click();
  const navegacao = page.getByRole('navigation', { name: 'Navegação pública' });
  await expect(navegacao.getByRole('link', { name: 'Campos' })).toBeVisible();
  await expect(navegacao.getByRole('link', { name: 'Rankings' })).toHaveCount(
    0,
  );

  await navegacao.getByRole('link', { name: 'Campos' }).click();
  await expect(page).toHaveURL(/\/campos$/);
  await expect(
    page.getByRole('heading', { name: 'Campos', exact: true }),
  ).toBeVisible();
  const rankings = await page.goto('/rankings');
  expect(rankings?.status()).toBe(404);
});

test('partidas públicas representam estados agendada, adiada e cancelada', async ({
  page,
}) => {
  await page.goto('/partidas/7');
  await expect(page.getByText('Adiada')).toBeVisible();
  await expect(page.getByText('Condição do campo')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Gols' })).toHaveCount(0);

  await page.goto('/partidas/8');
  await expect(page.getByText('Cancelada')).toBeVisible();
  await expect(page.getByText('Decisão administrativa')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Gols' })).toHaveCount(0);
});
