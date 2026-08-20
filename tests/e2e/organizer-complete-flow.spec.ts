import { expect, test } from '@playwright/test';

import { respeitaAntecedenciaMinima } from '@/services/reservas/regras-horario-reserva';

test('regra de reserva usa relógio injetável na fronteira de 24 horas', () => {
  const clock = { now: () => new Date('2026-08-19T12:00:00') };

  expect(respeitaAntecedenciaMinima('2026-08-20T11:59:59', clock)).toBeFalsy();
  expect(respeitaAntecedenciaMinima('2026-08-20T12:00:00', clock)).toBeTruthy();
});

test('rotas do organizador exigem ativação explícita da capacidade', async ({
  page,
}) => {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill('sem-time@campolivre.test');
  await page.getByLabel('Senha').fill('senha-mock');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.goto('/organizador/novo');

  await expect(page).toHaveURL(/\/minha-area$/);
  await expect(
    page.getByRole('button', { name: 'Ativar painel de organizador' }),
  ).toBeVisible();
});

test('conta pessoal habilita o painel de organizador sem receber campeonato', async ({
  page,
}) => {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill('sem-time@campolivre.test');
  await page.getByLabel('Senha').fill('senha-mock');
  await page.getByRole('button', { name: 'Entrar' }).click();

  await expect(page).toHaveURL(/\/minha-area$/);
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
  const session = await page.evaluate(() =>
    JSON.parse(
      sessionStorage.getItem('campo-livre:mock-personal-session') ?? '{}',
    ),
  );
  expect(session.capabilities).toContain('organizador');
  expect(session.activeContext).toBe('organizador');
  expect(session.links.organizedChampionshipIds).toEqual([]);
  expect(session.organizerEnabledAt).toBeTruthy();
});

test('painel lista somente vínculos administráveis e informa situação comercial', async ({
  page,
}) => {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill('pessoa@campolivre.test');
  await page.getByLabel('Senha').fill('senha-mock');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.goto('/organizador/inicio');

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
  await expect(meus.getByText('Colaborador')).toBeVisible();
  await expect(page.getByText('Campeonatos na Região')).toHaveCount(0);

  const comercial = page.getByRole('region', { name: 'Situação comercial' });
  await expect(
    comercial.getByText('Primeiro campeonato gratuito utilizado'),
  ).toBeVisible();
  await expect(
    comercial.getByText('1 direito adicional disponível'),
  ).toBeVisible();
});

test('responsável resolve pendências, valida, abre inscrições e inicia campeonato', async ({
  page,
}) => {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill('pessoa@campolivre.test');
  await page.getByLabel('Senha').fill('senha-mock');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.goto('/organizador/campeonato/4');

  await expect(
    page.getByRole('heading', { level: 1, name: 'Copa Verão 2026' }),
  ).toBeVisible();
  await expect(page.getByText('Você é o responsável ativo')).toBeVisible();
  await expect(page.getByText('6 pendências bloqueantes')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Abrir inscrições' }),
  ).toBeDisabled();

  for (const item of [
    'Publicar regulamento',
    'Configurar critérios de desempate',
  ]) {
    await page.getByRole('button', { name: `Registrar: ${item}` }).click();
  }

  await page.goto('/organizador/campeonato/4/times');
  await page
    .getByRole('button', { name: 'Cancelar convite de Estrela Azul' })
    .click();
  await page
    .getByRole('button', { name: 'Registrar validação dos elencos' })
    .click();

  await page.goto('/organizador/campeonato/4/chaveamento');
  await page
    .getByRole('button', { name: 'Gerar programação completa' })
    .click();
  await page.reload();
  await expect(page.getByText(/Estrutura gerada localmente/)).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Gerar programação completa' }),
  ).toBeDisabled();

  await page.goto('/organizador/campeonato/4');
  await expect(page.getByText('0 pendências bloqueantes')).toBeVisible();
  await page.getByRole('button', { name: 'Validar configuração' }).click();
  await expect(page.getByRole('status')).toHaveText(
    'Configuração validada localmente',
  );
  await page.getByRole('button', { name: 'Abrir inscrições' }).click();
  await expect(page.getByRole('status')).toHaveText('Inscrições abertas');
  await page.getByRole('button', { name: 'Iniciar campeonato' }).click();
  await expect(page.getByRole('status')).toHaveText('Campeonato em andamento');
  await expect(
    page.getByText('Composição, formato e regulamento bloqueados'),
  ).toBeVisible();
});

