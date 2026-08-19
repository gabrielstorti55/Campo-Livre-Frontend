import { expect, test } from '@playwright/test';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

function listSourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? listSourceFiles(target) : [target];
  });
}

test('usa diretamente as APIs de navegação do Next.js', () => {
  const sourceDirectory = path.join(process.cwd(), 'src');
  const compatibilityFile = path.join(
    sourceDirectory,
    'shared/lib/router-compat.tsx',
  );
  const sourceContents = listSourceFiles(sourceDirectory).map((file) =>
    readFileSync(file, 'utf8'),
  );
  const compatibilityImports = sourceContents.filter((content) =>
    content.includes('router-compat'),
  );

  expect(existsSync(compatibilityFile)).toBe(false);
  expect(compatibilityImports).toEqual([]);
  expect(
    sourceContents.some((content) => content.includes('react-router-dom')),
  ).toBe(false);
  expect(
    sourceContents.some((content) => content.includes("from 'next/link'")),
  ).toBe(true);
  expect(
    sourceContents.some((content) =>
      content.includes("from 'next/navigation'"),
    ),
  ).toBe(true);
});

test('serve a aplicação pelo Next.js App Router', async ({ page }) => {
  const response = await page.goto('/partidas/1');

  expect(response?.headers()['x-powered-by']).toBe('Next.js');
  await expect(
    page.getByRole('heading', { name: 'Detalhes da partida' }),
  ).toBeVisible();
});
