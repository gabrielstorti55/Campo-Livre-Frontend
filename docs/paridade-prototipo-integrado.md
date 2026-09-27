# Matriz de paridade — protótipo × integrado

Data-base: 27/09/2026  
Escopo: frontend (`src/app`, `src/screens`, gates e adapters)  
Fonte de contratos do integrado: backend `origin/main` auditado em `f613307`

## Decisão vigente: experiência demo híbrida única

A apresentação e o desenvolvimento local usam uma única experiência visual, tendo o **protótipo mais avançado como referência de composição**.

- `hibrido` é o padrão de `npm run dev` e usa os adapters demonstrativos para que toda a revisão seja navegável sem backend;
- `npm run dev:integrated` seleciona explicitamente os adapters HTTP para validar a integração;
- não existe fallback automático de HTTP para mock: a fonte é escolhida antes de iniciar a aplicação;
- dados demonstrativos são identificados pelo aviso persistente da experiência híbrida e, nas projeções públicas de atletas, também por aviso contextual;
- gates não substituem a tela do protótipo no modo híbrido;
- `integrado` permanece fail-closed e é o padrão de produção;
- `prototipo` permanece como modo de compatibilidade e teste, não como segunda experiência a ser mantida visualmente.

Assim, a matriz abaixo permanece como inventário das capacidades e contratos, mas diferenças classificadas como bloqueadas ou sem contrato aparecem na experiência híbrida com o visual do protótipo e identificação demonstrativa. O objetivo deixou de ser manter duas UIs em paridade e passou a ser **uma UI compartilhada com capacidades de dados distintas**.

## Critério

- **PARIDADE**: mesma tela e jornada; varia apenas a fonte de dados.
- **ADAPTER**: tela compartilhada, com diferenças legítimas de dados/persistência.
- **PARCIAL**: rota abre nos dois modos, mas seções, ações ou estados divergem.
- **BLOQUEADA**: gate impede a rota no integrado porque ela ainda usa estado local.
- **SEM CONTRATO**: a tela existe, mas o backend auditado não publica a projeção/operação necessária.
- **RISCO HTTP**: o adapter chama endpoint que não existe no backend auditado.
- **EM RECONCILIAÇÃO**: alteração já iniciada nesta linha de trabalho.

Paridade não significa usar mocks no integrado. Quando não há contrato, a mesma hierarquia visual pode ser mantida, mas a ação deve permanecer honestamente indisponível.

## Exploração pública

| Rota/tela                        | Protótipo                          | Integrado                  | Diferença                                     | Alteração necessária                                                   | Status              |
| -------------------------------- | ---------------------------------- | -------------------------- | --------------------------------------------- | ---------------------------------------------------------------------- | ------------------- |
| `/` Início                       | Cenário demonstrativo              | Dados das portas públicas  | Conteúdo varia por fonte                      | Manter componentes compartilhados                                      | ADAPTER             |
| `/campeonatos`                   | Lista em memória                   | Lista HTTP                 | Dados e estados remotos                       | Validar loading/vazio/erro equivalentes                                | ADAPTER             |
| `/campeonatos/:id`               | Detalhe completo                   | Detalhe HTTP               | Operações derivadas podem variar              | Manter seções comuns e capability contextual                           | ADAPTER             |
| `/campeonatos/:id/participantes` | Participantes mockados             | Participantes HTTP         | Apenas fonte                                  | Validar vazio e erro                                                   | ADAPTER             |
| `/campeonatos/:id/artilharia`    | Ranking preenchido                 | Adapter chama rota ausente | Integrado falha em HTTP                       | Não mascarar com mocks; bloquear/estado honesto até contrato           | RISCO HTTP          |
| `/partidas`                      | Agenda demonstrativa               | Agenda HTTP                | Apenas fonte e disponibilidade                | Manter composição e filtros                                            | ADAPTER             |
| `/partidas/:id`                  | Detalhe e resultado demonstrativo  | Detalhe público HTTP       | Apenas fonte                                  | Validar Súmula pública e estados finais                                | ADAPTER             |
| `/times`                         | Catálogo em memória                | Catálogo HTTP              | Apenas fonte                                  | Validar paginação/vazio/erro                                           | ADAPTER             |
| `/times/:id`                     | Perfil demonstrativo               | Perfil HTTP                | Apenas fonte                                  | Manter composição                                                      | ADAPTER             |
| `/campos`                        | Catálogo em memória                | Catálogo HTTP              | Apenas fonte                                  | Manter composição                                                      | ADAPTER             |
| `/campos/:id`                    | Detalhe demonstrativo              | Detalhe HTTP               | Apenas fonte                                  | Manter composição                                                      | ADAPTER             |
| `/atletas`                       | Lista de atletas                   | Estado vazio fixo          | Backend não possui catálogo público de perfis | Preservar layout/estado honesto; criar adapter quando contrato existir | SEM CONTRATO        |
| `/atletas/:id`                   | Perfil, estatísticas e títulos     | “Perfil indisponível”      | Projeção pública ausente                      | Compartilhar shell; não injetar dados mockados                         | SEM CONTRATO        |
| `/convites-time/:token`          | Resposta demonstrativa             | Resposta HTTP              | Apenas persistência                           | Validar estados expirado/usado                                         | ADAPTER             |
| `/convites-prefeitura/:token`    | Resposta demonstrativa             | Resposta HTTP              | Gate integrado estava obsoleto                | Gate liberado; validar expirado/usado                                  | PARIDADE ESTRUTURAL |
| `/times/criar`                   | Redireciona para jornada do atleta | Mesmo redirecionamento     | Nenhuma                                       | Manter compatibilidade                                                 | PARIDADE            |