test('responsável convida colaboradores e transfere a responsabilidade explicitamente', async ({
  page,
}) => {
  test.setTimeout(60_000);
  await page.goto('/login');
  await page.getByLabel('E-mail').fill('pessoa@campolivre.test');
  await page.getByLabel('Senha').fill('senha-mock');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.goto('/organizador/campeonato/4');

  await page
    .getByLabel('Usuário ou e-mail do organizador')
    .fill('novo.organizador@campolivre.test');
  await page.getByRole('button', { name: 'Convidar organizador' }).click();
  await expect(
    page.getByText('novo.organizador@campolivre.test · Pendente de aceite'),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByText('novo.organizador@campolivre.test · Pendente de aceite'),
  ).toBeVisible();

  await page
    .getByRole('button', { name: 'Transferir responsabilidade' })
    .click();
  await expect(page.getByLabel('Novo responsável')).toHaveValue(
    'mock-person-collaborator-1',
  );
  await page.getByRole('button', { name: 'Confirmar transferência' }).click();
  await expect(page.locator('p[role="status"]')).toHaveText(
    'Responsabilidade transferida localmente para Juliana Lopes.',
  );
  await expect(page.getByText('Você atua como colaborador')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Transferir responsabilidade' }),
  ).toHaveCount(0);
  await page.reload();
  await expect(page.getByText('Você atua como colaborador')).toBeVisible();
  await expect(page.getByText('Responsável: Juliana Lopes')).toBeVisible();
  await expect(page.getByText('Equipe organizadora')).toHaveCount(0);

  await page.goto('/login');
  await page.getByLabel('E-mail').fill('colaborador@campolivre.test');
  await page.getByLabel('Senha').fill('senha-mock');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.goto('/organizador/campeonato/4');
  await expect(page.getByText('Você é o responsável ativo')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Transferir responsabilidade' }),
  ).toBeVisible();
  await expect(
    page.getByText('novo.organizador@campolivre.test · Pendente de aceite'),
  ).toHaveCount(0);
});

test('chaveamento usa somente participantes do campeonato e geração integral', async ({
  page,
}) => {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill('pessoa@campolivre.test');
  await page.getByLabel('Senha').fill('senha-mock');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.goto('/organizador/campeonato/4/chaveamento');

  await expect(page.getByText('Time A', { exact: true })).toBeVisible();
  await expect(page.getByText('Leões FC', { exact: true })).toBeVisible();
  await expect(page.getByText('Real Aeroporto', { exact: true })).toHaveCount(
    0,
  );
  await page
    .getByRole('button', { name: 'Gerar programação completa' })
    .click();
  await expect(page.getByRole('status')).toContainText(
    'Programação preparada localmente',
  );
});

test('papel e histórico comercial pertencem ao vínculo da conta', async ({
  page,
}) => {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill('colaborador@campolivre.test');
  await page.getByLabel('Senha').fill('senha-mock');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.goto('/organizador/campeonato/4');

  await expect(page.getByText('Você atua como colaborador')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Transferir responsabilidade' }),
  ).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: 'Cancelar campeonato' }),
  ).toHaveCount(0);

  await page.goto('/organizador/perfil');
  await expect(
    page
      .getByRole('region', { name: 'Participações como organizador' })
      .getByText('Colaborador'),
  ).toBeVisible();
  await expect(
    page.getByText('Nenhuma compra vinculada a esta conta.'),
  ).toBeVisible();
  await expect(page.getByText(/PIX/)).toHaveCount(0);
});

