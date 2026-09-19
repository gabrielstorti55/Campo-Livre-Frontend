import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const baseURL = 'http://127.0.0.1:4199';
const outputDir = path.resolve('brag-output-v3/captures');
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1600, height: 900 },
  deviceScaleFactor: 1,
  colorScheme: 'light',
  reducedMotion: 'reduce',
});
const page = await context.newPage();
page.setDefaultTimeout(120_000);
page.setDefaultNavigationTimeout(180_000);

const manifest = [];

async function settle() {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2600);
}

async function recoverColdRoute() {
  const notFound = await page
    .getByRole('heading', { name: 'Página não encontrada' })
    .isVisible()
    .catch(() => false);
  if (notFound) {
    await page.reload();
    await settle();
  }
}

async function capture(name, chapter, route) {
  await page.screenshot({ path: path.join(outputDir, `${name}.png`) });
  manifest.push({ name, chapter, route, finalUrl: page.url(), title: await page.title() });
}

async function publicShot(name, route) {
  await page.goto(`${baseURL}${route}`);
  await settle();
  await recoverColdRoute();
  await capture(name, 'publico', route);
}

async function authenticatedShot(name, chapter, email, route) {
  await page.goto(`${baseURL}${route}`);
  await settle();
  await recoverColdRoute();

  const returnTo = encodeURIComponent(route);
  await page.goto(`${baseURL}/login?returnTo=${returnTo}`);
  await settle();
  await page.getByLabel('E-mail').fill(email);
  await page.getByLabel('Senha').fill('senha-mock');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.waitForURL((url) => url.pathname === route, { timeout: 120_000 });
  await settle();
  await recoverColdRoute();
  if (new URL(page.url()).pathname !== route) {
    throw new Error(`Rota divergente para ${name}: ${page.url()}`);
  }
  await capture(name, chapter, route);
}

await publicShot('01-publico-inicio', '/');
await publicShot('02-publico-campeonatos', '/campeonatos');
await publicShot('03-publico-artilharia', '/campeonatos/1/artilharia');
await publicShot('04-publico-partida', '/partidas/3');

await authenticatedShot('05-atleta-inicio', 'atleta', 'pessoa@campolivre.test', '/atleta/inicio');
await authenticatedShot('06-atleta-buscar-times', 'atleta', 'sem-time@campolivre.test', '/atleta/time/buscar');
await authenticatedShot('07-atleta-criar-time', 'atleta', 'sem-time@campolivre.test', '/atleta/time/criar');
await authenticatedShot('08-atleta-perfil', 'atleta', 'pessoa@campolivre.test', '/atleta/perfil');

await authenticatedShot('09-organizador-inicio', 'organizador', 'pessoa@campolivre.test', '/organizador/inicio');
await authenticatedShot('10-organizador-workspace', 'organizador', 'pessoa@campolivre.test', '/organizador/campeonato/4');
await authenticatedShot('11-organizador-times', 'organizador', 'pessoa@campolivre.test', '/organizador/campeonato/4/times');
await authenticatedShot('12-organizador-chaveamento', 'organizador', 'pessoa@campolivre.test', '/organizador/campeonato/4/chaveamento');
await authenticatedShot('13-organizador-partidas', 'organizador', 'pessoa@campolivre.test', '/organizador/campeonato/1/partidas');
await authenticatedShot('14-organizador-reservas', 'organizador', 'pessoa@campolivre.test', '/organizador/campeonato/1/reservas');
await authenticatedShot('14b-organizador-sumula', 'organizador', 'pessoa@campolivre.test', '/organizador/campeonato/1/sumula');

await authenticatedShot('15-prefeitura-painel', 'prefeitura', 'prefeitura@campolivre.test', '/prefeitura/painel');
await authenticatedShot('16-prefeitura-campos', 'prefeitura', 'prefeitura@campolivre.test', '/prefeitura/campos');
await authenticatedShot('17-prefeitura-aprovacoes', 'prefeitura', 'prefeitura@campolivre.test', '/prefeitura/aprovacoes');
await authenticatedShot('18-prefeitura-calendario', 'prefeitura', 'prefeitura@campolivre.test', '/prefeitura/calendario');
await authenticatedShot('19-prefeitura-organizadores', 'prefeitura', 'prefeitura@campolivre.test', '/prefeitura/organizadores');

await writeFile(path.join(outputDir, 'capture-manifest.json'), JSON.stringify(manifest, null, 2));
await browser.close();
console.log(JSON.stringify({ count: manifest.length, manifest }, null, 2));