## Autenticação e conta

| Rota/tela                             | Protótipo                                     | Integrado                                                               | Diferença                                                        | Alteração necessária                                                      | Status               |
| ------------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------- | -------------------- |
| `/login`                              | Autenticação em memória                       | Autenticação HTTP                                                       | Persistência e erros                                             | Mesma tela; destino `/minha-area`                                         | PARIDADE             |
| `/cadastro`                           | Cadastro e link local de confirmação          | Cadastro HTTP e envio externo                                           | Link local só faz sentido no protótipo                           | Manter diferença explícita de infraestrutura                              | ADAPTER              |
| `/confirmar-email`                    | Token demonstrativo                           | Token real                                                              | Apenas origem do token                                           | Manter tela                                                               | PARIDADE             |
| `/recuperar-senha`                    | Expõe link local após envio                   | Depende de e-mail                                                       | Link local propositalmente ausente                               | Manter diferença legítima                                                 | ADAPTER              |
| `/redefinir-senha`                    | Token demonstrativo                           | Token real                                                              | Apenas origem do token                                           | Manter tela                                                               | PARIDADE             |
| `/solicitar-reativacao`               | Expõe confirmação local                       | Depende de e-mail                                                       | Link local propositalmente ausente                               | Manter diferença legítima                                                 | ADAPTER              |
| `/confirmar-reativacao`               | Token demonstrativo                           | Token real                                                              | Apenas origem do token                                           | Manter tela                                                               | PARIDADE             |
| `/reativar-conta`                     | Senha na memória                              | HTTP                                                                    | Apenas persistência                                              | Manter tela                                                               | PARIDADE             |
| `/conta-desativada`                   | Estado de conta                               | Estado de conta                                                         | Nenhuma estrutural                                               | Manter                                                                    | PARIDADE             |
| `/consentimento-responsavel`          | Provider ausente pode causar erro             | HTTP                                                                    | Lacuna inversa: integrado funciona, protótipo não possui adapter | Implementar adapter em memória ou estado explícito; nunca lançar no mount | PARCIAL              |
| `/consentimento-responsavel/parental` | Provider ausente pode causar erro             | HTTP/cookie                                                             | Lacuna inversa no protótipo                                      | Implementar adapter em memória ou estado explícito                        | PARCIAL              |
| `/revogar-consentimento`              | Provider ausente pode causar erro             | HTTP publicado em contrato diferente do adapter auditado                | Composição e contrato precisam ser reconciliados                 | Corrigir porta/adapters nos dois modos                                    | PARCIAL / RISCO HTTP |
| `/minha-area`                         | Reconcilia vínculos pelos adapters em memória | Consulta `GET /minha-conta/times` e atualiza links/capability de atleta | Apenas fonte de dados; seleção de contexto continua explícita    | Reconciliação implementada antes de renderizar os contextos               | PARIDADE ESTRUTURAL  |
| `/minha-conta`                        | Conta em memória                              | Conta HTTP                                                              | Persistência                                                     | Manter composição                                                         | PARIDADE             |
| `/minha-conta/alterar-email`          | Link local de confirmação                     | Envio externo                                                           | Diferença legítima                                               | Manter explícita                                                          | ADAPTER              |
| `/confirmar-alteracao-email`          | Token local                                   | Token real                                                              | Apenas origem                                                    | Manter tela                                                               | PARIDADE             |
| `/minha-conta/seguranca`              | Alteração local                               | Alteração HTTP                                                          | Persistência                                                     | Manter tela                                                               | PARIDADE             |
| `/minha-conta/desativar`              | Desativação local                             | Desativação HTTP                                                        | Persistência                                                     | Manter tela                                                               | PARIDADE             |
| `/minha-conta/convites-prefeitura`    | Convites demonstrativos                       | Convites HTTP                                                           | Apenas fonte                                                     | Manter tela e estados                                                     | ADAPTER              |

