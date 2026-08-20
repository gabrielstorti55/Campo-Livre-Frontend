import { expect, type Page, test } from '@playwright/test';

async function loginAsOrganizer(page: Page) {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill('pessoa@campolivre.test');
  await page.getByLabel('Senha').fill('senha-mock');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/atleta\/inicio$/);
}

async function loginAsMunicipality(page: Page) {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill('prefeitura@campolivre.test');
  await page.getByLabel('Senha').fill('senha-mock');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.goto('/prefeitura/painel');
}

test('entrada em time ocorre por convite nominal, sem solicitação aberta', async ({
  page,
}) => {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill('sem-time@campolivre.test');
  await page.getByLabel('Senha').fill('senha-mock');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.goto('/atleta/time/buscar');

  await expect(
    page.getByRole('heading', { name: 'Convites para times' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Aceitar convite do Leões FC' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Recusar convite do Leões FC' }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Solicitar' })).toHaveCount(0);
  await expect(page.getByText('Tenho um código de convite')).toHaveCount(0);
});

test('capitão convida uma conta nominal em vez de adicionar jogador diretamente', async ({
  page,
}) => {
  await loginAsOrganizer(page);
  await page.goto('/atleta/time/1');

  await expect(page.getByLabel('Conta do atleta')).toBeVisible();
  await expect(page.getByLabel('Forma de envio')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Enviar convite nominal' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Adicionar jogador' }),
  ).toHaveCount(0);
  await page.getByLabel('Conta do atleta').fill('atleta@campolivre.test');
  await page.getByLabel('Forma de envio').selectOption('link');
  await page.getByRole('button', { name: 'Enviar convite nominal' }).click();
  await expect(
    page.getByRole('textbox', { name: 'Link compartilhável' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Reenviar convite' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Cancelar convite' }).click();
  await expect(
    page.getByRole('textbox', { name: 'Link compartilhável' }),
  ).toHaveCount(0);

  await page.goto('/atleta/time/criar');
  await expect(
    page.getByRole('button', { name: 'Salvar time e convidar atletas' }),
  ).toBeVisible();
  await expect(page.getByText(/adicionar jogadores/i)).toHaveCount(0);
});

test('página pública do time exibe somente a projeção permitida do elenco', async ({
  page,
}) => {
  await page.goto('/times/1');

  const roster = page.getByRole('region', { name: 'Elenco público' });
  await expect(roster).toBeVisible();
  await expect(roster.getByText('Marcos Oliveira')).toBeVisible();
  await expect(roster.getByText('Capitão')).toBeVisible();
  await expect(roster.getByText('7 gols')).toBeVisible();
  await expect(roster.getByText(/desde 2024/i)).toBeVisible();
  await expect(
    roster.getByRole('img', { name: 'Foto de Marcos Oliveira' }),
  ).toBeVisible();
  await expect(page.getByText('CPF')).toHaveCount(0);
  await expect(page.getByText(/@campolivre\.test/)).toHaveCount(0);

  await page.goto('/times/2');
  await expect(
    page
      .getByRole('region', { name: 'Elenco público' })
      .getByText('Henrique Alves'),
  ).toBeVisible();
  await expect(page.getByText('Marcos Oliveira')).toHaveCount(0);

  await page.goto('/times');
  await expect(page.getByText(/sem expor elenco/i)).toHaveCount(0);
  await expect(page.getByText(/projeção esportiva autorizada/i)).toBeVisible();
});

test('campeonato nasce como rascunho e recebe times somente por convite', async ({
  page,
}) => {
  await loginAsOrganizer(page);
  await page.goto('/organizador/novo');

  await expect(page.getByText('Rascunho', { exact: true })).toBeVisible();
  await expect(page.getByText(/responsável: Marcos Oliveira/i)).toBeVisible();
  await expect(page.getByLabel('Contexto responsável')).toBeVisible();
  await expect(page.getByLabel('Município')).toBeVisible();
  await expect(page.getByLabel('UF')).toBeVisible();
  await expect(page.getByLabel('Visibilidade')).toBeVisible();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(
    page.getByRole('heading', { name: 'Convidar times' }),
  ).toHaveCount(0);
  await page.getByLabel('Nome do campeonato').fill('Copa Teste');
  await page.getByLabel('Município').fill('Franca');
  await page.getByLabel('Data inicial prevista').fill('2026-09-01');
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(
    page.getByRole('heading', { name: 'Convidar times' }),
  ).toBeVisible();
  await expect(page.getByLabel('Time convidado')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Enviar convite ao time' }),
  ).toBeVisible();
  await expect(page.getByText('Cadastrar Normal')).toHaveCount(0);
  await expect(page.getByText('Jogadores')).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: 'Salvar rascunho' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Enviar convite ao time' }).click();
  await expect(
    page.getByRole('button', { name: 'Cancelar convite de Time A' }),
  ).toBeVisible();

  await page.goto('/atleta/campeonatos');
  await expect(page.getByText('Solicitar inscrição')).toHaveCount(0);
  await expect(
    page
      .getByRole('region', { name: 'Campeonato Copa Franca 2026' })
      .getByText('Participação por convite do organizador ao capitão'),
  ).toBeVisible();

  await page.goto('/organizador/campeonato/4/times');
  const elencoTimeA = page.getByRole('region', {
    name: 'Elenco inscrito de Time A',
  });
  await expect(
    elencoTimeA.getByText('Elenco inscrito no campeonato'),
  ).toBeVisible();
  await expect(elencoTimeA.getByText(/limite: 7 a 18 atletas/i)).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Convidar time' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Adicionar time' }),
  ).toHaveCount(0);
});

test('súmula reúne fatos obrigatórios antes da confirmação definitiva', async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date('2026-08-23T12:00:00'));
  await loginAsOrganizer(page);
  await page.goto('/organizador/campeonato/1/sumula');

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
  await expect(page.getByLabel('Minuto do cartão')).toBeVisible();
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

  await page
    .getByRole('button', { name: 'Confirmar resultado e súmula' })
    .click();
  await expect(
    page.getByRole('button', { name: 'Cancelar envio' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Enviar súmula definitiva' }),
  ).toBeVisible();
  await expect(page.getByLabel('Gols de Time A')).toBeDisabled();
  await expect(page.getByLabel('Partida da súmula')).toBeDisabled();
  await page.getByRole('button', { name: 'Enviar súmula definitiva' }).click();
  await page.goto('/organizador/campeonato/1');
  await page.getByRole('button', { name: 'Finalizar campeonato' }).click();
  await expect(page.getByRole('status')).toContainText(
    'Finalização bloqueada: 3 partidas',
  );
});

test('recusa de reserva exige motivo e aparece no histórico local', async ({
  page,
}) => {
  await loginAsMunicipality(page);
  await page.goto('/prefeitura/aprovacoes');

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
  await loginAsMunicipality(page);
  await page.goto('/prefeitura/calendario');
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
