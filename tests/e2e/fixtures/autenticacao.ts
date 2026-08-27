import { expect, type Page } from '@playwright/test';

export type PersonaAutenticacao =
  | 'atleta'
  | 'semTime'
  | 'organizador'
  | 'colaborador'
  | 'prefeitura'
  | 'atletaCancelado';

const emailPorPersona: Record<PersonaAutenticacao, string> = {
  atleta: 'pessoa@campolivre.test',
  semTime: 'sem-time@campolivre.test',
  organizador: 'pessoa@campolivre.test',
  colaborador: 'colaborador@campolivre.test',
  prefeitura: 'prefeitura@campolivre.test',
  atletaCancelado: 'atleta-cancelado@campolivre.test',
};

export async function autenticarEm(
  page: Page,
  persona: PersonaAutenticacao,
  destino: string,
): Promise<void> {
  const retorno = encodeURIComponent(destino);
  await page.goto(`/login?returnTo=${retorno}`);
  await page.getByLabel('E-mail').fill(emailPorPersona[persona]);
  await page.getByLabel('Senha').fill('senha-mock');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(
    (url) => `${url.pathname}${url.search}` === destino,
    { timeout: 60_000 },
  );
}

export async function reautenticarEm(
  page: Page,
  persona: PersonaAutenticacao,
  destino: string,
): Promise<void> {
  await autenticarEm(page, persona, destino);
}