## Área do atleta

| Rota/tela                | Protótipo                               | Integrado                                                  | Diferença                                                        | Alteração necessária                                   | Status                 |
| ------------------------ | --------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------ | ---------------------- |
| `/atleta/inicio`         | Redireciona para Times e convites       | Mesmo redirecionamento                                     | Nenhuma                                                          | Manter compatibilidade                                 | PARIDADE               |
| `/atleta/time/buscar`    | Times, convites de time e de campeonato | Times e convites HTTP; convite de campeonato oculto        | Backend não publica jornada completa do convite de campeonato    | Manter seção/estado honesto sem mock                   | PARCIAL                |
| `/atleta/time/criar`     | Criação local                           | Criação HTTP                                               | Persistência                                                     | Mesma tela                                             | ADAPTER                |
| `/atleta/time/:id`       | Gestão completa em memória              | Gestão HTTP                                                | Capabilities e dados reais                                       | Validar ações pelo contexto                            | ADAPTER                |
| `/atleta/perfil`         | Perfil, estatísticas e títulos          | Perfil da conta sem projeção esportiva                     | Estatísticas/títulos ocultos                                     | Compartilhar shell e aguardar projeção canônica        | PARCIAL / SEM CONTRATO |
| `/atleta/campeonatos`    | Campeonatos do atleta                   | Estado vazio fixo                                          | Projeção “meus campeonatos” ausente                              | Não usar mocks; manter layout e explicar lacuna        | SEM CONTRATO           |
| `/atleta/campeonato/:id` | Redireciona ao detalhe público          | Mesmo redirecionamento                                     | Nenhuma estrutural                                               | Manter redirect canônico                               | PARIDADE               |
| `/atleta/meus-eventos`   | Agrega agenda via adapters em memória   | Agrega `GET /minha-conta/times` + `GET /partidas?timeId=…` | Apenas fonte de dados; partidas de vários times são deduplicadas | Tela compartilhada implementada com loading/vazio/erro | PARIDADE ESTRUTURAL    |

## Área do organizador

| Rota/tela                                      | Protótipo                                 | Integrado                               | Diferença                                                          | Alteração necessária                                        | Status                 |
| ---------------------------------------------- | ----------------------------------------- | --------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------- | ---------------------- |
| `/organizador/inicio`                          | Redireciona para campeonatos              | Mesmo redirecionamento                  | Nenhuma                                                            | Manter compatibilidade                                      | PARIDADE               |
| `/organizador/campeonatos`                     | Lista local                               | Lista HTTP                              | Apenas fonte                                                       | Manter tela e estados                                       | ADAPTER                |
| `/organizador/novo`                            | Criação local                             | Criação HTTP                            | Persistência                                                       | Manter tela                                                 | ADAPTER                |
| `/organizador/perfil`                          | Perfil demonstrativo                      | Conta/contexto real                     | Dados                                                              | Validar ausência de IDs técnicos                            | ADAPTER                |
| `/organizador/campeonato/:id`                  | Visão geral completa                      | Visão HTTP; regulamento não editável    | Leitura HTTP não devolve regulamento completo para edição segura   | Manter bloqueio honesto; não sobrescrever parcialmente      | PARCIAL / SEM CONTRATO |
| `/organizador/campeonato/:id/times`            | Convites, participantes e inscrição local | Participantes/elencos HTTP              | Inscrição demonstrativa difere do elenco contextual real           | Compartilhar apresentação; respeitar relações canônicas     | PARCIAL                |
| `/organizador/campeonato/:id/chaveamento`      | Editor completo                           | Fases/distribuição/chaveamento HTTP     | Parâmetros persistidos podem ser insuficientes para reabrir editor | Manter estado honesto; não reconstruir com mocks            | PARCIAL                |
| `/organizador/campeonato/:id/partidas`         | Administração e entrada da Súmula         | Administração HTTP                      | Botão de Súmula antes dependia do modo/ID textual                  | Usar `PUBLICAR_SUMULA`                                      | EM RECONCILIAÇÃO       |
| `/organizador/campeonato/:id/sumula?partida=…` | Súmula completa local                     | Escalações HTTP + publicação definitiva | Editores de eventos integrados ainda incompletos                   | Manter mesmas seções; implementar eventos pelo DTO canônico | EM RECONCILIAÇÃO       |
| `/organizador/campeonato/:id/sumula`           | Seletor demonstrativo                     | Antes podia cair em mocks               | Sem partida não há contexto HTTP seguro                            | Integrado orienta escolher em Partidas                      | PARIDADE ESTRUTURAL    |
| `/organizador/campeonato/:id/reservas`         | Reservas em estado local                  | Gate bloqueia                           | Backend não publica jornada equivalente                            | Manter bloqueada; compartilhar shell só quando houver porta | BLOQUEADA              |

