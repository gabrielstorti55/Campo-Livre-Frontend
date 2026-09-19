# Arquitetura do frontend

## Objetivo

Usar Next.js com App Router como base web do CampoLivre, mantendo rotas, apresentação, estado, contratos HTTP e simulação em limites previsíveis. O frontend possui fatias integráveis e um modo de protótipo explicitamente separado; adapters HTTP representam contratos publicados, mas autorização canônica, emissão de credenciais e persistência definitiva pertencem ao backend.

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

Consultas que podem se tornar obsoletas aceitam `OpcoesConsulta` com `AbortSignal`. Cancelar o transporte reduz trabalho desperdiçado, mas não substitui as guardas de identidade e geração: respostas administrativas continuam particionadas por recurso, sessão e conta antes de publicar estado visual.

## Projeções e regras atuais

Campeonatos, times, partidas e atletas usam relações por ID. Rascunhos, perfis privados e resultados não publicados continuam nos mocks sem vazar na projeção pública. Campos possuem consulta pública própria em `/campos` e `/campos/{id}`, limitada à allowlist publicada; o cadastro é informativo e não representa reserva ou autorização de uso.

Ativar a capacidade de organizador não atribui campeonatos. O namespace `/organizador` consulta somente vínculos da sessão. O gate cliente evita navegação visual indevida, mas não representa autorização segura.

Reservas, agenda oficial, aprovações municipais e indisponibilidades por período foram retiradas do MVP vigente. As telas e stores antigos que representam esses comportamentos são resíduos de protótipo e permanecem bloqueados no modo integrado até serem removidos; não devem orientar adapters, DTOs ou regras novas.

## Server e Client Components

- `page.tsx` e `layout.tsx` permanecem Server Components quando possível;
- estado, contexto, eventos e `sessionStorage` exigem `use client`;
- a sessão mock é hidratada apenas no navegador;
- segredos nunca devem ser expostos em variáveis `NEXT_PUBLIC_*`.

## Dependências permitidas

```text
app -> screens, layouts, components
screens -> components, hooks, services, stores, mocks, layouts, types, utils
components -> components, contexts, hooks, types, utils
hooks -> stores
services -> mocks, types
layouts -> components, hooks, services, stores, utils
stores -> types, constants, services, mocks
mocks -> types
```

Camadas inferiores não importam `screens` ou `app`. Componentes de apresentação recebem dados por props e dependem apenas de outros componentes, hooks, tipos e utilitários técnicos. Módulos interativos de domínio podem consumir contextos de API quando encapsulam um comportamento reutilizável; atualmente `components/times/gerenciar-convites-time.tsx` e `components/times/operacoes-time.tsx` são exceções explícitas que ainda concentram essa orquestração. Quando esses módulos forem alterados, a consulta e os comandos devem migrar para tela, hook ou serviço, preservando componentes apresentacionais. Durante a fase demonstrável, telas podem consumir fixtures diretamente quando ainda não existe uma porta de consulta; stores também podem usar mocks como estado inicial. Mocks nunca exportam contratos: seus formatos estáveis ficam em `types`. Quando um fluxo receber integração real, o acesso direto da tela ao mock deve ser substituído pelo serviço correspondente. Dependências entre domínios passam por tipos ou serviços explícitos.

## Integração com o backend

Next.js não substitui NestJS. Regras canônicas, autorização, pagamentos, auditoria e persistência pertencem à API NestJS/PostgreSQL.

### Estado implementado

- `ClienteApi` centraliza URL, JSON, multipart, headers, Bearer, `credentials`, `AbortSignal` e Problem Details;
- autenticação web mantém access token somente em memória e espera refresh token em cookie `HttpOnly` controlado pelo backend;
- `executarAutenticado` coordena renovação e repetição única dos `401` documentados;
- autenticação, Times, Campos, Municípios, Prefeituras, Campeonatos e Partidas possuem portas e composição `integrado | prototipo`;
- produção usa somente adapters HTTP e falha fechada; não há fallback automático para dados simulados;
- comandos idempotentes preservam `Idempotency-Key` conforme a intenção e o contrato de cada operação;
- telas administrativas distinguem falha do comando de falha na atualização posterior;
- Partidas concentra paginação e carregamento administrativo em serviço de aplicação cancelável, mantendo estado visual e formulários na tela.

Tipos escritos no frontend representam o contrato conhecido, mas ainda não constituem prova de compatibilidade com uma API executável. Quando o OpenAPI estabilizar, tipos de transporte devem ser gerados ou verificados automaticamente e traduzidos pelos adapters para os modelos usados pelas telas.

### Evolução de integração

1. obter e versionar o OpenAPI executável do backend;
2. verificar mudanças incompatíveis de contrato no CI;
3. integrar uma fatia vertical por vez contra ambiente real;
4. propagar cancelamento às demais consultas longas quando seus consumidores forem migrados;
5. avaliar uma camada de cache/query somente depois de observar as necessidades da API real;
6. validar login, Bearer, refresh, logout, cookies, CORS/CSRF e autorização em E2E sem mocks.

Não criar Route Handlers do Next.js para duplicar a API sem decisão arquitetural explícita.

## Contrato visual e chegada da API

`DESIGN.md` é o contrato visual do produto. Tokens globais vivem em `src/app/styles.css`; primitivas acessíveis em `src/components/ui`; padrões editoriais e operacionais em `src/components/layout`; composições esportivas reais em `src/components/modules`.

A chegada da API altera a origem e os estados dos dados, não a linguagem visual. Loading, vazio, erro, sucesso, conflito, indisponibilidade e permissão devem compor as mesmas superfícies, tipografia, divisores, controles e padrões responsivos já adotados. Novos componentes genéricos continuam baseados em shadcn/ui ou Radix; componentes próprios devem representar domínio real.

## Nomenclatura

- arquivos e diretórios próprios: português, `kebab-case`, sem acentos;
- personas e domínios: português;
- componentes e tipos: `PascalCase`;
- funções, hooks e variáveis: `camelCase`;
- hooks preservam o prefixo técnico `use-`;
- APIs de React, Next.js, shadcn, Radix e bibliotecas permanecem em inglês;
- entradas do App Router usam os nomes técnicos exigidos (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`);
- telas não usam o sufixo redundante `-page`.

## Decisões de evolução

Prioridade imediata:

1. consolidar o OpenAPI com o backend e automatizar sua verificação;
2. continuar extraindo orquestrações grandes de telas para serviços ou hooks por comportamento;
3. substituir acessos diretos a mocks quando cada fluxo receber contrato recuperável;
4. manter cancelamento, identidade e geração como protocolo das consultas administrativas;
5. reduzir gradualmente os limites `use client` somente onde a política real de autenticação permitir.

Não adotar antecipadamente:

- Redux apenas para substituir Context;
- microfrontends;
- BFF ou Route Handlers do Next sem necessidade de implantação comprovada;
- TanStack Query antes de existir uma API real cuja invalidação e cache justifiquem a dependência;
- decodificação de JWT como fonte de autorização;
- código gerado do OpenAPI importado diretamente por componentes.
