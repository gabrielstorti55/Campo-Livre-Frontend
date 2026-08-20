import { expect, type Page, test } from '@playwright/test';

async function loginWithoutTeam(page: Page) {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill('sem-time@campolivre.test');
  await page.getByLabel('Senha').fill('senha-mock');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/minha-area$/);
}

test('atleta encerra a sessão e não retorna por deep link privado', async ({
  page,
}) => {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill('pessoa@campolivre.test');
  await page.getByLabel('Senha').fill('senha-mock');
  await page.getByRole('button', { name: 'Entrar' }).click();

  await page.getByRole('button', { name: 'Abrir menu' }).click();
  await page.getByRole('button', { name: 'Sair da conta' }).click();
  await expect(page).toHaveURL(/\/login$/);

  await page.goto('/atleta/perfil');
  await expect(page).toHaveURL(/\/login$/);
});

test('convite nominal aparece somente para a conta destinatária', async ({
  page,
}) => {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill('pessoa@campolivre.test');
  await page.getByLabel('Senha').fill('senha-mock');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.goto('/atleta/time/buscar');
  await expect(
    page.getByRole('button', { name: 'Aceitar convite do Leões FC' }),
  ).toHaveCount(0);
});

test('recusa de convite nominal permanece após reload', async ({ page }) => {
  await loginWithoutTeam(page);
  await page.goto('/atleta/time/buscar');
  await page
    .getByRole('button', { name: 'Recusar convite do Leões FC' })
    .click();
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Aceitar convite do Leões FC' }),
  ).toHaveCount(0);
});

test('rotas pessoais exigem sessão e gestão exige capitania do time', async ({
  page,
}) => {
  await page.goto('/atleta/inicio');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByText('Marcos Oliveira')).toHaveCount(0);

  await page.goto('/times/criar');
  await expect(page).toHaveURL(/\/login$/);

  await loginWithoutTeam(page);
  await page.goto('/atleta/time/1');
  await expect(
    page.getByRole('heading', { name: 'Você não pode gerenciar este time' }),
  ).toBeVisible();
  await expect(page.getByText('Painel do capitão')).toHaveCount(0);

  await page.goto('/atleta/time/999');
  await expect(
    page.getByRole('heading', { name: 'Time não encontrado' }),
  ).toBeVisible();
});

test('perfil do atleta usa somente fatos esportivos publicados e seus times', async ({
  page,
}) => {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill('pessoa@campolivre.test');
  await page.getByLabel('Senha').fill('senha-mock');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.goto('/atleta/perfil');

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

test('área do atleta mostra somente eventos e jogos dos times vinculados', async ({
  page,
}) => {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill('pessoa@campolivre.test');
  await page.getByLabel('Senha').fill('senha-mock');
  await page.getByRole('button', { name: 'Entrar' }).click();

  const proximosJogos = page.getByRole('region', {
    name: 'Meus próximos jogos',
  });
  await expect(proximosJogos.getByText(/Time A × Leões FC/)).toBeVisible();
  await expect(proximosJogos.getByText(/Estrela Azul/)).toHaveCount(0);

  await page.goto('/atleta/meus-eventos');
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
  await page.goto('/login');
  await page.getByLabel('E-mail').fill('pessoa@campolivre.test');
  await page.getByLabel('Senha').fill('senha-mock');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.evaluate(() => {
    const key = 'campo-livre:mock-personal-session';
    const session = JSON.parse(sessionStorage.getItem(key) ?? '{}');
    session.links.teamIds = ['5'];
    sessionStorage.setItem(key, JSON.stringify(session));
  });
  await page.goto('/atleta/meus-eventos');
  await page.getByRole('tab', { name: 'Encerrados' }).click();
  const cancelledEvent = page
    .getByRole('tabpanel', { name: 'Encerrados' })
    .getByRole('link', { name: /Copa Municipal Cancelada/ });
  await expect(cancelledEvent).toContainText('Cancelado');
});

test('atleta cria um time, torna-se capitão e mantém o vínculo na sessão', async ({
  page,
}) => {
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

  await expect(page).toHaveURL(/\/atleta\/time\/local-/);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Falcões da Vila' }),
  ).toBeVisible();
  await expect(page.getByText('Painel do capitão')).toBeVisible();
  await expect(page.getByText('Copa Franca 2026')).toHaveCount(0);
  await page.getByRole('tab', { name: 'Jogos' }).click();
  await expect(page.getByRole('tabpanel', { name: 'Jogos' })).toContainText(
    'Nenhum próximo jogo cadastrado para este time.',
  );
  await expect(
    page.getByRole('region', { name: 'Campeonatos inscritos' }),
  ).toContainText('Nenhum campeonato inscrito');

  const session = await page.evaluate(() =>
    JSON.parse(
      sessionStorage.getItem('campo-livre:mock-personal-session') ?? '{}',
    ),
  );
  expect(session.capabilities).toContain('atleta');
  expect(session.links.teamIds).toHaveLength(1);
  expect(session.links.createdTeams[0].name).toBe('Falcões da Vila');
  expect(session.links.createdTeams[0].modality).toBe('Campo');

  await page.goto('/atleta/inicio');
  await expect(
    page
      .getByRole('region', { name: 'Meus Times' })
      .getByRole('link', { name: /Falcões da Vila/ }),
  ).toBeVisible();
});

test('atleta aceita convite nominal e passa a ver somente seus vínculos', async ({
  page,
}) => {
  await loginWithoutTeam(page);
  await page.getByRole('link', { name: 'Entrar em um time' }).click();

  await page
    .getByRole('button', { name: 'Aceitar convite do Leões FC' })
    .click();

  await expect(page).toHaveURL(/\/atleta\/inicio$/);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Lucas Ferreira' }),
  ).toBeVisible();

  const meusTimes = page.getByRole('region', { name: 'Meus Times' });
  const linkedTeam = meusTimes.getByRole('link', { name: /Leões FC/ });
  await expect(linkedTeam).toBeVisible();
  await expect(linkedTeam).toHaveAttribute('href', '/times/2');
  await expect(meusTimes.getByText('Time A')).toHaveCount(0);

  const session = await page.evaluate(() =>
    JSON.parse(
      sessionStorage.getItem('campo-livre:mock-personal-session') ?? '{}',
    ),
  );
  expect(session.capabilities).toContain('atleta');
  expect(session.activeContext).toBe('atleta');
  expect(session.links.teamIds).toEqual(['2']);
  expect(session.links.captainTeamIds).toEqual([]);

  await page.reload();
  await expect(
    page.getByRole('region', { name: 'Meus Times' }).getByRole('link', {
      name: /Leões FC/,
    }),
  ).toBeVisible();
  await page.goto('/atleta/time/buscar');
  await expect(
    page.getByRole('button', { name: 'Aceitar convite do Leões FC' }),
  ).toHaveCount(0);
});
