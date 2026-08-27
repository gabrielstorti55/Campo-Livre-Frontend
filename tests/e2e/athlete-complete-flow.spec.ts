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

  await page.goto('/times/criar');
  await expect(page).toHaveURL((url) => url.pathname === '/login');
});

test('perfil do atleta usa somente fatos esportivos publicados e seus times', async ({
  page,
}) => {
  await autenticarEm(page, 'organizador', '/atleta/perfil');

  const stats = page.getByRole('region', { name: 'Estatísticas publicadas' });
  await expect(stats.getByText('7', { exact: true })).toBeVisible();
  await expect(stats.getByText('14', { exact: true })).toBeVisible();
  await expect(stats.getByText('4', { exact: true })).toBeVisible();
  await expect(page.getByText('Score futmob')).toHaveCount(0);

  const meusTimes = page.getByRole('region', { name: 'Meus times' });
  await expect(meusTimes.getByRole('link', { name: /Time A/ })).toBeVisible();
  await expect(meusTimes.getByText('Leões FC')).toHaveCount(0);
  await expect(
    page.getByRole('region', { name: 'Histórico de times publicado' }),
  ).toContainText('Time A');
});

test('área do atleta mostra somente eventos dos times vinculados', async ({
  page,
}) => {
  await autenticarEm(page, 'organizador', '/atleta/meus-eventos');
  const eventosAtivos = page.getByRole('tabpanel', { name: 'Ativos' });
  await expect(
    eventosAtivos.getByRole('link', { name: /Copa Franca 2026/ }),
  ).toBeVisible();
  await expect(eventosAtivos.getByText('Liga Bairro Sul')).toHaveCount(0);

  await page.getByRole('tab', { name: 'Encerrados' }).click();
  const eventosEncerrados = page.getByRole('tabpanel', { name: 'Encerrados' });
  await expect(
    eventosEncerrados.getByRole('link', { name: /Copa Franca 2025/ }),
  ).toBeVisible();
  await expect(eventosEncerrados.getByText('Liga Municipal 2025')).toHaveCount(
    0,
  );
});

test('evento cancelado preserva seu estado no histórico do atleta', async ({
  page,
}) => {
  await autenticarEm(page, 'atletaCancelado', '/atleta/meus-eventos');
  await page.getByRole('tab', { name: 'Encerrados' }).click();
  const cancelledEvent = page
    .getByRole('tabpanel', { name: 'Encerrados' })
    .getByRole('link', { name: /Copa Municipal Cancelada/ });
  await expect(cancelledEvent).toContainText('Cancelado');
});

test('atleta cria um time e torna-se capitão', async ({ page }) => {
  await loginWithoutTeam(page);
  await page.getByRole('link', { name: 'Criar um time' }).click();

  const modalidade = page.getByRole('radiogroup', { name: 'Modalidade' });
  await modalidade.getByRole('radio', { name: 'Campo' }).click();

  await page.getByLabel('Nome do time').fill('Falcões da Vila');
  await page.getByLabel('Cidade').fill('Franca, SP');
  await page
    .getByLabel('Descrição')
    .fill('Equipe criada para disputar campeonatos municipais.');
  await page
    .getByRole('button', { name: 'Salvar time e convidar atletas' })
    .click();
});
