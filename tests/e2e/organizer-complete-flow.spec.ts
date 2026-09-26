import { expect, test } from '@playwright/test';

import { respeitaAntecedenciaMinima } from '@/services/reservas/regras-horario-reserva';

import { autenticarEm } from './fixtures/autenticacao';

test('regra de reserva usa relógio injetável na fronteira de 24 horas', () => {
  const clock = { now: () => new Date('2026-08-19T12:00:00') };
  expect(respeitaAntecedenciaMinima('2026-08-20T11:59:59', clock)).toBeFalsy();
  expect(respeitaAntecedenciaMinima('2026-08-20T12:00:00', clock)).toBeTruthy();
});

test('capacidade de organizador não concede campeonatos de terceiros', async ({
  page,
}) => {
  await autenticarEm(page, 'semTime', '/minha-area');
  await page
    .getByRole('button', { name: 'Ativar painel de organizador' })
    .click();
  await expect(
    page.getByRole('dialog', { name: 'Ativar painel de organizador' }),
  ).toContainText('não concede acesso a campeonatos de terceiros');
  await page
    .getByRole('button', { name: 'Confirmar ativação do painel' })
    .click();

  await expect(page).toHaveURL(/\/organizador\/inicio$/);
  await expect(
    page.getByRole('region', { name: 'Meus campeonatos' }),
  ).toContainText('Nenhum vínculo com Campeonato');
  await expect(
    page.getByRole('link', { name: /Copa Franca 2026/ }),
  ).toHaveCount(0);
});

test('painel recupera somente vínculos administrativos e funções canônicas', async ({
  page,
}) => {
  await autenticarEm(page, 'organizador', '/organizador/campeonatos');

  const meus = page.getByRole('region', { name: 'Meus campeonatos' });
  await expect(
    meus.getByRole('link', { name: /Copa Franca 2026/ }),
  ).toBeVisible();
  await expect(
    meus.getByRole('link', { name: /Liga Bairro Sul/ }),
  ).toBeVisible();
  await expect(meus.getByRole('link', { name: /Torneio Amigos/ })).toHaveCount(
    0,
  );
  await expect(meus.getByText('Responsável').first()).toBeVisible();
  await expect(meus.getByText('Organizador').first()).toBeVisible();
});

test('workspace deriva autoridade, estado e seções da projeção administrativa', async ({
  page,
}) => {
  await autenticarEm(page, 'organizador', '/organizador/campeonato/4');

  await expect(
    page.getByRole('heading', { level: 1, name: 'Copa Verão 2026' }),
  ).toBeVisible();
  await expect(page.getByText('Você é o responsável')).toBeVisible();
  await expect(page.getByText('Em inscrições')).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Participantes' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Estrutura' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Partidas' })).toBeVisible();
  await expect(
    page.getByRole('tab', { name: 'Equipe organizadora' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Finalizar inscrições' }),
  ).toBeVisible();
});

test('participantes e estrutura usam projeções recuperáveis do campeonato', async ({
  page,
}) => {
  await autenticarEm(page, 'organizador', '/organizador/campeonato/4/times');
  await expect(
    page.getByRole('heading', { name: 'Times · Copa Verão 2026' }),
  ).toBeVisible();
  await expect(
    page.getByText('Vila Nova FC', { exact: true }),
  ).toBeVisible();
  await expect(page.getByText('Leões FC', { exact: true })).toBeVisible();

  await autenticarEm(
    page,
    'organizador',
    '/organizador/campeonato/4/chaveamento',
  );
  await expect(page.getByText('2 Times confirmados')).toBeVisible();
  await expect(
    page.getByText('Vila Nova FC', { exact: true }),
  ).toBeVisible();
  await expect(page.getByText('Leões FC', { exact: true })).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Salvar estrutura de fases' }),
  ).toBeVisible();
});

test('campeonato de demonstração permite chaveamento manual de ponta a ponta', async ({
  page,
}) => {
  await autenticarEm(page, 'atletaOrganizador', '/organizador/campeonato/8');

  await page.getByRole('tab', { name: 'Estrutura' }).click();
  await expect(page.getByText('4 Times confirmados')).toBeVisible();
  await page.getByRole('button', { name: 'Salvar estrutura de fases' }).click();
  await expect(page.getByText('Estrutura de fases salva.')).toBeVisible();

  await page.getByRole('tab', { name: 'Visão geral' }).click();
  await page.getByRole('button', { name: 'Finalizar inscrições' }).click();
  await expect(page.getByText('Inscrições finalizadas.')).toBeVisible();

  await page.getByRole('tab', { name: 'Estrutura' }).click();
  await page.getByRole('button', { name: 'Definir manualmente' }).click();
  await expect(
    page.getByRole('heading', { name: 'Ordem manual das sementes' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Descer' }).first().click();
  await page
    .getByRole('button', { name: 'Confirmar confrontos manuais' })
    .click();

  await expect(
    page.getByText('Distribuição e confrontos gerados.'),
  ).toBeVisible();
  await expect(page.getByText('Distribuição manual confirmada.')).toBeVisible();
});

test('organizador ativo não recebe ações exclusivas do responsável', async ({
  page,
}) => {
  await autenticarEm(page, 'organizador', '/organizador/campeonato/2');
  await expect(page.getByText('Você atua como organizador')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Cancelar campeonato' }),
  ).toHaveCount(0);
  await page.getByRole('tab', { name: 'Equipe organizadora' }).click();
  await expect(page.getByLabel('E-mail do organizador')).toHaveCount(0);
});

test('partidas administrativas usam agenda e operações publicadas', async ({
  page,
}) => {
  await autenticarEm(page, 'organizador', '/organizador/campeonato/1/partidas');
  await expect(
    page.getByRole('heading', { level: 1, name: /Partidas · Campeonato 1/ }),
  ).toBeVisible();
  await expect(page.getByText('Mandante × Visitante')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Agendar partida 1' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Registrar WO na partida 1' }),
  ).toBeVisible();
});

test('perfil mostra vínculos sem apresentar pagamentos locais como fatos', async ({
  page,
}) => {
  await autenticarEm(page, 'organizador', '/organizador/perfil');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Histórico do organizador' }),
  ).toBeVisible();
  await expect(
    page.getByRole('region', { name: 'Participações como organizador' }),
  ).toContainText('Copa Franca 2025');
  await expect(
    page.getByText(/não publica uma projeção recuperável/),
  ).toBeVisible();
  await expect(page.getByText(/PIX/)).toHaveCount(0);
});
