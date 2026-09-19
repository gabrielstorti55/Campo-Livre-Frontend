import { expect, test } from '@playwright/test';

import { autenticarEm } from './fixtures/autenticacao';
async function loginAsMunicipality(
  page: import('@playwright/test').Page,
  destino = '/prefeitura/painel',
) {
  await autenticarEm(page, 'prefeitura', destino);
}

test('apresenta a identidade CampoLivre sem aparência de card genérico', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/login');

  await expect(page.getByTestId('auth-brand-panel')).toBeVisible();
  await expect(page.getByText('LigaPro', { exact: true })).toHaveCount(0);
  await expect(page.locator('img[src="/soccer-field.jpg"]')).toHaveCount(0);
  await expect(
    page.getByRole('heading', { name: 'Entre no CampoLivre' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', {
      name: 'Seu time, seus campeonatos, sua cidade.',
    }),
  ).toBeVisible();

  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document.fonts.check('400 16px "IBM Plex Sans"') &&
          document.fonts.check('700 32px "Barlow Condensed"'),
      ),
    )
    .toBe(true);
  await expect(page.locator('body')).toHaveCSS('font-family', /IBM Plex Sans/);
  await expect(
    page.getByRole('heading', { name: 'Entre no CampoLivre' }),
  ).toHaveCSS('font-family', /Barlow Condensed/);

  const emailBox = await page.getByLabel('E-mail').boundingBox();
  const passwordBox = await page.getByLabel('Senha').boundingBox();
  expect(passwordBox?.width).toBe(emailBox?.width);
  expect(emailBox?.height).toBeGreaterThanOrEqual(44);
  const entrarBox = await page
    .getByRole('button', { name: 'Entrar' })
    .boundingBox();
  expect(entrarBox?.height).toBeGreaterThanOrEqual(44);
  await expect(page.getByText('E-mail', { exact: true })).toHaveCSS(
    'font-family',
    /IBM Plex Sans/,
  );
});

test('mantém a autenticação utilizável em uma tela móvel', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/login');

  await expect(
    page.getByRole('heading', { name: 'Entre no CampoLivre' }),
  ).toBeVisible();
  await expect(page.getByLabel('E-mail')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Criar minha conta' }),
  ).toBeVisible();
});

test('associa os rótulos aos controles do formulário de login', async ({
  page,
}) => {
  await page.goto('/login');

  await page.getByLabel('E-mail').fill('atleta@campolivre.test');
  await page.getByLabel('Senha').fill('segredo');
});

test('mantém o cadastro pessoal acessível sem seleção de papel global', async ({
  page,
}) => {
  await page.goto('/cadastro');

  await expect(page.getByLabel('Nome completo')).toBeVisible();
  await expect(page.getByLabel('E-mail')).toBeVisible();
  await expect(page.getByLabel('Senha', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Confirmar senha')).toBeVisible();
  await expect(page.getByLabel('Perfil')).toHaveCount(0);
});

test('expõe operações de partida e formulário de agendamento acessíveis', async ({
  page,
}) => {
  await autenticarEm(page, 'organizador', '/organizador/campeonato/1/partidas');

  await expect(page.getByRole('heading', { name: /Partidas ·/ })).toBeVisible();
  const agendar = page.getByRole('button', { name: 'Agendar partida 1' });
  const cancelar = page.getByRole('button', { name: 'Cancelar partida 1' });
  const registrarWo = page.getByRole('button', {
    name: 'Registrar WO na partida 1',
  });
  await expect(agendar).toBeVisible();
  await expect(cancelar).toBeVisible();
  await expect(registrarWo).toBeVisible();

  for (const controle of [agendar, cancelar, registrarWo]) {
    const caixa = await controle.boundingBox();
    expect(caixa?.height).toBeGreaterThanOrEqual(32);
  }

  await agendar.click();
  await expect(page.getByLabel('Nova data')).toHaveAttribute('type', 'date');
  await expect(page.getByLabel('Novo horário')).toHaveAttribute('type', 'time');
  await expect(page.getByLabel('Campo (UUID)')).toBeVisible();
  await expect(
    page.getByLabel(
      'Confirmo que o campo e o horário foram autorizados externamente',
    ),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Confirmar agendamento' }),
  ).toBeDisabled();
});

test('expõe o calendário da prefeitura com semântica de grade', async ({
  page,
}) => {
  await loginAsMunicipality(page, '/prefeitura/calendario');

  const calendar = page.getByRole('grid', { name: /agosto 2026/i });
  const dia = calendar.getByRole('button', { name: /21 de agosto de 2026/i });
  const anterior = page.getByRole('button', { name: 'Mês anterior' });
  const proximo = page.getByRole('button', { name: 'Próximo mês' });
  await expect(
    calendar.getByRole('button', {
      name: /sexta-feira, 7 de agosto de 2026, possui reserva/i,
    }),
  ).toBeVisible();
  expect((await dia.boundingBox())?.height).toBeGreaterThanOrEqual(44);
  expect((await anterior.boundingBox())?.height).toBeGreaterThanOrEqual(44);
  expect((await proximo.boundingBox())?.height).toBeGreaterThanOrEqual(44);
  await dia.click();
  await expect(
    page.getByRole('heading', { name: 'Reservas de 21/08/2026' }),
  ).toBeVisible();
});
