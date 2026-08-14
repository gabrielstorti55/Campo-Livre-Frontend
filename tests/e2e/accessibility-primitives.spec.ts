import { expect, test } from '@playwright/test';

test('apresenta a identidade CampoLivre sem aparência de card genérico', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/login');

  await expect(page.getByTestId('auth-brand-panel')).toBeVisible();
  await expect(page.getByText('LigaPro · Franca, SP')).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Acesse sua conta' }),
  ).toBeVisible();
  await expect(
    page.getByText('Gestão de campeonatos municipais'),
  ).toBeVisible();
});

test('mantém a autenticação utilizável em uma tela móvel', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/login');

  await expect(
    page.getByRole('heading', { name: 'Acesse sua conta' }),
  ).toBeVisible();
  await expect(page.getByLabel('E-mail')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Criar conta' })).toBeVisible();
});

test('associa os rótulos aos controles do formulário de login', async ({
  page,
}) => {
  await page.goto('/login');

  await page.getByLabel('E-mail').fill('atleta@campolivre.test');
  await page.getByLabel('Senha').fill('segredo');
});

test('seleciona o perfil como um grupo de opções exclusivo pelo teclado', async ({
  page,
}) => {
  await page.goto('/cadastro');

  const atleta = page.getByRole('radio', { name: 'Atleta' });
  const organizador = page.getByRole('radio', { name: 'Organizador' });

  await expect(atleta).toBeChecked();
  await organizador.focus();
  await page.keyboard.press('Space');
  await expect(organizador).toBeChecked();

  const perfilBox = await organizador.boundingBox();
  expect(perfilBox?.height).toBeLessThan(180);
});

test('agenda data, horário e partida com primitivas de seleção acessíveis', async ({
  page,
}) => {
  await page.goto('/organizador/campeonato/1/partidas');

  const calendar = page.getByRole('grid', { name: /agosto 2026/i });
  await expect(calendar).toBeVisible();
  await calendar.getByRole('button', { name: /20 de agosto de 2026/i }).click();

  const horarios = page.getByRole('radiogroup', {
    name: 'Selecione o horário',
  });
  await horarios.getByRole('radio', { name: '17:00' }).click();
  await expect(horarios.getByRole('radio', { name: '17:00' })).toHaveAttribute(
    'data-state',
    'on',
  );

  const pendentes = page.getByRole('radiogroup', {
    name: 'Partidas pendentes de agendamento',
  });
  const primeiraPartida = pendentes.getByRole('radio').first();
  await primeiraPartida.click();
  await expect(primeiraPartida).toBeChecked();
  const partidaBox = await primeiraPartida.boundingBox();
  expect(partidaBox?.height).toBeLessThan(160);

  await expect(
    calendar.getByRole('button', { name: /julho|setembro/i }),
  ).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: /previous|next|anterior|próximo/i }),
  ).toHaveCount(0);

  const salvar = page.getByRole('button', { name: /20\/08\/2026 às 17:00/ });
  await expect(salvar).toBeVisible();
  const salvarBox = await salvar.boundingBox();
  expect(salvarBox?.height).toBeGreaterThanOrEqual(40);
});

test('expõe o calendário da prefeitura com semântica de grade', async ({
  page,
}) => {
  await page.goto('/prefeitura/calendario');

  const calendar = page.getByRole('grid', { name: /agosto 2026/i });
  await calendar.getByRole('button', { name: /21 de agosto de 2026/i }).click();
  await expect(
    page.getByRole('heading', { name: 'Eventos de hoje: 21/08/2026' }),
  ).toBeVisible();
});
