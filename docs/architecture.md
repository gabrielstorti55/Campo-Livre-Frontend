# Arquitetura do frontend

## Objetivo

Usar Next.js com App Router como base web do CampoLivre, mantendo rotas, apresentação, estado, regras locais e dados simulados em limites previsíveis. O projeto ainda é um frontend demonstrável: autorização canônica e persistência definitiva pertencem ao backend.

## Estrutura

```text
src/
├── app/          # rotas, layouts e entrypoints do Next.js
├── screens/      # composição das telas por contexto de uso
├── components/   # primitivas, padrões de layout e módulos de domínio
├── hooks/        # hooks React compartilhados
├── services/     # consultas, adapters e regras locais
├── stores/       # estado reativo e persistência no navegador
├── types/        # contratos internos estáveis
├── mocks/        # fixtures e cenários simulados
├── layouts/      # shells e composição estrutural das áreas
├── utils/        # utilitários técnicos
└── constants/    # constantes compartilhadas
```

Diretórios vazios não são mantidos. Uma camada aparece apenas quando possui responsabilidade real.

## Limites

### `app`

`src/app` é a única fonte de rotas. Contém apenas arquivos reconhecidos pelo App Router, estilos globais e adaptadores pequenos que renderizam telas de `screens`. O grupo `(explore)` organiza a consulta pública sem alterar as URLs.

Arquivos de rota não concentram regras de negócio. Rotas autenticadas passam pelos layouts de atleta, organizador ou Prefeitura. A URL legada `/times/criar` apenas redireciona para `/atleta/time/criar`, evitando uma segunda implementação sem gate.

Não existe `src/pages` nem uma pasta paralela `routes`.

### `screens`

As telas são separadas pelo contexto que as apresenta:

- `publico`: consulta sem sessão;
- `conta`: área pessoal autenticada comum;
- `atleta`: jornadas e operações do atleta;
- `organizador`: administração de campeonatos;
- `prefeitura`: campos, reservas e credenciamento municipal.

Telas compõem hooks, serviços, stores e componentes. Elas não definem URLs; essa responsabilidade permanece em `app`.

### `components`

- `ui`: primitivas shadcn/ui e Radix, mantidas com seus nomes técnicos;
- `layout`: padrões visuais reutilizáveis do CampoLivre;
- `modules/<dominio>`: composições reais de campeonatos, partidas e outros domínios.

Componentes de apresentação devem preferir props e tipos estáveis. Consulta e seleção de dados pertencem às telas ou aos serviços; dependências diretas de fixtures devem ser reduzidas quando esses módulos forem alterados.

### Estado, regras e dados

- `hooks`: integração React reutilizável, como `use-sessao`;
- `services`: portas de consulta, adapters mock e regras sem estado visual;
- `stores`: estado observável e persistência temporária no navegador;
- `types`: contratos internos sem dependência de fixtures;
- `mocks`: dados simulados e cenários relacionais;
- `constants`: chaves e eventos compartilhados;
- `utils`: utilitários técnicos pequenos.

A sessão está deliberadamente separada entre `types/sessao.ts`, `constants/sessao.ts`, `hooks/use-sessao.ts`, `services/autenticacao/navegacao-sessao.ts` e `stores/sessao.tsx`.

## Projeções e regras atuais

Campeonatos, times, partidas e atletas usam relações por ID. Rascunhos, perfis privados e resultados não publicados continuam nos mocks sem vazar na projeção pública. Campos não formam uma jornada pública independente: aparecem publicamente apenas como contexto da partida.

Ativar a capacidade de organizador não atribui campeonatos. O namespace `/organizador` consulta somente vínculos da sessão. O gate cliente evita navegação visual indevida, mas não representa autorização segura.

Solicitar reserva não equivale à aprovação municipal. A Prefeitura revalida disponibilidade, conflitos e antecedência mínima no momento da decisão. O estado local é isolado por conta, mas continua sem segurança de servidor.

## Server e Client Components

- `page.tsx` e `layout.tsx` permanecem Server Components quando possível;
- estado, contexto, eventos e `sessionStorage` exigem `use client`;
- a sessão mock é hidratada apenas no navegador;
- segredos nunca devem ser expostos em variáveis `NEXT_PUBLIC_*`.

## Dependências permitidas

```text
app -> screens, layouts, components
screens -> components, hooks, services, stores, mocks, layouts, types, utils
components -> hooks, types, utils
hooks -> stores
services -> mocks, types
layouts -> components, hooks, services, stores, utils
stores -> types, constants, services, mocks
mocks -> types
```

Camadas inferiores não importam `screens` ou `app`. Componentes não consultam serviços nem fixtures: recebem dados por props e dependem apenas de hooks, tipos e utilitários técnicos. Durante a fase demonstrável, telas podem consumir fixtures diretamente quando ainda não existe uma porta de consulta; stores também podem usar mocks como estado inicial. Mocks nunca exportam contratos: seus formatos estáveis ficam em `types`. Quando um fluxo receber integração real, o acesso direto da tela ao mock deve ser substituído pelo serviço correspondente. Dependências entre domínios passam por tipos ou serviços explícitos.

## Integração com o backend

Next.js não substitui NestJS. Regras canônicas, autorização, pagamentos, auditoria e persistência pertencem à API NestJS/PostgreSQL.

Evolução prevista:

1. aprovar o contrato OpenAPI;
2. criar serviços tipados;
3. manter adapter mock e HTTP sob a mesma porta quando necessário;
4. tratar loading, vazio, erro, sucesso e permissão;
5. substituir uma fatia vertical por vez e validar no Playwright.

Não criar Route Handlers do Next.js para duplicar a API sem decisão arquitetural explícita.

## Nomenclatura

- arquivos e diretórios próprios: português, `kebab-case`, sem acentos;
- personas e domínios: português;
- componentes e tipos: `PascalCase`;
- funções, hooks e variáveis: `camelCase`;
- hooks preservam o prefixo técnico `use-`;
- APIs de React, Next.js, shadcn, Radix e bibliotecas permanecem em inglês;
- entradas do App Router usam os nomes técnicos exigidos (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`);
- telas não usam o sufixo redundante `-page`.

## Próxima evolução

1. Consolidar o OpenAPI com o backend.
2. Criar cliente HTTP e tratamento comum de erros.
3. Migrar uma fatia vertical por vez dos mocks para serviços reais.
4. Substituir acessos diretos das telas aos mocks por serviços quando cada fluxo for integrado.
5. Reduzir gradualmente os limites `use client` conforme dados reais puderem ser buscados no servidor.
