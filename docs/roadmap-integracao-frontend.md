# Roadmap de integração do frontend

## Autoridade e regra de prioridade

A pasta viva do CampoLivre no Google Drive é a fonte canônica absoluta para requisitos e contratos. Este arquivo registra a ordem operacional do trabalho no frontend; ele não substitui nem altera requisitos.

Antes de iniciar cada marco, o snapshot vivo deve ser relido. Se uma questão de `docs/questoes-a-acertar.md` for respondida e publicada no Drive, a fatia anteriormente bloqueada volta ao topo da fila, desde que o novo contrato esteja materialmente completo e coerente.

Não devem ser inventados endpoints, DTOs, identificadores, vínculos, permissões, projeções privadas ou transições para manter a sequência do roadmap.

## Baseline executável do backend

A revisão remota auditada em 2026-09-17 é `dbf3606`. O Swagger executável publica 78 operações: 33 de Identidade/Conta/Administração, 16 de Prefeituras, 23 de Times/Elenco, cinco de Campos e uma de health. Não há operações de Campeonatos, Partidas ou Súmula nessa revisão. Desde o baseline `8de1105`, o backend adicionou gestão da conta pessoal, ciclo de senha e conta, administração global, Prefeituras, Times/Elenco e Campos.

- `POST /api/v1/login`;
- `POST /api/v1/login/renovacoes`;
- `POST /api/v1/logout`;
- `GET /api/v1/municipios`;
- `POST /api/v1/cadastros`;
- `POST /api/v1/confirmacoes-email`;
- `POST /api/v1/confirmacoes-email/reenvios`;
- `POST /api/v1/consentimentos-responsavel`;
- `GET /api/v1/minha-conta`;
- `PATCH /api/v1/minha-conta`.

O núcleo `login → GET /minha-conta → refresh → logout` passou contra PostgreSQL 16 isolado e pelo navegador no frontend integrado. O reload preservou a sessão por cookie `HttpOnly`, renovou a credencial e consultou novamente a projeção privada. A projeção nova publica CPF, campos de RG, nascimento, idade e município como nullable; o frontend foi alinhado para não quebrar nem inventar esses dados quando ausentes. O perfil consulta `GET /municipios` e envia o UUID selecionado em `PATCH /minha-conta`. Entrega real de e-mail e provedores externos continuam exigindo homologação própria.

O fluxo parental está ligado em fonte às cinco operações publicadas de consentimento e revogação, com captura e remoção de token da URL, upload multipart e estados de continuidade cobertos por testes. Isso comprova a integração do cliente ao contrato; armazenamento, OCR, Telegram e entrega externa continuam sendo dependências operacionais do backend e não são simulados pelo frontend.

O backend `dbf3606` já monta rotas de Times/Elenco, Campos e Prefeituras, mas a existência da rota não prova que cada jornada do frontend esteja integrada. Portas HTTP de Campeonatos, Partidas, Resultados/Súmula e demais operações devem continuar fail-closed e só podem ser promovidas após reconciliação do contrato e exercício real de cada fatia.

Times foi exercitado contra a API e pelo navegador integrado: criação `201`, listagem da conta `200`, detalhe e elenco `200`, gestão contextual de capitão, desativação e reativação `200` e logout `204`. Em Prefeituras, o painel institucional consulta `GET /minha-conta/prefeituras` e a criação de Campo executa `POST /prefeituras/{id}/campos` com `201`, seguida por leitura pública `GET /campos/{id}` com `200`. As telas municipais ainda baseadas em reservas ou estado local permanecem bloqueadas no modo integrado.

Foi observada uma divergência executável no contrato municipal: `POST /minha-conta/convites-prefeitura/{conviteId}/aceite` exige `{ "confirmacao": true }` e retorna `CONFIRMACAO_OBRIGATORIA` sem esse corpo, embora o OpenAPI de `dbf3606` não declare `requestBody` para a operação. O frontend deve seguir o comportamento executável somente com teste de contrato e o backend deve corrigir o Swagger.

## Ordem vigente

### Marco 1 — Fluxo de atleta

**Estado:** núcleo de Times/Elenco conectado; criação, projeções públicas, vínculo da conta e gestão de capitão foram verificados contra backend e PostgreSQL reais. A listagem de convites enviados agora hidrata reenvio/cancelamento após reload pelo endpoint `GET /times/{timeId}/convites`; o navegador confirmou listagem, reenvio, persistência após reload e cancelamento com respostas `200`.

As operações restantes continuam vinculadas às questões contratuais centralizadas em `docs/questoes-a-acertar.md`. Qualquer resposta publicada deve ser reconciliada e priorizada antes do marco em andamento.

### Marco 2 — Campeonato completo

**Estado:** retomado no frontend após a revisão validada de 2026-08-28; homologação real aguarda endpoints de domínio no backend.

Os contratos recuperáveis de consulta pública, administração, organizadores, Times, fases, distribuição, estrutura e Partidas foram publicados no Drive e representados por portas HTTP e protótipo. As lacunas remanescentes estão em `docs/questoes-a-acertar.md`; operações sem leitura recuperável integral continuam fail-closed.

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

**Estado:** todas as operações publicadas de Prefeituras e Campos estão ligadas a adapters HTTP e jornadas alcançáveis: vínculos da conta, convites por caixa de entrada e token, funcionários, remoção, transferência de responsabilidade, criação e edição administrativa de Prefeitura, cadastro, edição e estado operacional de Campo. A edição de contatos institucionais envia somente campos explicitamente informados, pois a listagem administrativa não retorna os valores atuais. Calendário e reservas simulados permanecem fail-closed por não existirem no backend executável.

Abrange identidade institucional, vínculos de funcionários, campos municipais e demais operações realmente publicadas. Prefeitura é um contexto separado do ator atleta e não deve ser inferida de uma conta comum ou de uma capacidade global de organizador.

### Marco 4 — Partidas, agenda e súmulas

**Estado:** agenda, detalhe e comandos documentados foram representados no frontend; Reservas e operação de Súmula permanecem fail-closed no integrado quando dependem de stores locais.

Abrange consulta pública de partidas, agenda, detalhe, operação da súmula e publicação do resumo. Todos podem consultar os detalhes da partida e o resumo publicado; edição e operação permanecem restritas aos vínculos autorizados do campeonato.

A numeração histórica preserva `PAR-009` a `PAR-016` sem reutilização. A consulta pública de Partidas e a projeção administrativa usam adapters; publicação de resumo e operação de Súmula só podem ser liberadas quando toda a cadeia necessária estiver conectada ao contrato HTTP, sem fallback local.

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
