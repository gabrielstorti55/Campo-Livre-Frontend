import { expect, type Page, test } from '@playwright/test';

async function login(page: Page, email: string) {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill(email);
  await page.getByLabel('Senha').fill('senha-mock');
  await page.getByRole('button', { name: 'Entrar' }).click();
}

async function loginAsMunicipality(page: Page) {
  await login(page, 'prefeitura@campolivre.test');
  await page.goto('/prefeitura/painel');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Prefeitura de Franca' }),
  ).toBeVisible();
}

test('rotas municipais exigem vínculo institucional', async ({ page }) => {
  await page.goto('/prefeitura/painel');
  await expect(page).toHaveURL(/\/login$/);

  await login(page, 'sem-time@campolivre.test');
  await page.goto('/prefeitura/painel');
  await expect(page).toHaveURL(/\/minha-area$/);
  await expect(page.getByText('Prefeitura de Franca')).toHaveCount(0);

  await loginAsMunicipality(page);
  await expect(page.getByText('Gestão pública municipal')).toBeVisible();

  await page.getByRole('button', { name: 'Abrir menu' }).click();
  await page.getByRole('button', { name: 'Sair da conta' }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto('/prefeitura/aprovacoes');
  await expect(page).toHaveURL(/\/login$/);
});

test('prefeitura cadastra campo, persiste e controla disponibilidade', async ({
  page,
}) => {
  await loginAsMunicipality(page);
  await page.getByRole('link', { name: 'Campos' }).click();
  await page.getByRole('link', { name: 'Novo campo' }).click();

  await page.getByLabel('Nome do campo').fill('Campo Jardim Petráglia');
  await page.getByLabel('Endereço completo').fill('Rua das Acácias, 210');
  await page.getByLabel('Bairro / Região').click();
  await page.getByRole('option', { name: 'Jardim Palmeiras' }).click();
  await page.getByLabel('Tipo de gramado').click();
  await page.getByRole('option', { name: 'Sintético' }).click();
  await page
    .getByLabel('Observações')
    .fill('Iluminação e vestiários disponíveis.');
  await page.getByRole('button', { name: 'Cadastrar campo' }).click();

  await expect(page).toHaveURL(/\/prefeitura\/campos$/);
  const field = page.getByRole('article', { name: 'Campo Jardim Petráglia' });
  await expect(field).toContainText('Sintético');
  await expect(field).toContainText('Disponível');
  await field
    .getByRole('button', {
      name: 'Colocar Campo Jardim Petráglia em manutenção',
    })
    .click();
  await expect(field).toContainText('Em manutenção');

  await page.reload();
  await expect(
    page.getByRole('article', { name: 'Campo Jardim Petráglia' }),
  ).toContainText('Em manutenção');

  await page
    .getByRole('button', { name: 'Disponibilizar Campo Jardim Petráglia' })
    .click();
  await login(page, 'pessoa@campolivre.test');
  await page.goto('/organizador/campeonato/1/reservas');
  await expect(
    page
      .getByRole('combobox', { name: 'Campo', exact: true })
      .getByRole('option', { name: 'Campo Jardim Petráglia' }),
  ).toBeAttached();
});

test('prefeitura rejeita campo duplicado e dados obrigatórios vazios', async ({
  page,
}) => {
  await loginAsMunicipality(page);
  await page.goto('/prefeitura/campos/novo');
  await page.getByLabel('Nome do campo').fill('   ');
  await page.getByLabel('Endereço completo').fill('   ');
  await page.getByRole('button', { name: 'Cadastrar campo' }).click();
  await expect(
    page
      .getByRole('alert')
      .filter({ hasText: 'Informe nome e endereço válidos.' }),
  ).toHaveText('Informe nome e endereço válidos.');

  await page.getByLabel('Nome do campo').fill('Campo Vera Cruz');
  await page.getByLabel('Endereço completo').fill('Outro endereço');
  await page.getByRole('button', { name: 'Cadastrar campo' }).click();
  await expect(
    page
      .getByRole('alert')
      .filter({ hasText: 'Já existe um campo cadastrado com esse nome.' }),
  ).toHaveText('Já existe um campo cadastrado com esse nome.');
  await expect(page).toHaveURL(/\/prefeitura\/campos\/novo$/);
});

test('decisão municipal atualiza calendário e retorna ao organizador', async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date('2026-08-20T12:00:00'));
  await login(page, 'pessoa@campolivre.test');
  await page.goto('/organizador/campeonato/1/reservas');
  await page
    .getByRole('combobox', { name: 'Campo', exact: true })
    .selectOption('Campo Santa Rita');
  await page.getByLabel('Data da reserva').fill('2026-09-28');
  await page.getByLabel('Hora inicial').fill('09:00');
  await page.getByLabel('Hora final').fill('11:00');
  await page.getByRole('button', { name: 'Solicitar reserva' }).click();
  await expect(page.getByRole('status')).toHaveText(
    'Solicitação de reserva criada localmente como PENDENTE.',
  );

  await loginAsMunicipality(page);
  await page.getByRole('link', { name: 'Aprovações' }).click();
  const request = page.getByRole('article', {
    name: /Copa Franca 2026.*Campo Santa Rita.*28\/09\/2026.*09:00.*11:00/,
  });
  await request.getByRole('button', { name: 'Aprovar solicitação' }).click();
  await expect(request).toContainText('Aprovado');
  await page.reload();
  await expect(
    page.getByRole('article', {
      name: /Copa Franca 2026.*Campo Santa Rita.*28\/09\/2026.*09:00.*11:00/,
    }),
  ).toContainText('Aprovado');

  await page.goto('/prefeitura/calendario');
  const calendar = page.getByRole('grid', { name: /setembro 2026/i });
  await calendar
    .getByRole('button', { name: /28 de setembro de 2026/i })
    .click();
  await expect(
    page.getByRole('region', { name: 'Reservas de 28/09/2026' }),
  ).toContainText('Copa Franca 2026');

  await login(page, 'pessoa@campolivre.test');
  await page.goto('/organizador/campeonato/1/reservas');
  await expect(
    page.getByRole('article', { name: /Campo Santa Rita.*28\/09\/2026/ }),
  ).toContainText('APROVADA');

  await page
    .getByRole('combobox', { name: 'Campo', exact: true })
    .selectOption('Campo Vera Cruz');
  await page.getByLabel('Data da reserva').fill('2026-08-29');
  await page.getByLabel('Hora inicial').fill('12:00');
  await page.getByLabel('Hora final').fill('14:00');
  await page.getByRole('button', { name: 'Solicitar reserva' }).click();
  await expect(
    page.getByRole('article', { name: /Campo Santa Rita.*28\/09\/2026/ }),
  ).toContainText('APROVADA');
  await expect(
    page.getByRole('article', { name: /Campo Vera Cruz.*29\/08\/2026/ }),
  ).toContainText('PENDENTE');
});

