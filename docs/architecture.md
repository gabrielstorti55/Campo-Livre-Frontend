# Arquitetura do frontend

## Objetivo

Usar Next.js com App Router como base web do CampoLivre, preservando as telas validadas do protótipo e mantendo as regras de negócio fora da camada de apresentação. A organização continua orientada por capacidade de negócio, com infraestrutura compartilhada pequena e explícita.

## Limites

### `app`

`src/app` é a camada de composição do Next.js. Contém:

- layout raiz, metadata, providers e estilos globais;
- grupos de rotas, segmentos dinâmicos e layouts por contexto;
- adaptadores `page.tsx` pequenos que renderizam páginas de `features`;
- a página de recurso não encontrado.

Arquivos de rota não devem concentrar regras de negócio. O grupo `(explore)` organiza a consulta pública sem acrescentar um segmento à URL.

### `features`

Cada diretório representa uma capacidade do produto:

- `auth`: entrada, cadastro, recuperação e sessão temporária;
- `atletas`: consulta pública de perfis esportivos e estatísticas autorizadas;
- `campeonatos`: listagem, criação, visão geral, chaveamento e artilharia contextual;
- `dashboard`: páginas iniciais por contexto;
- `partidas`: consulta, agendamento, súmula e resumo publicado;
- `organizador`: modelos operacionais, fixtures relacionais e consultas mock do painel administrativo;
- `perfis`: visualização e configuração dos perfis;
- `prefeitura`: campos, calendário, aprovações e organizadores;
- `publico`: modelos de apresentação, fixtures relacionais e porta de consultas da projeção pública;
- `times`: busca, criação e gestão de equipes.

Páginas e componentes exclusivos ficam próximos da feature que os utiliza.

### `shared`

Recebe somente código utilizado por mais de uma feature:

- `components/ui`: primitivas visuais;
- `components`: padrões visuais compartilhados do CampoLivre;
- `lib`: utilitários técnicos pequenos.

Navegação, parâmetros e estado de rota usam diretamente `next/link` e `next/navigation`. A ponte transitória da migração foi removida após todos os consumidores adotarem as APIs nativas do Next.js.

`shared` não deve depender de páginas de `features`.

### Mocks e projeções públicas

Os mocks antigos ainda usados pelos fluxos autenticados ficam em `src/mocks`. O fluxo público reconciliado possui uma fronteira explícita em `src/features/publico`:

- `model/public-models.ts`: modelos orientados às consultas públicas confirmadas;
- `mocks/public-fixtures.ts`: cenários relacionais por ID, ciclo de vida, publicação e privacidade;
- `services/public-catalog.ts`: porta de consultas sem URL, `fetch` ou DTO HTTP;
- `services/public-catalog.mock.ts`: adapter local e seletores das projeções.

Campeonatos, times, partidas e atletas usam relações por ID. Um rascunho não publicado, um perfil privado ou um resultado não publicado continuam presentes como cenários mock sem vazar na projeção pública. O ciclo principal do campeonato é `EM_CONFIGURACAO → EM_ANDAMENTO → ENCERRADO`, com `CANCELADO` como saída alternativa; inscrições abertas são uma condição separada, não outro estado esportivo. A agenda omite partidas canceladas por padrão e partidas adiadas não mantêm horário vigente. A artilharia é uma projeção contextual do detalhe do campeonato, nunca uma jornada ou ranking global.

Campos não formam uma jornada pública independente: a projeção da partida mantém apenas a referência necessária ao local. Cadastro, infraestrutura, disponibilidade, calendário e reservas permanecem nos fluxos operacionais da Prefeitura. Por isso não existem rotas públicas `/campos` ou `/rankings`.

Os mocks não decidem silenciosamente políticas ainda em definição: a exposição exata de campeonatos em configuração, detalhes de times desativados, estados não aprovados da agenda de reservas, o efeito de `perfil_publico = false` sobre fatos históricos e conquistas cuja definição ficou inativa permanecem decisões de produto/backend. Quando o OpenAPI existir, um adapter HTTP deverá traduzir DTOs para os modelos de apresentação; não se deve transformar estes tipos em contratos do backend por conveniência.

### Projeção operacional do organizador

O fluxo administrativo reconciliado possui uma fronteira local em `src/features/organizador`:

