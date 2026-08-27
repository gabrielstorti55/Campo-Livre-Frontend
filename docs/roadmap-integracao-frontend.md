# Roadmap de integração do frontend

## Autoridade e regra de prioridade

A pasta viva do CampoLivre no Google Drive é a fonte canônica absoluta para requisitos e contratos. Este arquivo registra a ordem operacional do trabalho no frontend; ele não substitui nem altera requisitos.

Antes de iniciar cada marco, o snapshot vivo deve ser relido. Se uma questão de `docs/questoes-a-acertar.md` for respondida e publicada no Drive, a fatia anteriormente bloqueada volta ao topo da fila, desde que o novo contrato esteja materialmente completo e coerente.

Não devem ser inventados endpoints, DTOs, identificadores, vínculos, permissões, projeções privadas ou transições para manter a sequência do roadmap.

## Ordem vigente

### Marco 1 — Fluxo de atleta

**Estado:** implementado até o limite dos contratos publicados.

As operações restantes continuam vinculadas às questões contratuais centralizadas em `docs/questoes-a-acertar.md`. Qualquer resposta publicada deve ser reconciliada e priorizada antes do marco em andamento.

### Marco 2 — Campeonato completo

**Estado:** pausado em 2026-08-26, aguardando respostas publicadas no Drive.

As questões foram encaminhadas por Gabriel a Thales. Esse encaminhamento não altera a fonte canônica: a retomada ocorrerá após a publicação coerente dos contratos, frontmatters, paginação e projeções no Drive. Não será construído um Campeonato completo apenas em protótipo porque isso criaria alto risco de retrabalho.

Abrange os dois lados da jornada:

1. **Consulta pública e experiência autenticada**
   - listagem e busca de campeonatos;
   - detalhe canônico do campeonato;
   - regulamento e estrutura publicados;
   - times inscritos e elenco público permitido;
   - classificação, chaveamento e histórico quando seus DTOs e estados estiverem publicados;
   - convites e inscrições do time somente quando houver projeções e autorização contextual completas.

2. **Operação do organizador**
   - criação e atualização;
   - colaboradores e transferência de responsabilidade;
   - regulamento, fases e critérios de desempate;
   - convites, inscrições e reservas;
   - validação da configuração;
   - abertura e encerramento das inscrições;
   - geração da estrutura esportiva;
   - início, avanço de fases, encerramento e cancelamento;
   - histórico e estados de erro.

A implementação será feita em fatias verticais com RED focado, adapter HTTP no modo integrado e adapter explícito em memória no protótipo. Rotas com contrato ausente ou contraditório permanecerão honestamente indisponíveis e serão acrescentadas ao ledger de questões.

### Marco 3 — Prefeitura

**Estado:** auditoria contratual ativa enquanto Campeonato aguarda publicação.

Abrange identidade institucional, vínculos de funcionários, campos municipais e demais operações realmente publicadas. Prefeitura é um contexto separado do ator atleta e não deve ser inferida de uma conta comum ou de uma capacidade global de organizador.

### Marco 4 — Partidas, agenda e súmulas

**Estado:** pausado em 2026-08-26, aguardando aprovação e materialização dos contratos no Drive.

Abrange consulta pública de partidas, agenda, detalhe, operação da súmula e publicação do resumo. Todos podem consultar os detalhes da partida e o resumo publicado; edição e operação permanecem restritas aos vínculos autorizados do campeonato.

A numeração histórica preserva `PAR-009` a `PAR-016` sem reutilização. Os 13 UCs presentes ainda não possuem contratos HTTP materializados; por isso as telas simuladas permanecem bloqueadas no modo integrado e não será construído um protótipo completo sujeito a retrabalho.

## Método de execução

Para cada marco:

1. reler e comparar o Drive vivo;
2. construir matriz rota → UC → contrato → autorização → estado;
3. classificar cada operação como implementável, bloqueada por lacuna ou bloqueada por conflito;
4. implementar apenas fatias materialmente definidas, em TDD;
5. manter produção exclusivamente HTTP e protótipo explicitamente em memória;
6. executar checks focados por fatia;
7. executar um gate amplo no marco estável;
8. atualizar este roadmap, o fluxo específico e `docs/questoes-a-acertar.md`.

## Limites permanentes

- Trabalho exclusivamente no frontend até nova autorização explícita.
- Nenhuma escrita no Drive canônico sem autorização explícita.
- Nenhum commit ou push sem autorização explícita.
- Guards frontend melhoram UX; autorização definitiva pertence ao backend.
- Mocks ou adapters interceptados comprovam representação frontend do contrato, não integração real com backend e persistência.
