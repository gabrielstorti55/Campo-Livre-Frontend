# Pendências da autenticação para integração com o backend

Atualizado em 2026-08-23. A pasta viva do CampoLivre no Drive continua sendo a fonte canônica. Este arquivo registra trabalho técnico adiado; não cria requisitos.

## Estado atual do frontend

Implementado e verificável com adapter fake/injeção de testes:

- contratos TypeScript de login, renovação web e `/minha-conta` reconciliados com `06-API/Catalogo-de-Rotas.md`;
- cliente HTTP e normalização de Problem Details;
- adapter HTTP e adapter fake separados;
- access token e sua expiração somente em memória;
- bootstrap por renovação seguido de `/minha-conta`;
- login, logout, rota privada, retorno interno seguro e página `/minha-conta`;
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

Também atualizar os E2E antigos que ainda inspecionam chaves históricas de `sessionStorage` fora da fatia já migrada.

### Cadastro e ciclo da conta

- integrar cadastro adulto completo com CPF e RG;
- confirmar o endpoint canônico para seleção pública de municípios antes de ligar `municipioId`;
- integrar confirmação e reenvio de e-mail;
- integrar recuperação e redefinição de senha;
- consumir tokens uma vez, removê-los da URL e nunca persisti-los;
- verificar revogação de todas as sessões após troca/recuperação de senha.

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
