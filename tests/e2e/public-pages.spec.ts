import { expect, test } from '@playwright/test';

import { autenticarEm } from './fixtures/autenticacao';
test('rotas públicas abrem sem sessão e possuem links compartilháveis', async ({
  page,
}) => {
  const routes = [
    '/campeonatos',
    '/campeonatos/1',
    '/times',
    '/times/1',
    '/partidas',
    '/partidas/1',
    '/atletas',
    '/atletas/1',
  ];

  for (const route of routes) {
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(new RegExp(`${route.replace('/', '\\/')}$`));
    await expect(
      page.getByRole('button', { name: 'Abrir menu público' }),
    ).toBeVisible();
  }
});

test('menu público é opcional e pode ser aberto e fechado', async ({
  page,
}) => {
  await page.goto('/campeonatos');

  await expect(
    page.getByRole('navigation', { name: 'Navegação pública' }),
  ).toHaveCount(0);
  await page.getByRole('button', { name: 'Abrir menu público' }).click();
  await expect(
    page.getByRole('navigation', { name: 'Navegação pública' }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Campeonatos' })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await page.getByRole('button', { name: 'Fechar menu lateral' }).click();
  await expect(
    page.getByRole('navigation', { name: 'Navegação pública' }),
  ).toHaveCount(0);
});

test('menu público captura o foco e o devolve ao acionador', async ({
  page,
}) => {
  await page.goto('/campeonatos');
  const trigger = page.getByRole('button', { name: 'Abrir menu público' });
  await trigger.click();

  const dialog = page.getByRole('dialog', { name: 'Menu público' });
  const close = page.getByRole('button', { name: 'Fechar menu lateral' });
  await expect(dialog).toBeVisible();
  await expect(close).toBeFocused();

  for (let step = 0; step < 12; step += 1) {
    await page.keyboard.press('Tab');
    const focusRemainsInside = await dialog.evaluate((element) =>
      element.contains(document.activeElement),
    );
    expect(focusRemainsInside).toBe(true);
  }

  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('conta autenticada usa a mesma página canônica com acesso à sua área', async ({
  page,
}) => {
  await autenticarEm(page, 'organizador', '/campeonatos/1');

  await expect(
    page.getByRole('heading', { name: 'Copa Franca 2026' }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Minha área' })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Agenda publicada' }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Criar conta' })).toHaveCount(0);
});

test('campeonato público mostra agenda e acessos esportivos sem dados pessoais', async ({
  page,
}) => {
  await page.goto('/campeonatos/1');

  await expect(
    page.getByRole('heading', { name: 'Copa Franca 2026' }),
  ).toBeVisible();
  await expect(page.getByText('Marcos Oliveira')).toHaveCount(0);
  await expect(page.getByText('João Silva')).toHaveCount(0);

  await expect(
    page.getByRole('link', { name: /Times participantes/ }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: /Artilharia/ })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Agenda publicada' }),
  ).toBeVisible();
});

test('detalhe público permanece legível sem estourar a página no mobile', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/campeonatos/1');
  await expect(
    page.getByRole('heading', { name: 'Agenda publicada' }),
  ).toBeVisible();

  const pageOverflows = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(pageOverflows).toBe(false);
});

test('times públicos expõem somente o elenco esportivo permitido', async ({
  page,
}) => {
  await page.goto('/times/2');

  await expect(page.getByRole('heading', { name: 'Leões FC' })).toBeVisible();
  const elenco = page.getByRole('region', { name: 'Elenco público' });
  await expect(
    elenco.getByRole('heading', { name: 'Rafael Lima' }),
  ).toBeVisible();
  await expect(page.getByText(/@campolivre\.test/)).toHaveCount(0);
});

test('prevê estados vazio e erro nas consultas públicas', async ({ page }) => {
  await page.goto('/campeonatos');
  await page.getByPlaceholder('Buscar campeonatos...').fill('inexistente xyz');
  await expect(
    page.getByRole('heading', { name: 'Nenhum campeonato encontrado' }),
  ).toBeVisible();

  await page.goto('/campeonatos/999');
  await expect(
    page.getByRole('heading', { name: 'Campeonato não encontrado' }),
  ).toBeVisible();
});
