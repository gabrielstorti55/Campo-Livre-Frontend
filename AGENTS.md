# CampoLivre — regras de engenharia do frontend

## Escopo

Este repositório contém somente o frontend React do CampoLivre. O backend de referência é `https://github.com/thalesleall/Campo-Livre` e deve ser tratado como somente leitura, salvo autorização explícita.

## Fonte de verdade

Em caso de divergência, use esta ordem:

1. decisões atuais aprovadas por Gabriel e Thales;
2. telas mais recentes do Figma;
3. baseline vigente no Megabrain;
4. implementação deste repositório;
5. documentos antigos apenas como histórico.

Não trate interface renderizada, estado local ou mocks como integração persistida.

## Sistema visual

`DESIGN.md` é a fonte de verdade durável da identidade **Campo Editorial + Estádio Municipal**. Toda tela existente, nova jornada e estado introduzido pela futura API deve reutilizar seus tokens e regras de composição.

- Barlow Condensed: títulos, placares, números e métricas.
- IBM Plex Sans: navegação, formulários, tabelas, mensagens e controles.
- CampoLivre é a única marca principal; não reintroduza `LigaPro` como assinatura paralela.
- Prefira bordas, divisores, tipografia e densidade funcional a cartões, sombras, pílulas e grandes raios.
- Fotografia não sustenta a identidade. Use o vocabulário gráfico de campo, súmula, tabela e placar.
- Ao integrar a API, estados de loading, vazio, erro, sucesso e permissão devem usar o mesmo sistema; não crie um segundo tema.

## Organização

- `src/app`: rotas, layouts e entrypoints reais do Next.js App Router.
- `src/screens`: composição das telas por contexto (`publico`, `conta`, `atleta`, `organizador` e `prefeitura`).
- `src/components`: primitivas de UI, padrões de layout e módulos visuais de domínio.
- `src/hooks`: hooks React compartilhados.
- `src/services`: consultas, adapters e regras locais.
- `src/stores`: estado reativo e persistência temporária no navegador.
- `src/types`: contratos internos estáveis.
- `src/mocks`: dados simulados, isolados da interface.
- `src/layouts`: shells e composição estrutural das áreas.
- `src/utils` e `src/constants`: infraestrutura técnica pequena e explícita.
- `tests/e2e`: fluxos ponta a ponta com Playwright.

Use português para arquivos, pastas de domínio e identificadores próprios; preserve em inglês apenas APIs técnicas e nomes externos. Caminhos usam `kebab-case`, sem acentos. Componentes e tipos exportados usam `PascalCase`; funções e variáveis usam `camelCase`.

Não crie `src/pages`, uma pasta paralela `routes`, pastas vazias, arquivos `index.ts` genéricos ou abstrações sem uso real.

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
