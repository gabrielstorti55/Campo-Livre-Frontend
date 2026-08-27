# Questões a acertar — frontend e contratos

Esta lista contém somente lacunas ainda abertas após a reconciliação do Drive vivo em 26/08/2026. Nenhum item altera a fonte canônica: uma resposta passa a orientar a integração somente depois de ser materializada por Thales na pasta canônica do CampoLivre.

## Q-001 — Consulta pública de municípios

**Afeta:** cadastro pessoal, alteração de município, criação de time, criação pessoal de campeonato e filtros.

Os contratos exigem o UUID interno `municipioId`, mas o catálogo não publica uma rota para descobri-lo. Publicar:

- rota pública de consulta;
- filtros por nome e UF;
- paginação e ordenação;
- projeção com `id`, `nome`, `uf` e, se aplicável, `codigoIbge`;
- política para municípios ativos/elegíveis;
- erros de filtro e município inexistente.

A API do IBGE não substitui esse contrato porque retorna código IBGE, não o UUID interno do CampoLivre.

**Status:** pendente de contrato.

## Q-002 — Times e vínculos esportivos da própria conta

**Afeta:** “meus times”, seleção de contexto, dashboard do atleta, agenda pessoal e autorização contextual.

Não existe projeção privada que liste os vínculos ativos e históricos da conta autenticada, com `timeId`, `membroId`, função `ATLETA | CAPITAO`, estado e dados mínimos de exibição. A listagem pública de times não comprova vínculo.

Confirmar também se a agenda pessoal deve ser composta no frontend consultando `GET /partidas` para os times vinculados ou se haverá uma projeção privada própria. A solução precisa continuar recuperável após login, reload e uso em outro dispositivo.

**Status:** pendente de contrato.

## Q-003 — Consulta segura do convite de time aberto por token

**Afeta:** apresentação, aceite e recusa de convite recebido por link.

Aceite e recusa usam `{token}`, mas não existe `GET` correspondente que devolva os dados mínimos do convite antes da confirmação. Publicar uma projeção autenticada por token que informe time, destinatário minimizado, estado e expiração, sem expor hash ou credenciais internas.

A listagem `GET /minha-conta/convites-time` deve continuar sem devolver tokens.

**Status:** pendente de contrato.

## Q-004 — Convites de time enviados pelo capitão

**Afeta:** reenvio e cancelamento depois de recarregar a página.

O catálogo publica criação, reenvio e cancelamento, mas não permite recuperar os convites enviados por um time. Publicar uma consulta privada e paginada contendo ao menos:

- `conviteId`;
- destinatário minimizado;
- modo de entrega;
- estado e expiração;
- datas operacionais;
- indicação de quais ações ainda são permitidas.

Tokens e hashes não devem integrar essa listagem.

**Status:** pendente de contrato.

## Q-005 — Restrições de nome e sigla do time

**Afeta:** criação e atualização dos dados públicos do time.

Nome e sigla são obrigatórios, mas faltam limites de tamanho, caracteres aceitos, normalização e regras de unicidade. A descrição pública já possui limite explícito; nome e sigla precisam do mesmo nível de definição para que o frontend não invente validações autoritativas.

**Status:** pendente de regra e contrato.

## Q-006 — DTOs internos do detalhe público do time

**Afeta:** histórico de partidas, estatísticas por campeonato, posições em leaderboards, títulos e colocações.

`GET /times/{timeId}` publica arrays sem schema para:

- `elencoResumo`;
- `historicoPartidas`;
- `estatisticasPorCampeonato`;
- `posicoesLeaderboards`;
- `titulosEColocacoes`.

Publicar os DTOs dos itens, identificadores, ordenação, estados vazios e regras de anonimização de referências históricas.

**Status:** pendente de DTO.

## Q-007 — Coerência final do contrato de Campeonatos

**Afeta:** listagem pública, criação, área do organizador e adapters HTTP de Campeonato.

O catálogo e o resumo agora estão `validado`, mas ainda existem duas contradições:

1. `GET /campeonatos` usa `itens` com envelope `paginacao` e campos `page`, `size`, `totalItems` e `totalPages`, enquanto as convenções globais definem resposta plana com `pagina`, `tamanho`, `totalItens` e `totalPaginas`;
2. inventário e UCs de Campeonato ainda podem permanecer `em-definicao` ou declarar o contrato adiado, apesar do gate bottom-up aprovado.

Escolher uma única paginação e propagar o estado aprovado para UCs, convenções, catálogo e resumo. A semântica comercial do primeiro campeonato gratuito e dos adicionais com pagamento próprio já está resolvida e não faz parte desta questão.

**Status:** pendente de reconciliação documental.

## Q-008 — Projeções privadas de Prefeitura

