import { expect, test } from '@playwright/test';

test.describe('experiência visual híbrida', () => {
  test('carrega campeonatos demonstrativos sem depender do backend', async ({
    page,
  }) => {
    await page.goto('/campeonatos');

    await expect(
      page.getByRole('heading', { name: 'Campeonatos', level: 1 }),
    ).toBeVisible();
    await expect(
      page.locator('a[href^="/campeonatos/"]').first(),
    ).toBeVisible();
    await expect(
      page.getByText('Não foi possível consultar os campeonatos'),
    ).toHaveCount(0);
  });

  test('mantém catálogo e perfil público completos com identificação demonstrativa', async ({
    page,
  }) => {
    await page.goto('/atletas');

    await expect(page.getByRole('heading', { name: 'Atletas' })).toBeVisible();
    await expect(page.getByRole('searchbox')).toBeVisible();
    await expect(page.getByText('Dados demonstrativos.')).toBeVisible();
    await expect(page.getByRole('status')).toContainText(
      'Experiência de revisão',
    );

    const primeiroPerfil = page.locator('a[href^="/atletas/"]').first();
    await expect(primeiroPerfil).toBeVisible();
    await primeiroPerfil.click();

    await expect(page.getByText('Números publicados')).toBeVisible();
    await expect(page.getByText('Trajetória nos times')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Campeonatos' }),
    ).toBeVisible();
  });

  test('preserva a mesma hierarquia em viewport móvel', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/atletas');

    await expect(page.getByRole('heading', { name: 'Atletas' })).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Abrir menu público' }),
    ).toBeVisible();
    await expect(page.getByRole('searchbox')).toBeVisible();
    await expect(page.locator('a[href^="/atletas/"]').first()).toBeVisible();
  });
});