test('colaborador administra operações permitidas sem receber ações do responsável', async ({
  page,
}) => {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill('pessoa@campolivre.test');
  await page.getByLabel('Senha').fill('senha-mock');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.goto('/organizador/campeonato/2');

  await expect(page.getByText('Você atua como colaborador')).toBeVisible();
  await expect(page.getByText('Responsável: Carlos Mendes')).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Operar partidas' }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Preencher súmula' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Transferir responsabilidade' }),
  ).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: 'Finalizar campeonato' }),
  ).toHaveCount(0);
});

test('rotas diretas respeitam o lifecycle do campeonato', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill('pessoa@campolivre.test');
  await page.getByLabel('Senha').fill('senha-mock');
  await page.getByRole('button', { name: 'Entrar' }).click();

  await page.goto('/organizador/campeonato/7/reservas');
  await expect(page.getByText('Histórico somente leitura')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Solicitar reserva' }),
  ).toHaveCount(0);

  await page.goto('/organizador/campeonato/5/partidas');
  await expect(page.getByText('Operações indisponíveis')).toBeVisible();
  await expect(page.getByRole('button', { name: /Registrar WO/ })).toHaveCount(
    0,
  );

  await page.goto('/organizador/campeonato/7/sumula');
  await expect(
    page.getByRole('heading', { name: 'Súmula indisponível' }),
  ).toBeVisible();

  await page.goto('/organizador/campeonato/1/chaveamento');
  await expect(
    page.getByRole('button', { name: 'Gerar programação completa' }),
  ).toBeDisabled();
});

test('agendamento compartilhado persiste e habilita WO após recarregar', async ({
  page,
}) => {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill('pessoa@campolivre.test');
  await page.getByLabel('Senha').fill('senha-mock');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.goto('/organizador/campeonato/1/partidas');

  await page
    .getByRole('radio', { name: /Bairro Sul FC vs Time A, Rodada 5/ })
    .click();
  await page.getByRole('button', { name: /Salvar agendamento/ }).click();
  await page.reload();

  await expect(
    page.getByRole('button', { name: 'Registrar WO na partida 5' }),
  ).toBeVisible();
});

test('opera somente partidas do campeonato e registra WO sem publicar placar inventado', async ({
  page,
}) => {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill('pessoa@campolivre.test');
  await page.getByLabel('Senha').fill('senha-mock');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.goto('/organizador/campeonato/1/partidas');

  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Partidas · Copa Franca 2026',
    }),
  ).toBeVisible();
  await expect(page.getByText('Time A × Leões FC')).toBeVisible();
  await expect(page.getByText('Estrela Azul × Unidos do Vale')).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: 'Registrar WO na partida 7' }),
  ).toHaveCount(0);
  await page.getByRole('button', { name: 'Registrar WO na partida 1' }).click();
  await page.getByLabel('Time vencedor por WO').selectOption('1');
  await page.getByRole('button', { name: 'Confirmar WO' }).click();
  await expect(page.locator('p[role="status"]')).toHaveText(
    'WO registrado localmente; aguarda persistência e publicação pela API.',
  );
  await page.goto('/organizador/campeonato/1');
  await page.getByRole('button', { name: 'Finalizar campeonato' }).click();
  await expect(page.getByRole('status')).toContainText(
    'Finalização bloqueada: 3 partidas',
  );
});

test('solicita e cancela reserva no contexto do campeonato administrado', async ({
  page,
}) => {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill('pessoa@campolivre.test');
  await page.getByLabel('Senha').fill('senha-mock');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.goto('/organizador/campeonato/1/reservas');

  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Reservas · Copa Franca 2026',
    }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Campo Vera Cruz' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Cancelar reserva 1' }).click();
  await expect(page.getByRole('status')).toHaveText(
    'Reserva cancelada localmente.',
  );

  await page
    .getByRole('combobox', { name: 'Campo', exact: true })
    .selectOption('Campo Santa Rita');
  await page.getByLabel('Data da reserva').fill('2026-09-05');
  await page.getByLabel('Hora inicial').fill('09:00');
  await page.getByLabel('Hora final').fill('11:00');
  await page.getByRole('button', { name: 'Solicitar reserva' }).click();
  await expect(page.getByRole('status')).toHaveText(
    'Solicitação de reserva criada localmente como PENDENTE.',
  );
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Campo Santa Rita' }),
  ).toBeVisible();
});