test('campo com reserva aprovada não entra em manutenção', async ({ page }) => {
  await loginAsMunicipality(page);
  await page.goto('/prefeitura/campos');
  const field = page.getByRole('article', { name: 'Campo Vera Cruz' });
  await field
    .getByRole('button', { name: 'Colocar Campo Vera Cruz em manutenção' })
    .click();
  await expect(page.getByRole('status')).toHaveText(
    'Manutenção bloqueada: o campo possui reservas aprovadas.',
  );
  await expect(field).toContainText('Disponível');
});

test('campo em manutenção bloqueia aprovação sem consumir a solicitação', async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date('2026-08-20T12:00:00'));
  await loginAsMunicipality(page);
  await page.goto('/prefeitura/campos');
  const field = page.getByRole('article', { name: 'Campo Aeroporto' });
  await field
    .getByRole('button', { name: 'Colocar Campo Aeroporto em manutenção' })
    .click();

  await page.goto('/prefeitura/aprovacoes');
  const request = page.getByRole('article', { name: /Copa Verão 2026/ });
  await request.getByRole('button', { name: 'Aprovar solicitação' }).click();
  await expect(page.getByRole('status')).toHaveText(
    'Aprovação bloqueada: o campo está em manutenção.',
  );
  await expect(request).toContainText('Pendente');
  await expect(
    request.getByRole('button', { name: 'Aprovar solicitação' }),
  ).toBeVisible();
});

test('recusa exige motivo persistente e não ocupa o calendário', async ({
  page,
}) => {
  await loginAsMunicipality(page);
  await page.getByRole('link', { name: 'Aprovações' }).click();
  const request = page.getByRole('article', { name: /Liga Bairro Norte/ });
  await request.getByRole('button', { name: 'Reprovar solicitação' }).click();
  await expect(
    request.getByRole('button', { name: 'Confirmar recusa' }),
  ).toBeDisabled();
  await request
    .getByLabel('Motivo da recusa')
    .fill('Conflito com manutenção programada.');
  await request.getByRole('button', { name: 'Confirmar recusa' }).click();
  await expect(request).toContainText('Reprovado');
  await expect(request).toContainText('Conflito com manutenção programada.');
  await page.reload();
  await expect(
    page.getByRole('article', { name: /Liga Bairro Norte/ }),
  ).toContainText('Conflito com manutenção programada.');

  await page.goto('/prefeitura/calendario');
  const calendar = page.getByRole('grid', { name: /agosto 2026/i });
  await calendar.getByRole('button', { name: /24 de agosto de 2026/i }).click();
  const day = page.getByRole('region', { name: 'Reservas de 24/08/2026' });
  await expect(day).toContainText('Nenhuma reserva aprovada nesta data.');
  await expect(day).not.toContainText('Liga Bairro Norte');
});