**Afeta:** descoberta do contexto institucional, painel de Prefeitura, funcionários, convites e mutações de Campos.

Não existe consulta da própria conta que informe:

- Prefeitura vinculada;
- `membroId`;
- papel `RESPONSAVEL | MEMBRO`;
- estado do vínculo;
- capacidades institucionais;
- dados mínimos de navegação.

Também faltam listagens recuperáveis de convites institucionais recebidos pela conta e enviados pela Prefeitura. Os comandos de criação e reenvio não substituem projeções consultáveis após reload.

**Status:** pendente de contrato.

## Q-009 — Restrições e concorrência nas mutações de Campos

**Afeta:** cadastro, atualização e alteração de estado operacional; não bloqueia listagem e detalhe públicos.

Definir:

- opcionalidade individual dos campos do `PATCH`;
- comportamento de payload vazio;
- limites de nome, endereço e descrição;
- unicidade e normalização;
- estratégia de atualização concorrente;
- limites de `page`/`size` e ordenação estável.

Não adicionar infraestrutura, coordenadas, mapa, piso, capacidade, agenda ou reservas: esses itens permanecem fora do MVP.

**Status:** pendente de complemento contratual.

## Q-010 — DTOs e promoção dos UCs de Partidas e Súmulas

**Afeta:** agenda, detalhe público, agendamento, escalação, súmula, WO, classificação, artilharia e estatísticas.

O gate bottom-up e o catálogo validado materializaram 11 rotas, mas diversos UCs `PAR` ainda estão `em-definicao` e dizem que o contrato foi adiado. Além disso, o catálogo descreve respostas como “200 com a projeção” sem publicar o JSON completo.

Publicar os DTOs exatos para:

- item e página de `GET /partidas`, incluindo nomes dos filtros e estados aceitos;
- detalhe público da partida;
- times, campeonato, fase, grupo, rodada, campo e agendamento;
- placares regulamentar, prorrogação e pênaltis;
- escalações e eventos publicados;
- resumo público da súmula;
- agendamento/reagendamento, adiamento e cancelamento;
- escalação do time;
- súmula definitiva e estado do PDF;
- WO;
- classificação, artilharia e estatísticas do atleta.

Reconciliar explicitamente a visibilidade: detalhe e resumo publicado são públicos; texto administrativo permanece privado; confirmar que o PDF oficial não integra a projeção pública. Promover os UCs aprovados e remover o texto de contrato adiado.

**Status:** pendente de DTO e propagação documental.

## Q-011 — DTOs e identificador público de Perfis e Leaderboards

**Afeta:** perfil esportivo, históricos e rankings públicos.

As cinco rotas foram materializadas, mas o catálogo ainda não apresenta JSON completo para perfil, históricos e leaderboards. Publicar:

- DTO do perfil esportivo e campos opcionais/nulos;
- itens e paginação dos históricos de times e campeonatos;
- itens, componentes objetivos, posição, empate e paginação dos leaderboards;
- recortes aceitos e regra “exatamente um recorte”;
- anonimização e comportamento para conta eliminada;
- `atualizadoEm` quando houver cache.

Também reconciliar o identificador público: as convenções dizem que jogadores usam `nomeUsuario` na URL, enquanto o catálogo usa `{atletaId}` nas rotas de perfil, históricos e estatísticas.

**Status:** pendente de DTO e decisão de identificador.

## Q-012 — DTOs de situação comercial e pagamentos

**Afeta:** painel comercial do organizador, checkout e histórico de pagamentos.

As rotas de Monetização foram materializadas, mas suas entradas e saídas permanecem descritivas. Publicar JSON completo para:

- `GET /minha-conta/situacao-comercial`;
- `POST /campeonatos/{campeonatoId}/pagamentos`;
- `GET /minha-conta/pagamentos`.

Definir identificadores, estados, valor/moeda, campeonato vinculado, URL e expiração do checkout, datas, paginação e comportamento após retorno do provedor. O navegador nunca deve confirmar pagamento; o webhook permanece responsabilidade exclusiva do backend.

**Status:** pendente de DTO.

## Q-013 — Idempotência do ciclo de Times e Elenco

**Afeta:** saída voluntária, desativação e reativação repetidas após timeout ou resposta perdida.

Os UCs descrevem repetição idempotente, mas o catálogo publica conflitos como `VINCULO_JA_ENCERRADO`, `TIME_JA_DESATIVADO` e `TIME_JA_ATIVO`. Definir se a repetição com o mesmo efeito reapresenta o estado existente ou retorna conflito.

Esclarecer também se a verificação de inscrição ativa antecede ou integra atomicamente a desativação do time.

**Status:** pendente de reconciliação entre UC e catálogo.