test('bloqueia finalização incompleta e cancela preservando histórico', async ({
  page,
}) => {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill('pessoa@campolivre.test');
  await page.getByLabel('Senha').fill('senha-mock');
  await page.getByRole('button', { name: 'Entrar' }).click();

  await page.goto('/organizador/campeonato/1');
  await page.getByRole('button', { name: 'Finalizar campeonato' }).click();
  await expect(page.getByRole('status')).toContainText(
    'Finalização bloqueada: 4 partidas',
  );

  await page.goto('/organizador/campeonato/4');
  await page.getByRole('button', { name: 'Cancelar campeonato' }).click();
  await page
    .getByLabel('Motivo do cancelamento')
    .fill('Impossibilidade operacional');
  await page.getByRole('button', { name: 'Confirmar cancelamento' }).click();
  await expect(page.getByRole('status')).toHaveText(
    'Campeonato cancelado localmente; histórico preservado.',
  );
  await expect(
    page.getByRole('heading', { name: 'Campeonato cancelado' }),
  ).toBeVisible();
});

test('finaliza quando todas as partidas possuem fato definitivo', async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date('2026-08-23T12:00:00'));
  await page.goto('/login');
  await page.getByLabel('E-mail').fill('pessoa@campolivre.test');
  await page.getByLabel('Senha').fill('senha-mock');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.goto('/organizador/campeonato/1/partidas');

  for (const partida of [
    { id: 5, nome: /Bairro Sul FC vs Time A, Rodada 5/ },
    { id: 6, nome: /Real Aeroporto vs Leões FC, Rodada 5/ },
  ]) {
    await page.getByRole('radio', { name: partida.nome }).click();
    await page.getByRole('button', { name: /Salvar agendamento/ }).click();
  }

  for (const partidaId of [5, 6]) {
    await page
      .getByRole('button', { name: `Registrar WO na partida ${partidaId}` })
      .click();
    await page.getByRole('button', { name: 'Confirmar WO' }).click();
  }

  await page.getByRole('button', { name: 'Reagendar partida 7' }).click();
  await page.getByLabel('Motivo da operação').fill('Campo indisponível');
  await page.getByRole('button', { name: 'Confirmar operação' }).click();

  await page.getByRole('button', { name: 'Registrar WO na partida 7' }).click();
  await page.getByRole('button', { name: 'Confirmar WO' }).click();

  await page.goto('/organizador/campeonato/1/sumula');
  await page.getByLabel('Partida da súmula').selectOption('1');
  await page.getByLabel('Árbitro', { exact: true }).fill('Carlos Silva');
  await page.getByLabel('Primeiro assistente').fill('Ana Lima');
  await page.getByLabel('Segundo assistente').fill('Paulo Souza');
  await page.getByLabel('Quarto árbitro').fill('Lia Rocha');
  await page.getByLabel('Confirmar envio definitivo').check();
  await page
    .getByRole('button', { name: 'Confirmar resultado e súmula' })
    .click();
  await page.getByRole('button', { name: 'Enviar súmula definitiva' }).click();

  await page.goto('/organizador/campeonato/1');
  await page.getByRole('button', { name: 'Finalizar campeonato' }).click();
  await expect(page.getByRole('status')).toHaveText(
    'Campeonato encerrado; histórico preservado.',
  );
  await expect(
    page.getByRole('heading', { name: 'Campeonato encerrado' }),
  ).toBeVisible();
});

test('perfil mostra vínculos e histórico comercial sem score inventado', async ({
  page,
}) => {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill('pessoa@campolivre.test');
  await page.getByLabel('Senha').fill('senha-mock');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.goto('/organizador/perfil');

  await expect(
    page.getByRole('heading', { level: 1, name: 'Histórico do organizador' }),
  ).toBeVisible();
  await expect(
    page.getByRole('region', { name: 'Participações como organizador' }),
  ).toContainText('Copa Franca 2025');
  await expect(
    page.getByRole('region', { name: 'Histórico comercial' }),
  ).toContainText('PIX · Valor registrado no momento da compra');
  await expect(page.getByText(/score/i)).toHaveCount(0);
});
