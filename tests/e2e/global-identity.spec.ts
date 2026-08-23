import { expect, test, type Page } from '@playwright/test';

import { autenticarEm } from './fixtures/autenticacao';

async function expectEditorialGeometry(page: Page) {
  const offenders = await page.locator('main').evaluate((main) =>
    Array.from(main.querySelectorAll<HTMLElement>('*'))
      .map((element) => {
        const box = element.getBoundingClientRect();
        const radius = Number.parseFloat(
          getComputedStyle(element).borderRadius,
        );
        return {
          tag: element.tagName,
          className: element.className,
          width: box.width,
          height: box.height,
          radius,
        };
      })
      .filter(
        ({ width, height, radius }) =>
          width >= 180 && height >= 64 && radius > 8,
      )
      .slice(0, 10),
  );

  expect(offenders).toEqual([]);
  expect(
    await page.locator('main').evaluate((main) => main.scrollWidth),
  ).toBeLessThanOrEqual(
    await page.locator('main').evaluate((main) => main.clientWidth),
  );
}

test('todo fluxo autenticado usa geometria editorial firme', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });


  for (const route of [
    '/atleta/inicio',
    '/atleta/perfil',
    '/organizador/inicio',
    '/organizador/campeonatos',
  ]) {
    await page.goto(route);
    await expectEditorialGeometry(page);
    if (route === '/organizador/inicio') {
      await expect(page.locator('main')).not.toContainText(/EM_[A-Z_]+/);
      await expect(page.locator('main')).toContainText('Em andamento');
    }
  }


  for (const route of [
    '/prefeitura/painel',
    '/prefeitura/campos',
    '/prefeitura/aprovacoes',
  ]) {
    await page.goto(route);
    await expectEditorialGeometry(page);
  }
});

