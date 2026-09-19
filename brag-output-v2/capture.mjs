import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const baseURL = 'http://127.0.0.1:4198';
const out = path.resolve('brag-output-v2/captures');
await mkdir(out, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1600, height: 900 },
  deviceScaleFactor: 1,
  colorScheme: 'light',
});
const page = await context.newPage();

async function settle() {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1800);
}

async function shot(name) {
  await page.screenshot({ path: path.join(out, `${name}.png`) });
}

const result = { captures: [], links: {} };

await page.goto(`${baseURL}/`);
await settle();
await shot('01-inicio');
result.captures.push({ name: '01-inicio', url: page.url(), title: await page.title() });

await page.goto(`${baseURL}/campeonatos`);
await settle();
await shot('02-campeonatos');
const campeonatoLinks = await page.locator('a[href^="/campeonatos/"]').evaluateAll((links) =>
  links.map((link) => ({ href: link.getAttribute('href'), text: link.textContent?.replace(/\s+/g, ' ').trim() })),
);
result.links.campeonatos = campeonatoLinks;
result.captures.push({ name: '02-campeonatos', url: page.url(), title: await page.title() });

const campeonatoHref = campeonatoLinks.find((link) =>
  link.text?.includes('Copa Franca 2026'),
)?.href;
if (!campeonatoHref) throw new Error('Nenhum campeonato público encontrado');
await page.goto(`${baseURL}${campeonatoHref}`);
await settle();
await shot('03-campeonato-detalhe');
result.captures.push({ name: '03-campeonato-detalhe', url: page.url(), title: await page.title() });

await page.goto(`${baseURL}/partidas`);
await settle();
await shot('04-partidas');
const partidaLinks = await page.locator('a[href^="/partidas/"]').evaluateAll((links) =>
  links.map((link) => ({ href: link.getAttribute('href'), text: link.textContent?.replace(/\s+/g, ' ').trim() })),
);
result.links.partidas = partidaLinks;
result.captures.push({ name: '04-partidas', url: page.url(), title: await page.title() });

const partidaHref = partidaLinks[0]?.href;
if (!partidaHref) throw new Error('Nenhuma partida pública encontrada');
await page.goto(`${baseURL}${partidaHref}`);
await settle();
await shot('05-partida-detalhe');
result.captures.push({ name: '05-partida-detalhe', url: page.url(), title: await page.title() });

await writeFile(path.join(out, 'capture-manifest.json'), JSON.stringify(result, null, 2));
await browser.close();
console.log(JSON.stringify(result, null, 2));
