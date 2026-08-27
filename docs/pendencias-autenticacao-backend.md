# Pendências da autenticação para integração com o backend

Atualizado em 2026-08-25. A pasta viva do CampoLivre no Drive continua sendo a fonte canônica. Este arquivo registra trabalho técnico adiado; não cria requisitos.

## Estado atual do frontend

Implementado e verificável no frontend com adapters separados, testes unitários e protótipo em memória:

- contratos TypeScript de login, renovação web e `/minha-conta` reconciliados com `06-API/Catalogo-de-Rotas.md`;
- cliente HTTP e normalização de Problem Details;
- modo integrado exclusivamente HTTP e modo protótipo explicitamente identificado, sem fallback;
- access token e sua expiração somente em memória;
- bootstrap por renovação seguido de `/minha-conta`;
- cadastro adulto, confirmação/reenvio, login, logout, rota privada, retorno interno seguro e `/minha-conta`;
- recuperação/redefinição e alteração autenticada de senha;
- solicitação/confirmação de alteração de e-mail e reativação por credenciais ou link de e-mail;
- deduplicação de refresh e repetição única após `401` disponível no coordenador;
- CPF e RG mascarados na área privada;
- nenhum token em `localStorage` ou `sessionStorage`.

Isso não comprova integração real: o backend atual ainda não oferece os endpoints.

## Retomar quando o backend existir

### Infraestrutura e persistência

- materializar o DBML canônico no Prisma/PostgreSQL;
- implementar contas, sessões, famílias de refresh, hashes, revogações e auditoria;
- comprovar expiração absoluta da família de refresh;
- implementar limite de cinco sessões e revogação da mais antiga;
- verificar invalidação imediata de access token após logout/revogação conforme arquitetura vigente.

### Endpoints centrais

- `POST /api/v1/login`;
- `POST /api/v1/login/renovacoes`;
- `POST /api/v1/logout`;
- `GET /api/v1/minha-conta`;
- exercitar status, corpos e Problem Details reais contra os DTOs do Drive.

### Cookie e implantação

- emitir e rotacionar o refresh em cookie `HttpOnly`;
- validar `Secure`, `SameSite`, domínio, caminho e expiração em cada ambiente;
- fechar CORS e política de credenciais no desenvolvimento cross-origin;
- fechar proteção CSRF conforme a topologia implantada;
- confirmar que o JSON web mantém `refreshToken: null` e que JavaScript nunca recebe o valor real.

### Comportamento de sessão ainda não conectado

- ligar o coordenador de refresh ao cliente autenticado compartilhado quando existirem outras APIs reais;
- atualizar a credencial em memória depois de refresh durante o uso;
- reconciliar novamente `/minha-conta` quando capacidades globais puderem mudar;
- tratar `REUTILIZACAO_DETECTADA` com aviso de segurança específico;
- decidir e implementar renovação proativa antes de `accessTokenExpiraEm`;
- validar concorrência e rotação com testes de integração reais.

### Separação dos mocks de domínio

A store ainda preserva vínculos operacionais fake para manter as telas protótipo de Times, Campeonatos e Prefeitura. Esses dados:

- não vêm de `/minha-conta`;
- não autorizam chamadas reais;
- devem migrar para providers/services dos respectivos domínios;
- devem ser removidos da store de autenticação quando as APIs de domínio existirem.

### Limite da suíte E2E legada

Os E2E direcionados de autenticação e conta são o gate desta primeira fatia frontend. A suíte legada completa também exercita stores e mocks operacionais locais de Times, Campeonatos e Prefeitura, incluindo cenários que historicamente presumiam identidade persistente durante navegações duras ou recargas.

Esses cenários antigos são úteis como medição de regressão do protótipo, mas:

- não representam integração com backend, banco ou cookie `HttpOnly` real;
- não devem fabricar sessão com Web Storage, cookie legível por JavaScript, token em URL ou hook global de teste;
- não justificam criar autenticação paralela ou persistência fake;
- deverão ser reconciliados com as APIs e fixtures de integração dos respectivos domínios quando elas existirem.

Falhas remanescentes exclusivamente nesses mocks operacionais não bloqueiam a fatia de autenticação frontend quando os testes direcionados e os gates estáticos passam. O resultado da suíte completa deve ser informado com transparência, sem ser apresentado como prova de autenticação real.

### Cadastro e ciclo da conta

- implementar uma fonte canônica pública de municípios antes de habilitar o cadastro no modo integrado;
- entregar envio real dos e-mails de confirmação, alteração de endereço e recuperação;
- aplicar consumo único e expiração dos tokens no servidor;
- verificar com integração real a revogação de todas as sessões após troca/recuperação de senha;
- verificar no servidor o prazo e o cancelamento da eliminação durante a reativação;
- integrar desativação, eliminação e demais operações de perfil em uma fatia própria, sem tratá-las como autenticação concluída.

### Menores e responsável

- escolher e integrar o provedor de verificação;
- implementar comprovação da autoridade legal do responsável;
- implementar consentimento, status, revogação e transições documentadas;
- não simular aprovação no adapter de produção;
- não armazenar selfie, vídeo, biometria ou documento do responsável no frontend.

### Validação e segurança

- adicionar validação runtime dos DTOs externos se o contrato/backend justificar;
- verificar `Retry-After` e rate limits finais;
- executar testes reais com NestJS, PostgreSQL e navegador;
- provar ausência de CPF, RG, e-mail e nascimento completo em projeções públicas;
- executar revisão de segurança antes de staging.

## Condição para declarar integração concluída

Somente marcar como integrado quando adapter HTTP, backend, banco e cookies reais forem exercitados conjuntamente. Testes com fake ou interceptação comprovam comportamento frontend contra contrato, não persistência nem segurança do servidor.
