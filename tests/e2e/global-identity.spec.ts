import { expect, test, type Page } from '@playwright/test';

async function login(page: Page, email: string) {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill(email);
  await page.getByLabel('Senha').fill('senha-mock');
  await page.getByRole('button', { name: 'Entrar' }).click();
}

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
  await login(page, 'pessoa@campolivre.test');

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

  await login(page, 'prefeitura@campolivre.test');
  for (const route of [
    '/prefeitura/painel',
    '/prefeitura/campos',
    '/prefeitura/aprovacoes',
  ]) {
    await page.goto(route);
    await expectEditorialGeometry(page);
  }
});
