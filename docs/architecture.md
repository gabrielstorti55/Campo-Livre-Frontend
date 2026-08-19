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
- `campeonatos`: listagem, criação, visão geral e chaveamento;
- `dashboard`: páginas iniciais por contexto;
- `partidas`: consulta, agendamento, súmula e resumo publicado;
- `perfis`: visualização e configuração dos perfis;
- `prefeitura`: campos, calendário, aprovações e organizadores;
- `times`: busca, criação e gestão de equipes.

Páginas e componentes exclusivos ficam próximos da feature que os utiliza.

### `shared`

Recebe somente código utilizado por mais de uma feature:

- `components/ui`: primitivas visuais;
- `components`: padrões visuais compartilhados do CampoLivre;
- `lib`: utilitários técnicos pequenos.

Navegação, parâmetros e estado de rota usam diretamente `next/link` e `next/navigation`. A ponte transitória da migração foi removida após todos os consumidores adotarem as APIs nativas do Next.js.

`shared` não deve depender de páginas de `features`.

### `mocks`

Concentra os dados temporários usados pelo protótipo. O isolamento deixa explícito que os fluxos ainda não são persistidos e facilita substituir mocks por serviços com contratos estáveis.

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
