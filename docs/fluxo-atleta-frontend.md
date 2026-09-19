# Fluxo de atleta no frontend

## Estado da implementação

Esta nota separa contrato canônico, representação no frontend e disponibilidade do backend. A fonte normativa continua sendo a pasta viva do CampoLivre no Google Drive.

### Implementado no frontend

- porta `TimesApi` com adapters explícitos `http | prototipo`, sem fallback silencioso;
- Bearer obtido exclusivamente pelo coordenador de sessão e mantido em memória;
- consultas paginadas com os parâmetros canônicos `pagina` e `tamanho`;
- caixa privada de convites por `GET /minha-conta/convites-time`;
- consulta autenticada do link por `GET /convites-time/{token}`;
- aceite e recusa por `POST /convites-time/{token}/aceite|recusa`, sem corpo indevido;
- confirmação antes do comando, estados terminais e tratamento explícito de `403`, `409` e `410`;
- protótipo com convites isolados por conta, máquina de estados e vínculo criado somente após aceite;
- convite encerrado removido da projeção de pendências;
- criação de Time por `POST /times`, com `Idempotency-Key` estável por intenção e Município do catálogo;
- consulta dos Times vinculados à conta, detalhe público, elenco, atualização, escudo, convites enviados e operações de elenco;
- telas de início, perfil, busca, criação e gestão de Time usando portas em vez de fixtures diretas;
- modo integrado exclusivamente HTTP e fail-closed nas jornadas ainda dependentes de stores locais.

A existência de adapter HTTP e testes com transporte interceptado prova a representação frontend do contrato publicado. Não prova disponibilidade, autorização ou persistência no backend real.

## Disponibilidade executável do backend

Auditoria somente leitura de `origin/main` em `4de098c9ba3d60e51dfd518b1f3054b27b679ba5`:

- disponíveis: infraestrutura HTTP `/api/v1`, OpenAPI/Swagger, CORS, validação, login, refresh, logout e consulta pública de Municípios;
- ainda ausentes como endpoints executáveis: ativação de organizador, criação/gestão de Time, consulta/aceite/recusa de convite por token e desativação da própria conta;
- modelos Prisma não equivalem a contrato HTTP disponível.

Consequentemente, as jornadas de Times permanecem utilizáveis no protótipo e preparadas no adapter HTTP, mas sua homologação real está bloqueada até o backend publicar os controllers, DTOs, autorização e testes correspondentes.

## Fluxo canônico de convite

A listagem privada não expõe token. O token opaco chega pelo link externo e é usado somente no path da jornada autenticada:

1. abrir `/convites-time/{token}`;
2. renovar/validar a sessão sem persistir credenciais no navegador;
3. consultar a projeção segura do convite;
4. exibir apenas ações presentes em `acoesPermitidas`;
5. confirmar aceite ou recusa;
6. após aceite, consultar o vínculo do Time pelos endpoints privados, sem inferir inscrição em Campeonato.

O frontend não fabrica token a partir de `conviteId`, não o inclui na listagem e não cria vínculo apenas na store de sessão.

## Bloqueios reais restantes

- homologar Times e convites contra a API real quando os endpoints forem publicados;
- homologar o bootstrap autenticado quando `GET /minha-conta` estiver executável;
- manter Reservas e operação de Súmula bloqueadas no integrado enquanto dependerem de stores locais;
- implementar atleta menor somente após contrato completo de responsável e consentimento;
- não tratar convite de Time como inscrição automática em Campeonato.

As lacunas documentais transversais permanecem centralizadas em `docs/questoes-a-acertar.md`.

## Limites de segurança

- conta pessoal não recebe vínculo, papel ou capacidade esportiva automaticamente;
- uma pessoa pode manter vínculos simultâneos com vários Times;
- capitania é contextual ao Time;
- guards frontend são UX e não substituem autorização backend;
- produção seleciona somente adapters HTTP;
- protótipo é explícito, não representa persistência real e não reutiliza credenciais;
- nenhum dado privado de convite pode atravessar contas ou personas.