### Situação da Súmula nesta linha de trabalho

- rota liberada no gate integrado;
- adapter HTTP lê escalações e publica Súmula com `Idempotency-Key`;
- lista usa `PUBLICAR_SUMULA`, não convenção textual de ID;
- entrada sem `partida` falha fechada no integrado;
- escalações do integrado são somente leitura para o organizador;
- seções principais existem nos dois modos;
- 0 × 0 sem ocorrências pode ser publicado em pontos corridos;
- mata-mata empatado permanece bloqueado até existir editor de desempate;
- gols, cartões, substituições, defesas e pênaltis ainda precisam ser ligados ao DTO integrado.

## Prefeitura

| Rota/tela                   | Protótipo                                                    | Integrado               | Diferença                                                                     | Alteração necessária                                                     | Status           |
| --------------------------- | ------------------------------------------------------------ | ----------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ---------------- |
| `/prefeitura/painel`        | Painel demonstrativo                                         | Contexto municipal HTTP | Métricas locais podem divergir                                                | Auditar cada indicador; não exibir mock como real                        | PARCIAL          |
| `/prefeitura/campos`        | Lista e manutenção no store local                            | Gate bloqueia           | Tela importa store diretamente                                                | Criar leitura/ações na porta antes de liberar                            | BLOQUEADA        |
| `/prefeitura/campos/novo`   | Cria local e atualiza store                                  | Cadastra via HTTP       | Atualização local só no protótipo                                             | Mesma tela com adapters separados                                        | ADAPTER          |
| `/prefeitura/campos/:id`    | Gate libera, mas `GestaoCamposApi` ausente pode quebrar      | Consulta/edição HTTP    | Provider do protótipo é `null`; integrado não pré-valida vínculo no deep link | Bloquear no protótipo ou implementar adapter; validar vínculo/capability | PARCIAL          |
| `/prefeitura/organizadores` | Gate libera, mas `GestaoPrefeiturasApi` ausente pode quebrar | Convites/vínculos HTTP  | Provider do protótipo é `null`; jornada integrada estava órfã do menu         | Menu integrado corrigido; bloquear ou implementar no protótipo           | EM RECONCILIAÇÃO |
| `/prefeitura/calendario`    | Calendário do store                                          | Gate bloqueia           | Sem porta HTTP equivalente                                                    | Manter bloqueado                                                         | BLOQUEADA        |
| `/prefeitura/aprovacoes`    | Aprovações do store                                          | Gate bloqueia           | Sem porta HTTP equivalente                                                    | Manter bloqueado                                                         | BLOQUEADA        |

## Administração global

| Rota/tela                        | Protótipo                          | Integrado                 | Diferença                                         | Alteração necessária                                        | Status              |
| -------------------------------- | ---------------------------------- | ------------------------- | ------------------------------------------------- | ----------------------------------------------------------- | ------------------- |
| `/administracao`                 | Entrada/redirect                   | Entrada/redirect          | Nenhuma estrutural                                | Manter                                                      | PARIDADE            |
| `/administracao/contas`          | Adapter demonstrativo              | Administração global HTTP | Dados                                             | Manter componentes                                          | ADAPTER             |
| `/administracao/prefeituras`     | Adapter demonstrativo              | Administração global HTTP | Dados                                             | Manter componentes                                          | ADAPTER             |
| `/administracao/administradores` | Persona normalmente não disponível | Administração global HTTP | UI oferecia autorrevogação rejeitada pelo backend | Autorrevogação removida; manter demais ações por capability | PARIDADE ESTRUTURAL |

## Divergências de contrato já confirmadas

Chamadas existentes no frontend sem rota correspondente no backend auditado:

1. classificação de campeonato;
2. artilharia;
3. registro de W.O.;
4. encerramento de campeonato;
5. revogação de consentimento no formato usado pelo adapter atual.

Essas chamadas não devem ser usadas como evidência de funcionalidade integrada. A correção de paridade é bloquear ou mostrar estado honesto até o contrato existir — nunca fazer fallback silencioso para mocks.

## Ordem de reconciliação

1. concluir os eventos da Súmula integrada;
2. fechar divergências de navegação e ações em organizador;
3. padronizar shells/estados vazios de atleta sem fabricar dados;
4. separar telas municipais dos stores locais por portas;
5. revisar exploração pública e desativar adapters HTTP obsoletos;
6. executar testes de gates, unitários de tela, build dos dois modos e E2E focal.
