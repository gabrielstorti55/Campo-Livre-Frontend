import { expect, type Page, test } from '@playwright/test';

import { autenticarEm } from './fixtures/autenticacao';
async function loginWithoutTeam(page: Page, destino = '/minha-area') {
  await autenticarEm(page, 'semTime', destino);
}

test('atleta encerra a sessão e não retorna por deep link privado', async ({
  page,
}) => {
  await autenticarEm(page, 'organizador', '/atleta/inicio');

  await page.getByRole('button', { name: 'Abrir menu' }).click();
  await page.getByRole('button', { name: 'Sair da conta' }).click();
  await expect(page).toHaveURL((url) => url.pathname === '/login');

  await page.goto('/atleta/perfil');
  await expect(page).toHaveURL((url) => url.pathname === '/login');
});

test('convite nominal aparece somente para a conta destinatária', async ({
  page,
}) => {
  await autenticarEm(page, 'organizador', '/atleta/time/buscar');
  await expect(
    page.getByText('Você não possui convites pendentes.'),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Leões FC' })).toHaveCount(0);
});

test('destinatário consulta o convite sem receber token na listagem', async ({
  page,
}) => {
  await loginWithoutTeam(page, '/atleta/time/buscar');
  await expect(page.getByRole('heading', { name: 'Leões FC' })).toBeVisible();
  await expect(
    page.getByText(/Abra o link único recebido na notificação ou no e-mail/),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: /Aceitar convite/ }),
  ).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: /Recusar convite/ }),
  ).toHaveCount(0);
});

test('rotas pessoais exigem sessão autenticada', async ({ page }) => {
  await page.goto('/atleta/inicio');
  await expect(page).toHaveURL((url) => url.pathname === '/login');
  await expect(page.getByText('Marcos Oliveira')).toHaveCount(0);

  await page.goto('/atleta/time/criar');
  await expect(page).toHaveURL(
    (url) => url.pathname === '/login' && url.searchParams.has('returnTo'),
  );
});

test('perfil do atleta edita somente os dados pessoais disponíveis no contrato', async ({
  page,
}) => {
  await autenticarEm(page, 'organizador', '/atleta/perfil');

  await expect(
    page.getByRole('heading', { name: 'Perfil básico' }),
  ).toBeVisible();
  await expect(page.getByLabel('Nome público')).toHaveValue('Marcos Oliveira');
  await expect(page.getByLabel('Biografia')).toBeVisible();
  await expect(page.getByLabel('Posição principal')).toBeVisible();
  await expect(page.getByText('Score futmob')).toHaveCount(0);
  await expect(
    page.getByRole('region', { name: 'Estatísticas publicadas' }),
  ).toHaveCount(0);
});

test('área do atleta não substitui agenda pessoal ausente pelo catálogo público', async ({
  page,
}) => {
  await autenticarEm(page, 'organizador', '/atleta/meus-eventos');
  await expect(
    page.getByRole('heading', { name: 'Agenda pessoal ainda indisponível' }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: /Copa Franca 2026/ }),
  ).toHaveCount(0);
  await expect(page.getByRole('tab')).toHaveCount(0);
});

test('evento cancelado não é inventado sem projeção de agenda pessoal', async ({
  page,
}) => {
  await autenticarEm(page, 'atletaCancelado', '/atleta/meus-eventos');
  await expect(
    page.getByRole('heading', { name: 'Agenda pessoal ainda indisponível' }),
  ).toBeVisible();
  await expect(page.getByText('Copa Municipal Cancelada')).toHaveCount(0);
});

test('atleta cria um time e torna-se capitão', async ({ page }) => {
  await page.goto('/atleta/time/aquecer-rota-dinamica');
  await expect(page).toHaveURL((url) => url.pathname === '/login');
  await loginWithoutTeam(page);
  await page.getByRole('link', { name: 'Criar um time' }).click();

  await page.getByLabel('Nome do time').fill('Falcões da Vila');
  await page.getByLabel('Sigla').fill('FDV');
  await page.getByLabel('Município').selectOption({ label: 'Franca/SP' });
  await page
    .getByLabel('Descrição pública')
    .fill('Equipe criada para disputar campeonatos municipais.');
  await page.getByRole('button', { name: 'Criar Time' }).click();
  await expect(page).toHaveURL(
    (url) =>
      url.pathname.startsWith('/atleta/time/') &&
      url.pathname !== '/atleta/time/criar',
  );
  await expect(
    page.getByRole('heading', { name: 'Falcões da Vila' }),
  ).toBeVisible();
});
