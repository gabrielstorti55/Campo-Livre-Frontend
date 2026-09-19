import { expect, type Page, test } from '@playwright/test';

import { autenticarEm, preaquecerRota } from './fixtures/autenticacao';
async function loginAsOrganizer(page: Page, destino = '/minha-area') {
  await autenticarEm(page, 'organizador', destino);
}

async function loginAsMunicipality(page: Page, destino = '/prefeitura/painel') {
  await autenticarEm(page, 'prefeitura', destino);
}

test('entrada em time ocorre por convite nominal, sem solicitação aberta', async ({
  page,
}) => {
  await autenticarEm(page, 'semTime', '/atleta/time/buscar');

  await expect(
    page.getByRole('heading', { name: 'Convites para times' }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Leões FC' })).toBeVisible();
  await expect(
    page.getByText(/Abra o link único recebido na notificação ou no e-mail/),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: /Aceitar convite|Recusar convite/ }),
  ).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Solicitar' })).toHaveCount(0);
  await expect(page.getByText('Tenho um código de convite')).toHaveCount(0);
});

test('gestão do time falha fechada sem vínculo ativo de capitão', async ({
  page,
}) => {
  await loginAsOrganizer(page, '/atleta/time/1');

  await expect(
    page.getByRole('heading', { name: 'Acesso restrito ao capitão' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Adicionar jogador' }),
  ).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: 'Enviar convite nominal' }),
  ).toHaveCount(0);
});

test('página pública do time ausente falha explicitamente sem fixture local', async ({
  page,
}) => {
  await page.goto('/times/1');

  await expect(
    page.getByRole('heading', { name: 'Time não encontrado' }),
  ).toBeVisible();
  await expect(page.getByText('CPF')).toHaveCount(0);
  await expect(page.getByText(/@campolivre\.test/)).toHaveCount(0);
});

test('campeonato é criado com os dados essenciais do contrato atual', async ({
  page,
}) => {
  await preaquecerRota(page, '/organizador/campeonato/aquecer-rota-dinamica');
  await loginAsOrganizer(page, '/organizador/novo');

  await expect(page.getByLabel('Contexto responsável')).toBeVisible();
  await expect(page.getByLabel('Município')).toBeVisible();
  await expect(page.getByLabel('Formato pretendido')).toBeVisible();
  await page.getByLabel('Nome do campeonato').fill('Copa Teste');
  await page.getByLabel('Município').selectOption({ label: 'Franca — SP' });
  await page.getByLabel('Data prevista de início').fill('2026-09-01');
  await page.getByRole('button', { name: 'Criar campeonato' }).click();
  await expect(page).toHaveURL(
    (url) =>
      url.pathname.startsWith('/organizador/campeonato/') &&
      url.pathname !== '/organizador/campeonato/novo',
  );
  await expect(page.getByRole('heading', { name: 'Copa Teste' })).toBeVisible();
});

