# Questões contratuais a acertar

**Atualizado em:** 2026-08-28
**Fonte canônica:** pasta viva do CampoLivre no Google Drive
**Catálogo de rotas:** validado em 2026-08-28

Este arquivo registra apenas lacunas ainda abertas. Projeções e comandos já publicados no Drive não devem permanecer descritos como pendentes.

## Resolvido pela revisão de 28/08/2026

A documentação canônica publicou contratos recuperáveis para:

- `GET /api/v1/minha-conta/campeonatos`;
- `GET /api/v1/campeonatos/{campeonatoId}/administracao`;
- `GET /api/v1/campeonatos/{campeonatoId}/organizadores`;
- `GET /api/v1/usuarios/busca-organizadores`;
- `GET /api/v1/campeonatos/{campeonatoId}/convites`;
- `GET /api/v1/campeonatos/{campeonatoId}/times/{timeId}/elenco`;
- `GET /api/v1/campeonatos/{campeonatoId}/fases`;
- `GET /api/v1/campeonatos/{campeonatoId}/distribuicao`;
- `GET /api/v1/campeonatos/{campeonatoId}/estrutura`;
- agenda e detalhe administrativo de Partidas;
- agendamento/reagendamento, adiamento, cancelamento e WO;
- escalação, súmula, classificação e PDF oficial em suas jornadas próprias.

Esses itens agora são implementáveis no frontend via adapters HTTP. O modo integrado não deve recorrer a catálogos locais para preencher essas projeções.

## Q-001 — Leitura integral do Regulamento

- **Status:** aberta; bloqueia edição recuperável segura.
- **Comando existente:** `PUT /api/v1/campeonatos/{campeonatoId}/regulamento`.
- **Projeção ausente:** leitura que devolva integralmente:
  - `regulamentoTexto`;
  - `permiteWo`;
  - placar de WO;
  - `criterioBye`;
  - demais campos editáveis do formulário.
- **Risco:** após reload, o frontend não consegue distinguir formulário vazio de configuração já persistida. Um novo `PUT` poderia sobrescrever regras vigentes sem apresentá-las ao organizador.
- **Comportamento do frontend:** edição fail-closed no modo integrado, com explicação explícita. Não preencher o formulário com mock nem apresentar sucesso local como persistência.
- **Decisão necessária no Drive:** publicar `GET /campeonatos/{id}/regulamento` ou incorporar todos os campos à projeção administrativa.

## Q-002 — Leitura integral dos parâmetros das fases

- **Status:** parcialmente aberta.
- **Projeção existente:** `GET /api/v1/campeonatos/{campeonatoId}/fases` recupera IDs, ordem, tipo, turnos, classificados, grupos e estado de materialização.
- **Campos ainda não recuperáveis:**
  - pontos por vitória, empate e derrota;
  - número de partidas por confronto;
  - prorrogação;
  - pênaltis;
  - gol de ouro;
  - critérios de desempate vigentes.
- **Risco:** a estrutura materializada pode ser exibida corretamente, mas o formulário completo anterior à geração não pode ser reconstruído com fidelidade.
- **Comportamento do frontend:** consultar e exibir fases/distribuição/confrontos persistidos; não simular os parâmetros ausentes. Quando uma configuração já persistida não puder ser reconstruída integralmente, impedir substituição cega e explicar a limitação.
- **Decisão necessária no Drive:** ampliar a projeção de fases ou publicar uma projeção de configuração esportiva completa, incluindo os critérios de desempate.

## Q-003 — Identificador duplicado `UC-CMP-019`

- **Status:** aberta; problema documental.
- Existem documentos com o mesmo identificador para:
  - abrir inscrições;
  - finalizar inscrições.
- O fluxo vigente utiliza **Finalizar inscrições**, que leva de `EM_INSCRICOES` para `AGUARDANDO_SORTEIO` e congela participantes/configuração.
- **Decisão necessária:** renumerar ou arquivar o documento duplicado para evitar rastreabilidade ambígua.

## Regras que permanecem vigentes

- A criação continua exigindo formato pretendido.
- Formatos do MVP:
  - `PONTOS_CORRIDOS`;
  - `MATA_MATA`;
  - `GRUPOS_E_MATA_MATA`.
- Convite não inscreve o Time automaticamente; depende do aceite do capitão.
- Equipe representa organizadores administrativos, não Times participantes.
- Estrutura define fases, distribuição e confrontos.
- Partidas agenda e opera confrontos já materializados.
- CampoLivre confirma autorização externa do Campo, mas não administra reservas ou disponibilidade municipal.
- Produção é exclusivamente HTTP; dados de protótipo devem ser identificados como simulados e não persistentes.