test('recusa restaura o foco ao cancelar e o move para o retorno ao confirmar', async ({
  page,
}) => {
  await loginAsMunicipality(page);
  await page.goto('/prefeitura/aprovacoes');
  const request = page.getByRole('article', { name: /Liga Bairro Norte/ });
  const rejectButton = request.getByRole('button', {
    name: 'Reprovar solicitação',
  });

  await rejectButton.click();
  await request.getByRole('button', { name: 'Cancelar' }).click();
  await expect(rejectButton).toBeFocused();

  await rejectButton.click();
  await request
    .getByLabel('Motivo da recusa')
    .fill('Agenda municipal indisponível.');
  await request.getByRole('button', { name: 'Confirmar recusa' }).click();
  await expect(page.getByRole('status')).toBeFocused();
});

test('aprovação revalida a antecedência mínima de 24 horas', async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date('2026-08-20T10:00:00'));
  await login(page, 'pessoa@campolivre.test');
  await page.goto('/organizador/campeonato/1/reservas');
  await page
    .getByRole('combobox', { name: 'Campo', exact: true })
    .selectOption({ label: 'Campo São José' });
  await page.getByLabel('Data da reserva').fill('2026-08-22');
  await page.getByLabel('Hora inicial').fill('12:00');
  await page.getByLabel('Hora final').fill('14:00');
  await page.getByRole('button', { name: 'Solicitar reserva' }).click();

  await page.clock.setFixedTime(new Date('2026-08-21T13:00:00'));
  await loginAsMunicipality(page);
  await page.goto('/prefeitura/aprovacoes');
  const request = page.getByRole('article', {
    name: /Copa Franca 2026.*Campo São José.*22\/08\/2026.*12:00.*14:00/,
  });
  await request.getByRole('button', { name: 'Aprovar solicitação' }).click();

  await expect(page.getByRole('status')).toHaveText(
    'Aprovação bloqueada: a reserva não possui mais 24 horas de antecedência.',
  );
  await expect(request).toContainText('Pendente');
});

test('prefeitura suspende e reativa credenciamento do organizador', async ({
  page,
}) => {
  await loginAsMunicipality(page);
  await page.getByRole('link', { name: 'Organizadores' }).click();
  const organizer = page.getByRole('article', { name: 'Marcos Oliveira' });
  await organizer
    .getByRole('button', { name: 'Suspender Marcos Oliveira' })
    .click();
  await expect(organizer).toContainText('Suspenso');
  await page.reload();
  const persistedOrganizer = page.getByRole('article', {
    name: 'Marcos Oliveira',
  });
  await expect(persistedOrganizer).toContainText('Suspenso');

  await login(page, 'pessoa@campolivre.test');
  await page.goto('/organizador/campeonato/1/reservas');
  await expect(
    page.getByRole('heading', { name: 'Credenciamento suspenso' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Solicitar reserva' }),
  ).toHaveCount(0);

  await loginAsMunicipality(page);
  await page.goto('/prefeitura/organizadores');
  await page
    .getByRole('article', { name: 'Marcos Oliveira' })
    .getByRole('button', { name: 'Reativar Marcos Oliveira' })
    .click();
  await login(page, 'pessoa@campolivre.test');
  await page.goto('/organizador/campeonato/1/reservas');
  await expect(
    page.getByRole('button', { name: 'Solicitar reserva' }),
  ).toBeVisible();
});

test('contas do mesmo campeonato não sobrescrevem decisões municipais', async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date('2026-08-20T12:00:00'));
  await login(page, 'pessoa@campolivre.test');
  await page.goto('/organizador/campeonato/4/reservas');
  await page
    .getByRole('combobox', { name: 'Campo', exact: true })
    .selectOption({ label: 'Campo Santa Rita' });
  await page.getByLabel('Data da reserva').fill('2026-09-20');
  await page.getByLabel('Hora inicial').fill('09:00');
  await page.getByLabel('Hora final').fill('11:00');
  await page.getByRole('button', { name: 'Solicitar reserva' }).click();

  await loginAsMunicipality(page);
  await page.goto('/prefeitura/aprovacoes');
  const first = page.getByRole('article', {
    name: /Marcos Oliveira.*Campo Santa Rita.*20\/09\/2026/,
  });
  await first.getByRole('button', { name: /Aprovar solicitação/ }).click();

  await login(page, 'colaborador@campolivre.test');
  await page.goto('/organizador/campeonato/4/reservas');
  await page
    .getByRole('combobox', { name: 'Campo', exact: true })
    .selectOption({ label: 'Campo Aeroporto' });
  await page.getByLabel('Data da reserva').fill('2026-09-21');
  await page.getByLabel('Hora inicial').fill('12:00');
  await page.getByLabel('Hora final').fill('14:00');
  await page.getByRole('button', { name: 'Solicitar reserva' }).click();

  await loginAsMunicipality(page);
  await page.goto('/prefeitura/aprovacoes');
  await expect(
    page.getByRole('article', {
      name: /Marcos Oliveira.*Campo Santa Rita.*20\/09\/2026/,
    }),
  ).toContainText('Aprovado');
  await expect(
    page.getByRole('article', {
      name: /Juliana Lopes.*Campo Aeroporto.*21\/09\/2026/,
    }),
  ).toContainText('Pendente');
});