test('súmula reúne fatos obrigatórios antes da confirmação definitiva', async ({
  page,
}) => {
  test.setTimeout(180_000);
  await page.clock.setFixedTime(new Date('2026-08-23T12:00:00'));
  await loginAsOrganizer(page, '/organizador/campeonato/1/sumula');

  await expect(page.getByLabel('Partida da súmula')).toHaveValue('1');
  await expect(page.getByLabel('Árbitro', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Primeiro assistente')).toBeVisible();
  await expect(page.getByLabel('Segundo assistente')).toBeVisible();
  await expect(page.getByLabel('Quarto árbitro')).toBeVisible();
  await expect(page.getByLabel('Minuto do gol')).toBeVisible();
  await expect(page.getByLabel('Período do gol')).toBeVisible();
  await expect(page.getByLabel('Acréscimo do gol')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Adicionar gol' }),
  ).toBeVisible();
  await expect(page.getByLabel('Minuto regulamentar do cartão')).toBeVisible();
  await expect(
    page.getByLabel('Minuto regulamentar da substituição'),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Substituições' }),
  ).toBeVisible();
  await expect(page.getByLabel('Relatório do jogo')).toBeVisible();
  await expect(page.getByText('O envio é definitivo')).toBeVisible();
  await expect(
    page.getByText('A súmula oficial será gerada em PDF'),
  ).toBeVisible();
  await expect(page.getByText('Escalações da partida')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Adicionar cartão' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Adicionar substituição' }),
  ).toBeVisible();

  await page.getByLabel('Time do gol').click();
  await page.getByRole('option', { name: 'Leões FC' }).click();
  await page.getByLabel('Autor do gol').click();
  await expect(
    page.getByRole('option', { name: 'Marcos Oliveira' }),
  ).toHaveCount(0);
  await expect(
    page.getByRole('option', { name: 'Henrique Alves' }),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByLabel('Time do gol').click();
  await page.getByRole('option', { name: 'Time A' }).click();

  await page.getByLabel('Confirmar envio definitivo').check();
  await page
    .getByRole('button', { name: 'Confirmar resultado e súmula' })
    .click();
  await expect(
    page.getByRole('button', { name: 'Cancelar envio' }),
  ).toHaveCount(0);

  const situacoes = page.getByLabel(/^Situação de /);
  const posicoesUsadas = page.getByLabel(/^Posição usada por /);
  const quantidadeEscalados = await situacoes.count();
  expect(quantidadeEscalados).toBeGreaterThan(0);
  for (let indice = 0; indice < quantidadeEscalados; indice += 1) {
    await situacoes.nth(indice).selectOption('TITULAR');
    await posicoesUsadas.nth(indice).selectOption('ATACANTE');
  }

  await page.getByLabel('Árbitro', { exact: true }).fill('Carlos Silva');
  await page.getByLabel('Primeiro assistente').fill('Ana Lima');
  await page.getByLabel('Segundo assistente').fill('Paulo Souza');
  await page.getByLabel('Quarto árbitro').fill('Lia Rocha');
  await page.getByLabel('Gols de Time A').fill('1');
  await page.getByLabel('Time do gol').click();
  await page.getByRole('option', { name: 'Leões FC' }).click();
  await page.getByLabel('Minuto do gol').fill('8');
  await page.getByRole('button', { name: 'Adicionar gol' }).click();
  await page
    .getByRole('button', { name: 'Confirmar resultado e súmula' })
    .click();
  await expect(
    page.getByText(
      'Os gols registrados por equipe (0 × 1) devem corresponder ao placar (1 × 0).',
    ),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Remover gol' }).click();
  await page.getByLabel('Time do gol').click();
  await page.getByRole('option', { name: 'Time A' }).click();
  await page.getByLabel('Gols de Time A').fill('2');
  await page.getByLabel('Minuto do gol').fill('12');
  await page.getByRole('button', { name: 'Adicionar gol' }).click();
  await page.getByLabel('Minuto do gol').fill('31');
  await page.getByRole('button', { name: 'Adicionar gol' }).click();
  await expect(page.getByRole('button', { name: 'Remover gol' })).toHaveCount(
    2,
  );

  const abrirConfirmacao = page.getByRole('button', {
    name: 'Confirmar resultado e súmula',
  });
  await abrirConfirmacao.click();
  const dialogoConfirmacao = page.getByRole('alertdialog', {
    name: 'Confirma o envio definitivo?',
  });
  await expect(dialogoConfirmacao).toBeVisible();
  const fecharDialogo = dialogoConfirmacao.getByRole('button', {
    name: 'Fechar',
  });
  await expect(fecharDialogo).toBeVisible();
  await expect
    .poll(async () => (await fecharDialogo.boundingBox())?.width ?? 0)
    .toBeGreaterThanOrEqual(44);
  await expect
    .poll(async () => (await fecharDialogo.boundingBox())?.height ?? 0)
    .toBeGreaterThanOrEqual(44);
  await expect(
    dialogoConfirmacao.getByRole('button', { name: 'Cancelar envio' }),
  ).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialogoConfirmacao).toHaveCount(0);
  await expect(abrirConfirmacao).toBeFocused();
  await abrirConfirmacao.click();
  await expect(
    page.getByRole('button', { name: 'Cancelar envio' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Enviar súmula definitiva' }),
  ).toBeVisible();
  await expect(page.getByLabel('Gols de Time A')).toBeDisabled();
  await expect(page.getByLabel('Partida da súmula')).toBeDisabled();
  await page.getByRole('button', { name: 'Enviar súmula definitiva' }).click();
});

test('finalização não é oferecida sem operação publicada', async ({ page }) => {
  await autenticarEm(page, 'organizador', '/organizador/campeonato/1');
  await page.getByText('Outras ações do campeonato', { exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Finalizar campeonato' }),
  ).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: 'Confirmar cancelamento' }),
  ).toBeDisabled();
});

test('recusa de reserva exige motivo e aparece no histórico local', async ({
  page,
}) => {
  await loginAsMunicipality(page, '/prefeitura/aprovacoes');

  const request = page.getByRole('article', { name: /Copa Verão 2026/ });
  await request.getByRole('button', { name: 'Reprovar solicitação' }).click();
  await expect(request.getByLabel('Motivo da recusa')).toBeVisible();
  await expect(
    request.getByRole('button', { name: 'Confirmar recusa' }),
  ).toBeDisabled();
  await request
    .getByLabel('Motivo da recusa')
    .fill('Conflito com manutenção programada.');
  await request.getByRole('button', { name: 'Confirmar recusa' }).click();

  await expect(request).toContainText('Reprovado');
  await expect(request).toContainText('Conflito com manutenção programada.');
});

test('agenda municipal filtra reservas pela data selecionada', async ({
  page,
}) => {
  await loginAsMunicipality(page, '/prefeitura/calendario');
  const calendar = page.getByRole('grid', { name: /agosto 2026/i });

  await calendar.getByRole('button', { name: /21 de agosto de 2026/i }).click();
  await expect(
    page.getByText('Nenhuma reserva aprovada nesta data.'),
  ).toBeVisible();

  await calendar
    .getByRole('button', { name: /sexta-feira, 7 de agosto de 2026/i })
    .click();
  await expect(page.getByText('Copa Franca 2026')).toBeVisible();
});