- `model/organizer-models.ts`: modelos de apresentação para papel contextual, contexto pessoal/Prefeitura, lifecycle, situação comercial, convites e reservas;
- `mocks/organizer-fixtures.ts`: cenários relacionais de campeonatos explicitamente administráveis;
- `services/organizer-catalog.mock.ts`: consultas locais filtradas pelos vínculos da sessão;
- `state/organizer-operational-store.ts`: projeção operacional substituível por API, observada com `useSyncExternalStore` e persistida apenas durante a sessão do navegador.

Ativar a capacidade de organizador na conta não atribui campeonatos. O painel e cada página contextual consultam somente IDs presentes em `organizedChampionshipIds`; `RESPONSAVEL` e `ORGANIZADOR` possuem ações distintas. O gate cliente do namespace `/organizador` evita a navegação visual sem capacidade ativada, mas não é autorização segura: guards, transações, auditoria e verificação de vínculo pertencem à API.

O estado esportivo (`EM_CONFIGURACAO`, `EM_ANDAMENTO`, `ENCERRADO` ou `CANCELADO`) permanece separado de inscrições abertas e da situação comercial. Configuração, convites, partidas, fatos definitivos, reservas, transferência, finalização e cancelamento alteram somente o store mock nesta fase. A persistência usa um envelope identificado pela conta e contém apenas campeonatos vinculados à sessão ativa; responsabilidade compartilhada é registrada separadamente para que a transferência seja visível ao novo titular. Isso evita herança acidental na troca de conta, mas continua sem segurança de servidor.

Fatos definitivos são registros discriminados e idempotentes: WO preserva vencedor e justificativa; súmula preserva placar, arbitragem, gols, cartões, substituições e relatório. A finalização considera esses fatos, resultados publicados e cancelamentos. Súmula aguardando publicação é somente leitura; uma nova súmula exige partida agendada com data/horário já ocorridos, confere gols por equipe e congela o snapshot revisado antes da confirmação. WO não inventa placar; solicitar reserva não equivale à aprovação municipal; preço, endpoint e DTO não são inferidos antes do contrato aprovado.

## Server e Client Components

- `page.tsx` e `layout.tsx` permanecem Server Components quando não precisam de estado ou APIs do navegador;
- componentes com estado, contexto, eventos ou `sessionStorage` declaram `use client`;
- a sessão mock é hidratada somente no navegador, sem acessar `sessionStorage` durante a pré-renderização;
- dados públicos poderão ser buscados no servidor quando o contrato HTTP estiver disponível;
- segredos nunca devem ser expostos em variáveis `NEXT_PUBLIC_*`.

A primeira migração manteve limites de cliente amplos para preservar o comportamento do protótipo. A redução desses limites deve ser incremental e acompanhada por testes, não uma refatoração ampla sem benefício observado.

## Dependências permitidas

```text
app -> features -> shared
  \-------> mocks <---/
          publico/model <- publico/services <- publico/mocks
          organizador/model <- organizador/services <- organizador/mocks
```

- `app` pode compor features e shared;
- features podem usar shared e, temporariamente, mocks;
- shared não deve importar features;
- uma feature não deve acessar detalhes internos de outra sem contrato explícito.

## Integração com o backend

Next.js não substitui NestJS. O frontend pode realizar renderização e composição web, mas regras canônicas, autorização definitiva, pagamentos e persistência pertencem à API NestJS/PostgreSQL.

A evolução prevista é:

1. aprovar o contrato OpenAPI do fluxo;
2. criar um serviço tipado na feature;
3. manter adapter mock e adapter HTTP sob a mesma interface quando necessário;
4. tratar loading, vazio, erro, sucesso e permissão;
5. verificar o fluxo no Playwright e, quando houver API, ponta a ponta.

Não criar Route Handlers do Next.js para duplicar endpoints ou regras do backend sem uma decisão arquitetural explícita.

## Nomenclatura

- arquivos e diretórios: `kebab-case`;
- componentes e tipos: `PascalCase`;
- funções, hooks e variáveis: `camelCase`;
- testes: `*.spec.ts` ou `*.spec.tsx`;
- páginas de feature: `*-page.tsx`;
- entradas do App Router: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx` e `not-found.tsx` quando necessárias.

## Próxima evolução

1. Consolidar o contrato OpenAPI com o backend.
2. Criar o cliente HTTP e o tratamento comum de erros.
3. Migrar uma fatia vertical por vez de mock para serviço real.
4. Adicionar estados do App Router (`loading.tsx` e `error.tsx`) somente onde houver operação assíncrona real.
5. Reduzir gradualmente os limites `use client` conforme as features forem alteradas e dados reais puderem ser buscados no servidor.
