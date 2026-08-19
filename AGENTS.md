# CampoLivre — regras de engenharia do frontend

## Escopo

Este repositório contém somente o frontend React do CampoLivre/LigaPro. O backend de referência é `https://github.com/thalesleall/Campo-Livre` e deve ser tratado como somente leitura, salvo autorização explícita.

## Fonte de verdade

Em caso de divergência, use esta ordem:

1. decisões atuais aprovadas por Gabriel e Thales;
2. telas mais recentes do Figma;
3. baseline vigente no Megabrain;
4. implementação deste repositório;
5. documentos antigos apenas como histórico.

Não trate interface renderizada, estado local ou mocks como integração persistida.

## Organização

- `src/app`: bootstrap, providers, rotas e estilos globais.
- `src/features`: código organizado por capacidade de negócio.
- `src/shared`: componentes, hooks e utilitários realmente reutilizáveis.
- `src/mocks`: dados simulados, isolados da interface.
- `tests/e2e`: fluxos ponta a ponta com Playwright.

Use `kebab-case` para pastas e arquivos, como no backend NestJS. Componentes e tipos exportados usam `PascalCase`; funções e variáveis usam `camelCase`.

Não crie pastas vazias, arquivos `index.ts` genéricos ou abstrações sem uso real. Uma feature pode ganhar `api`, `components`, `hooks`, `pages`, `schemas` e `types` somente quando precisar deles.

## Integração

- Centralize URL, autenticação, serialização e erros em uma camada de API quando a integração começar.
- Componentes não devem executar `fetch` disperso.
- O OpenAPI/Swagger do backend orienta contratos e payloads.
- Enquanto um endpoint não existir, use um adapter mock com a mesma interface planejada para o serviço real.
- Não versione `.env`, credenciais, tokens ou dados pessoais reais.

## Fluxo de trabalho

Antes de editar:

1. verifique `git status`;
2. leia a tarefa e os arquivos relacionados;
3. defina critérios de aceitação observáveis;
4. identifique dependências da API e decisões pendentes.

Durante a implementação:

1. trabalhe em uma fatia vertical por vez;
2. use testes para comportamento novo;
3. não misture funcionalidade e refatoração ampla;
4. trate loading, vazio, validação, sucesso, erro e permissão quando aplicável;
5. preserve responsividade, teclado e semântica acessível.

Antes de concluir:

```bash
npm run check
```

Revise o diff e informe separadamente os resultados de formatação, lint, TypeScript, build e E2E. Não faça commit, push ou publicação sem que a solicitação do usuário autorize essas ações.

## Graphify (piloto local)

Este projeto possui um grafo de código local em `graphify-out/`. Ele é um índice derivado e não substitui a leitura do diff nem dos arquivos-fonte.

Regras:

- Use `graphify query "<pergunta>" --budget 1200` primeiro somente para perguntas amplas de arquitetura, dependências, impacto ou fluxos que cruzem vários módulos.
- Para tarefas pequenas, revisão de diff, rota conhecida, símbolo conhecido ou busca textual exata, prefira `search_files`/`read_file`; neste repositório essas buscas foram mais rápidas e menores no piloto.
- Se a consulta ampla não localizar o ponto exato, use `graphify explain "<símbolo-ou-arquivo>"`; confirme decisões importantes na fonte.
- Não use modo estrito e não trate saída inferida como fato sem conferir a origem indicada.
- Depois de alterar código, execute `graphify update .` para manter o índice AST atualizado, sem API e sem custo de LLM.
- `graphify-out/` é local durante o piloto e não deve ser commitado.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
