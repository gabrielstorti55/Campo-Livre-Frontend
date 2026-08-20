import { expect, test } from '@playwright/test';

test('catálogo público de campeonatos oferece os filtros documentados', async ({
  page,
}) => {
  await page.goto('/campeonatos');
  const filtros = page.getByRole('region', { name: 'Filtros de campeonatos' });

  await expect(filtros.getByLabel('Estado do campeonato')).toBeVisible();
  await expect(filtros.getByLabel('Município')).toBeVisible();
  await expect(filtros.getByLabel('UF')).toBeVisible();
  await expect(filtros.getByLabel('Formato')).toBeVisible();
  await expect(filtros.getByLabel('Período de início')).toBeVisible();
  await expect(filtros.getByLabel('Ordenar campeonatos')).toBeVisible();

  await filtros.getByLabel('Município').selectOption('Batatais');
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
  await page.goto('/campeonatos/1');
  await page.getByRole('tab', { name: 'Times' }).click();

  await expect(page.getByRole('link', { name: /Time A/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Estrela Azul/ })).toHaveCount(0);

  await page.getByRole('tab', { name: 'Estrutura' }).click();
  await expect(page.getByText('Fase classificatória')).toBeVisible();
  await expect(
    page.getByText('Responsável: Ana Costa · Organizadora'),
  ).toBeVisible();
});

test('campo aparece somente como contexto público da partida', async ({
  page,
}) => {
  await page.goto('/partidas/1');
  await expect(
    page.getByText('Campo Vera Cruz', { exact: true }),
  ).toBeVisible();
  await expect(page.locator('a[href^="/campos"]')).toHaveCount(0);
});

test('perfil esportivo respeita visibilidade e fatos publicados', async ({
  page,
}) => {
  await page.goto('/atletas');
  await expect(page.getByRole('heading', { name: 'Atletas' })).toBeVisible();
  await page.getByRole('link', { name: /Marcos Oliveira/ }).click();

  await expect(
    page.getByRole('heading', { name: 'Marcos Oliveira' }),
  ).toBeVisible();
  await expect(page.getByText('Histórico de times')).toBeVisible();
  await expect(page.getByText('Conquistas')).toBeVisible();
  await expect(page.getByText('7 gols')).toBeVisible();
  await expect(page.getByText(/@campolivre\.test/)).toHaveCount(0);

  await page.goto('/atletas/2');
  await expect(
    page.getByRole('heading', { name: 'Perfil esportivo privado' }),
  ).toBeVisible();
  await expect(page.getByText('Rafael Lima')).toHaveCount(0);
});

test('artilharia pública pertence ao detalhe do campeonato', async ({
  page,
}) => {
  await page.goto('/campeonatos/1');
  await page.getByRole('tab', { name: 'Artilharia' }).click();
  await expect(
    page.getByRole('heading', { name: 'Artilharia', exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('table')).toContainText('Marcos Oliveira');
  await expect(page.getByRole('table')).toContainText('7');
  await expect(page.getByText('Destaque da artilharia')).toBeVisible();
});

test('menu e rotas públicas não tratam campos ou rankings como jornadas', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Abrir menu público' }).click();
  const navegacao = page.getByRole('navigation', { name: 'Navegação pública' });
  await expect(navegacao.getByRole('link', { name: 'Campos' })).toHaveCount(0);
  await expect(navegacao.getByRole('link', { name: 'Rankings' })).toHaveCount(
    0,
  );

  const campos = await page.goto('/campos');
  expect(campos?.status()).toBe(404);
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
