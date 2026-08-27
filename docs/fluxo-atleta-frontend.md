# Fluxo de atleta no frontend

## Estado da implementação

Esta nota separa contrato canônico, comportamento implementado e bloqueios reais. A fonte normativa continua sendo a pasta viva do CampoLivre no Google Drive.

### Implementado

- contrato `TimesApi` para o domínio de Times e Elenco;
- adapter HTTP sem fallback para `GET /minha-conta/convites-time?page=1&size=20`;
- Bearer obtido exclusivamente pelo coordenador de sessão e mantido em memória;
- adapter de protótipo em memória com convites privados isolados por conta;
- painel de convites com estados de carregamento, vazio, sucesso e erro;
- paginação navegável, sem limitar a conta à primeira página de resultados;
- limpeza imediata do resultado anterior ao trocar de conta, origem da consulta ou página;
- listagem sem token, conforme UC-TIM-007;
- rotas `/atleta/inicio`, `/atleta/perfil`, `/atleta/time/buscar` e `/atleta/time/{id}` liberadas no modo integrado;
- E2E integrado verificando bootstrap da sessão, Bearer em memória e chamada HTTP paginada;
- remoção da fixture direta e da persistência de recusas em `sessionStorage`;
- remoção dos botões simulados de aceite e recusa da listagem;
- busca pública de times ativos por nome com `GET /times`;
- resultado resumido com nome, sigla, município/UF e link para o detalhe público;
- detalhe público integrado por `GET /times/{timeId}`;
- elenco ativo paginado por `GET /times/{timeId}/elenco`, sem dados privados nem Bearer;
- atualização autenticada de nome, sigla e descrição por `PATCH /times/{timeId}`, com autorização definitiva no backend;
- upload/substituição e remoção do escudo por `PUT|DELETE /times/{timeId}/escudo` com `FormData` sem `Content-Type` manual;
- busca exata de atleta, envio idempotente, reenvio e cancelamento do convite recém-criado;
- remoção de atleta, saída voluntária e transferência de capitania;
- histórico privado do elenco, desativação e reativação do time;
- perfil básico da conta com atualização de nome, biografia, posição principal e foto;
- início autenticado neutro, sem fabricar vínculos ausentes;
- listagem pública `/times` por HTTP, com busca por nome, UF e paginação;
- telas públicas de atletas sem fixtures enquanto o perfil esportivo não possui contrato;
- Campeonatos e Meus eventos exibem indisponibilidade contratual explícita, sem dados simulados.

A implementação do adapter HTTP prova aderência local ao contrato documentado. Não prova que o backend real esteja disponível ou integrado.

## Lacuna contratual de aceite e recusa

O catálogo define:

- `GET /minha-conta/convites-time`, cuja resposta contém `id`, time, remetente e validade, mas deliberadamente não contém token;
- `POST /convites-time/{token}/aceite`;
- `POST /convites-time/{token}/recusa`.

Consequentemente, a listagem não possui informação suficiente para executar aceite ou recusa por seus próprios botões. O fluxo canônico descrito nos UCs começa pelo link único recebido por notificação, e-mail ou compartilhamento externo.

Ainda falta ao contrato definir como a página aberta pelo link obtém uma projeção segura do convite antes da confirmação. Até isso ser publicado no Drive, o frontend não deve:

- fabricar token a partir do `conviteId`;
- expor token na listagem;
- inventar `GET /convites-time/{token}`;
- simular aceite/recusa como se fossem integração;
- criar vínculo de time apenas na store de sessão.

## Operações bloqueadas por contrato

Bloqueios contratuais localizados:

- não existe rota privada para consultar os times ou vínculos ativos da conta;
- criar time exige `municipioId` do catálogo, mas não existe rota HTTP publicada para consultar municípios. Questão a acertar entre Gabriel e Thales: publicar uma consulta pública paginada de municípios com UUID interno, nome, UF e eventual código IBGE. A API externa do IBGE não substitui diretamente o UUID esperado pelo backend. Até a decisão ser materializada no Drive, o frontend integrado não deve aceitar cidade livre nem fabricar UUID.
- nome e sigla são obrigatórios, mas não possuem limites, caracteres aceitos ou normalização publicados. Até o contrato ser fechado, o frontend exige preenchimento e respeita apenas o limite canônico de 500 caracteres da descrição.

1. Resolver a consulta segura do convite por link e então implementar aceitar/recusar.
2. Publicar a consulta dos vínculos e times da conta autenticada.
3. Publicar municípios e então implementar criação de time e alteração do município do perfil.
4. Publicar a listagem persistente de convites enviados pelo time.
5. Publicar os DTOs completos do detalhe de time e do perfil esportivo.
6. Sanear o contrato de Campeonatos e publicar a agenda de partidas.
7. Implementar atleta menor somente após contrato completo de responsável e consentimento.

Todas as lacunas estão centralizadas em `docs/questoes-a-acertar.md`.

## Limites de segurança

- conta pessoal não recebe vínculo, papel ou capacidade esportiva automaticamente;
- uma pessoa pode manter vínculos simultâneos com vários times;
- capitania é contextual ao time;
- guards frontend são UX e não substituem autorização backend;
- produção seleciona somente adapters HTTP;
- protótipo deve permanecer explícito, não persistido e sem backend;
- nenhum dado privado de convite pode atravessar personas no protótipo.
