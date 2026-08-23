# Autenticação frontend do CampoLivre — Plano de Implementação

> **For Hermes:** executar este plano tarefa por tarefa com TDD estrito (RED → GREEN → REFACTOR). Não fazer commit ou push sem autorização explícita de Gabriel.

**Goal:** substituir a autenticação mock persistida em `sessionStorage` por uma integração web segura e testável para login, recuperação da sessão, refresh rotativo, logout, consulta da própria conta, recuperação de senha, cadastro adulto e confirmação de e-mail, seguindo a pasta viva do Drive.

**Architecture:** separar contratos de API, transporte HTTP, serviços de autenticação e estado React. O access token ficará somente em memória; o refresh token será controlado exclusivamente pelo backend em cookie `HttpOnly`. Autorizações contextuais de time, campeonato e Prefeitura não serão inferidas da sessão de autenticação. Enquanto o backend ainda não possui os endpoints, testes usarão adapters fakes injetáveis; o caminho de produção usará somente o adapter HTTP.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5.8, Fetch API, Vitest + Testing Library para testes direcionados, Playwright para fluxos E2E, Prettier, ESLint, Knip e TypeScript.

---

## 1. Resposta executiva e limites

### Temos informação suficiente?

**Sim, para começar a implementação do frontend em fatias verticais.** O Drive define suficientemente:

- conta pessoal;
- login por e-mail e senha;
- payload de cadastro com CPF e RG;
- estados de conta e continuação do cadastro;
- access token e refresh token web;
- rotação, reutilização, limite e duração das sessões;
- logout atual e revogação global por senha/bloqueio;
- `/minha-conta` e capacidades globais;
- Problem Details e erros relevantes;
- recuperação de senha e confirmação de e-mail.

### O que ainda não pode ser declarado pronto?

1. **Integração real:** o backend atual possui apenas a estrutura NestJS inicial e `schema.prisma` sem entidades. Não existem endpoints executáveis para validar o frontend.
2. **Fluxo real de menor:** depende de provedor de verificação e comprovação da autoridade legal do responsável.
3. **Produção:** ainda é necessário fechar topologia de domínio/cookies, CORS local, CSRF, variáveis de ambiente e rate limits finais de login.
4. **Contextos de negócio:** login e `/minha-conta` não retornam times, capitanias, campeonatos ou Prefeituras. Esses vínculos virão de APIs dos respectivos domínios.
5. **Conflitos documentais não relacionados ao núcleo:** ator de habilitação do organizador, expiração absoluta da família no modelo e linha corrompida `UC-CMP-003` devem continuar registrados, mas não impedem o shell de autenticação frontend.

### Escopo do primeiro incremento executável

1. contratos e testes;
2. cliente HTTP e Problem Details;
3. login;
4. inicialização da sessão por refresh;
5. refresh concorrente deduplicado;
6. logout;
7. `/minha-conta`;
8. proteção de rotas e destino seguro.

Depois desse núcleo estabilizar:

9. recuperação de senha;
10. cadastro adulto com CPF e RG;
11. confirmação de e-mail;
12. estados de cadastro de menor, sem integração real do provedor.

---

## 2. Princípios obrigatórios

- Drive vigente prevalece sobre conversa, Figma, código e este plano.
- Revalidar o snapshot do Drive antes de cada incremento relevante; se o contrato mudou, atualizar tipos/testes antes do código.
- Nenhum token em `localStorage` ou `sessionStorage`.
- Access token apenas em memória React.
- Refresh token inacessível ao JavaScript, em cookie `HttpOnly` do backend.
- `credentials: 'include'` nas operações que usam cookie.
- Uma única renovação em andamento compartilhada por chamadas concorrentes.
- Repetir a requisição original no máximo uma vez após refresh.
- `401` pode iniciar refresh; `403` nunca inicia refresh.
- Mensagens de login e recuperação não enumeram contas.
- CPF e RG só aparecem na projeção privada; nunca em logs, analytics, erros brutos ou fixtures reais.
- A store de sessão não armazena vínculos de times, campeonatos ou Prefeitura.
- Não misturar refatoração ampla das telas de domínio com autenticação.
- Cada comportamento novo começa por teste falhando.
- Não fazer commit/push sem autorização, apesar dos checkpoints naturais descritos abaixo.

---

## 3. Estrutura proposta

```text
src/
  services/
    api/
      cliente-api.ts
      problem-details.ts
    autenticacao/
      autenticacao-api.ts
      autenticacao-http.ts
      autenticacao-fake.ts
      coordenador-refresh.ts
      navegacao-sessao.ts
  types/
    api/
      autenticacao.ts
    sessao.ts
  stores/
    sessao.tsx
  hooks/
    use-sessao.ts
  components/
    autenticacao/
      guarda-sessao.tsx
  screens/
    publico/
      login.tsx
      recuperar-senha.tsx
      redefinir-senha.tsx
      cadastro.tsx
      confirmar-email.tsx
    conta/
      minha-area.tsx
      minha-conta.tsx
src/app/
  confirmar-email/page.tsx
  redefinir-senha/page.tsx
  minha-conta/page.tsx
  ...
tests/
  unit/
    services/api/cliente-api.test.ts
    services/autenticacao/coordenador-refresh.test.ts
    stores/sessao.test.tsx
  e2e/
    autenticacao-login.spec.ts
    autenticacao-sessao.spec.ts
    autenticacao-recuperacao.spec.ts
    autenticacao-cadastro.spec.ts
```

Os nomes finais podem ser reduzidos se algum arquivo não possuir uso real. Não criar barrels `index.ts`.

---

## 4. Plano passo a passo

### Task 0: Congelar o contrato de trabalho

**Objective:** garantir que a implementação começa da versão vigente e remover uma frase residual que ainda contradiz o Drive.

**Files:**
- Modify: `docs/autenticacao-frontend.md`
- Read-only source: snapshot vigente do Drive

**Steps:**

1. Baixar novamente a pasta viva em modo somente leitura.
2. Comparar hash com o snapshot auditado.
3. Se houver alteração, reconciliar os contratos afetados antes de continuar.
4. Corrigir a frase residual em `docs/autenticacao-frontend.md` que diz que chamada direta deve ser recusada “quando a pessoa for menor”; o Drive atual não cria esse bloqueio etário.
5. Rodar Prettier e `git diff --check` somente na documentação.

**Expected:** contrato sem regra etária inventada e fonte estável registrada.

---

### Task 1: Adicionar infraestrutura de testes unitários

**Objective:** permitir TDD rápido para cliente HTTP, refresh e store sem depender do build E2E completo.

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `vitest.config.ts`
- Create: `tests/setup.ts`
- Modify: `tsconfig.json` somente se o alias `@/` não for resolvido automaticamente

**Dependencies propostas:**

```text
vitest
jsdom
@testing-library/react
@testing-library/jest-dom
@testing-library/user-event
```

**Scripts propostos:**

```json
{
  "test:unit": "vitest run",
  "test:unit:watch": "vitest"
}
```

**TDD/verification:**

1. Criar um teste mínimo de ambiente.
2. Rodar `npm run test:unit`; confirmar falha inicial de configuração.
3. Configurar Vitest/jsdom/alias.
4. Rodar novamente; esperar PASS.
5. Rodar `npm run typecheck`.

**Checkpoint:** não commitá-lo sem autorização.

---

### Task 2: Modelar contratos HTTP sem contaminar os tipos de domínio

**Objective:** representar exatamente os DTOs usados pela primeira fatia.

**Files:**
- Create: `src/types/api/autenticacao.ts`
- Modify: `src/types/sessao.ts`
- Test: `tests/unit/types/autenticacao.test.ts` apenas para funções de parse/guards; tipos puros são verificados por TypeScript

**Tipos mínimos:**

- `PlataformaLogin = 'WEB' | 'MOBILE'`;
- `EntradaLogin`;
- `RespostaLogin`;
- `RespostaRenovacao`;
- `MinhaConta` com CPF e RG privados;
- `EntradaCadastro` com `rgNumero`, `rgOrgaoExpedidor` e `rgUf`;
- estados e próximas ações de cadastro;
- recuperação e confirmação de senha;
- confirmação de e-mail;
- `ProblemDetails`.

**Regras:**

- não incluir `teamIds`, capitanias ou campeonatos nos DTOs de autenticação;
- não modelar refresh token na resposta web acessível ao JavaScript;
- `consentimentoResponsavelNecessario` é `boolean`;
- `cadastroToken` não é sessão;
- nomes técnicos seguem o JSON em português/camelCase.

**Verification:** `npm run typecheck` deve passar.

---

### Task 3: Implementar parser seguro de Problem Details

**Objective:** transformar respostas de erro em um formato estável sem expor payload bruto.

**Files:**
- Create: `src/services/api/problem-details.ts`
- Test: `tests/unit/services/api/problem-details.test.ts`

**TDD cycles:**

1. RED: reconhece RFC 9457 válido.
2. GREEN: parser mínimo.
3. RED: resposta não JSON vira erro de transporte genérico.
4. GREEN: fallback seguro.
5. RED: `erros` inválidos são ignorados sem quebrar a tela.
6. GREEN: sanitização.

**Acceptance:** componentes podem usar `codigo` e erros de campo sem comparar `detail`.

---

### Task 4: Implementar cliente HTTP base

**Objective:** centralizar URL, headers, Bearer, cookies e erros.

**Files:**
- Modify: `.env.example`
- Create: `src/services/api/cliente-api.ts`
- Test: `tests/unit/services/api/cliente-api.test.ts`

**Configuração:**

- substituir a variável obsoleta `VITE_API_URL` por `NEXT_PUBLIC_API_URL`;
- em produção, preferir URL relativa `/api/v1` quando frontend/backend estiverem no mesmo domínio;
- não incluir segredo em variável pública.

**TDD cycles:**

1. envia JSON e `Accept: application/json`;
2. inclui Bearer quando houver access token;
3. usa `credentials: 'include'` para login/refresh/logout;
4. não persiste tokens;
5. converte resposta não 2xx em Problem Details;
6. respeita `204` sem tentar parsear JSON;
7. não repete automaticamente `POST` arbitrário;
8. suporta sinal/abort quando a tela desmonta.

---

### Task 5: Criar interface de autenticação e adapters HTTP/fake

**Objective:** permitir que UI e store dependam de comportamento, não de Fetch nem de mocks globais.

**Files:**
- Create: `src/services/autenticacao/autenticacao-api.ts`
- Create: `src/services/autenticacao/autenticacao-http.ts`
- Create: `src/services/autenticacao/autenticacao-fake.ts`
- Test: `tests/unit/services/autenticacao/autenticacao-http.test.ts`

**Interface mínima:**

```ts
interface AutenticacaoApi {
  login(input: EntradaLogin): Promise<RespostaLogin>;
  renovar(): Promise<RespostaRenovacao>;
  logout(): Promise<void>;
  consultarMinhaConta(accessToken: string): Promise<MinhaConta>;
  solicitarRecuperacao(email: string): Promise<void>;
  redefinirSenha(input: EntradaRedefinicao): Promise<void>;
  cadastrar(input: EntradaCadastro): Promise<RespostaCadastro>;
  confirmarEmail(token: string): Promise<RespostaConfirmacaoEmail>;
}
```

**Rules:**

- adapter HTTP é o caminho de produção;
- fake é injetado explicitamente em testes/E2E;
- sem `if (mock)` espalhado nas telas;
- fake não usa `sessionStorage` para tokens.

---

### Task 6: Implementar coordenador de refresh

**Objective:** garantir rotação segura sem reutilização acidental por concorrência.

**Files:**
- Create: `src/services/autenticacao/coordenador-refresh.ts`
- Test: `tests/unit/services/autenticacao/coordenador-refresh.test.ts`

**TDD cycles obrigatórios:**

1. duas chamadas concorrentes compartilham uma única Promise de refresh;
2. sucesso limpa a Promise em andamento;
3. falha limpa a Promise para permitir tentativa futura controlada;
4. `RENOVACAO_INVALIDA` e `RENOVACAO_EXPIRADA` encerram a sessão;
5. `REUTILIZACAO_DETECTADA` encerra a sessão e produz motivo de segurança;
6. requisição original é repetida uma única vez;
7. `403` não chama refresh;
8. um segundo `401` após refresh não cria loop.

---

### Task 7: Redesenhar a store como máquina de estados em memória

**Objective:** substituir `hydrated + SessaoPessoal | null` por estados explícitos e remover autenticação do `sessionStorage`.

**Files:**
- Modify: `src/stores/sessao.tsx`
- Modify: `src/types/sessao.ts`
- Modify: `src/hooks/use-sessao.ts`
- Modify: `src/layouts/provedores-aplicacao.tsx`
- Test: `tests/unit/stores/sessao.test.tsx`

**Estados:**

```text
carregando
visitante
autenticando
autenticado
expirado/erro de segurança → visitante com aviso
```

**Dados autenticados:**

- access token;
- expiração;
- projeção privada da conta;
- `administrador`;
- `organizadorHabilitado`;
- contexto de navegação opcional, sem vínculos inventados.

**TDD cycles:**

1. inicia em `carregando`;
2. refresh válido recupera sessão e `/minha-conta`;
3. refresh ausente/expirado vira visitante sem erro visual indevido;
4. login válido vira autenticado;
5. logout limpa memória mesmo se API falhar/estiver expirada;
6. nenhum token é gravado em Web Storage;
7. recarregar não produz flash de área privada;
8. conta sem contexto vai para `/minha-area`.

**Compatibilidade:** operações mock de times/campeonatos devem sair da store de autenticação. Se telas ainda dependerem delas, manter um provider operacional separado temporário, não misturá-las no novo estado auth.

---

### Task 8: Integrar a tela de login

**Objective:** fazer login real pela interface de serviço, com estados acessíveis e erros neutros.

**Files:**
- Modify: `src/screens/publico/login.tsx`
- Modify: `src/services/autenticacao/navegacao-sessao.ts`
- Test: `tests/e2e/autenticacao-login.spec.ts`
- Test: teste unitário de formulário somente se houver lógica extraída

**TDD E2E com interceptação da API:**

1. RED: login envia e-mail, senha e `plataforma: 'WEB'`.
2. GREEN: conectar formulário ao serviço.
3. RED: e-mail inexistente e senha incorreta mostram “E-mail ou senha inválidos.”.
4. GREEN: mapear `CREDENCIAIS_INVALIDAS`.
5. RED: botão mostra envio e impede submissão duplicada.
6. RED: falha de rede não é apresentada como credencial inválida.
7. RED: `EMAIL_NAO_CONFIRMADO`, `CONTA_INAPTA` e `429` possuem tratamentos próprios.
8. RED: destino pós-login externo é rejeitado; destino interno é revalidado.

**UI:** preservar `LayoutAutenticacao`, tokens e componentes existentes.

---

### Task 9: Inicialização, proteção de rotas e sessão expirada

**Objective:** recuperar sessão no reload e impedir renderização indevida de páginas privadas.

**Files:**
- Create: `src/components/autenticacao/guarda-sessao.tsx`
- Modify: `src/layouts/areas-personas.tsx`
- Modify: `src/screens/conta/minha-area.tsx`
- Test: `tests/e2e/autenticacao-sessao.spec.ts`

**TDD scenarios:**

1. cookie válido + refresh válido → área privada;
2. refresh inválido → login/visitante;
3. sessão carregando → skeleton/estado neutro, sem flash privado;
4. conta autenticada sem vínculo → `/minha-area`;
5. deep link privado preserva apenas caminho interno seguro;
6. `403` contextual mostra permissão negada e não tenta refresh;
7. access token revogado resulta em encerramento após resposta da API.

**Nota:** não implementar autorização completa de times/campeonatos/Prefeitura nesta fatia.

---

### Task 10: Integrar logout

**Objective:** revogar apenas a sessão atual e limpar sempre o estado local.

**Files:**
- Modify: layouts/botões que chamam `signOut`
- Modify: store e adapter já criados
- Test: `tests/e2e/autenticacao-sessao.spec.ts`

**TDD scenarios:**

1. envia `POST /api/v1/logout` com cookie;
2. trata `204` como sucesso;
3. logout repetido é idempotente;
4. falha/expiração ainda limpa a memória e redireciona;
5. não toca outras sessões nem inventa operação global.

---

### Task 11: Integrar `/minha-conta`

**Objective:** exibir a projeção privada canônica sem usá-la como perfil público.

**Files:**
- Create or modify: `src/screens/conta/minha-conta.tsx`
- Create: `src/app/minha-conta/page.tsx`
- Modify: shell/navegação autenticada conforme necessário
- Test: `tests/e2e/autenticacao-sessao.spec.ts`

**TDD scenarios:**

1. Bearer token é enviado;
2. CPF e RG aparecem apenas na área privada;
3. documentos são mascarados por padrão quando a tela os exibir;
4. dados civis não aparecem em páginas públicas;
5. somente `administrador` e `organizadorHabilitado` são capacidades globais;
6. nenhum `teamId` ou Prefeitura é inferido da resposta.

---

### Task 12: Recuperação e redefinição de senha

**Objective:** substituir o sucesso local por contratos reais e neutros.

**Files:**
- Modify: `src/screens/publico/recuperar-senha.tsx`
- Create: `src/screens/publico/redefinir-senha.tsx`
- Create: `src/app/redefinir-senha/page.tsx`
- Test: `tests/e2e/autenticacao-recuperacao.spec.ts`

**TDD scenarios:**

1. solicitação envia somente e-mail;
2. resposta visual é neutra para conta existente/inexistente;
3. texto não afirma que o e-mail foi enviado com certeza;
4. token é capturado, removido da URL visível e nunca logado;
5. token inválido, expirado e usado têm estados próprios;
6. nova senha e confirmação local precisam coincidir;
7. sucesso exige novo login e não autentica automaticamente.

---

### Task 13: Cadastro adulto conforme o Drive

**Objective:** implementar o formulário completo sem tipos globais de conta.

**Files:**
- Modify: `src/screens/publico/cadastro.tsx`
- Create, somente se houver uso real: componentes de seleção de município/UF e documentos
- Test: `tests/e2e/autenticacao-cadastro.spec.ts`

**Campos obrigatórios:**

- nome;
- nome de usuário;
- e-mail;
- CPF;
- número, órgão expedidor e UF do RG;
- data de nascimento;
- município por `municipioId`;
- senha e confirmação local;
- aceite dos Termos;
- telefone opcional.

**TDD scenarios:**

1. payload possui exatamente os campos do Drive;
2. confirmação de senha não é enviada;
3. não existe seletor jogador/organizador;
4. `EMAIL_INDISPONIVEL`, `NOME_USUARIO_INDISPONIVEL`, `CPF_INDISPONIVEL` e `RG_INDISPONIVEL` mapeiam campos/estado;
5. município inexistente/inativo exige nova seleção;
6. cadastro não cria sessão;
7. adulto segue para confirmação de e-mail;
8. resposta que exige consentimento segue o estado retornado pelo backend, sem corte etário local.

**Dependência a resolver:** o catálogo de autenticação usa `municipioId`, mas é necessário confirmar qual endpoint vigente fornece a lista pública de municípios antes de integrar a seleção real. Se esse contrato não existir, não inventar rota; usar interface fake e registrar o bloqueio.

---

### Task 14: Confirmação de e-mail e continuação de cadastro

**Objective:** representar corretamente os estados pós-cadastro.

**Files:**
- Create: `src/screens/publico/confirmar-email.tsx`
- Create: `src/app/confirmar-email/page.tsx`
- Create or modify: telas de status de cadastro
- Test: `tests/e2e/autenticacao-cadastro.spec.ts`

**TDD scenarios:**

1. token de URL é consumido uma vez e removido;
2. adulto confirmado segue ao login;
3. menor confirmado permanece `AGUARDANDO_CONSENTIMENTO` quando aplicável;
4. token inválido/expirado/usado tem estado próprio;
5. reenvio usa resposta neutra e invalida token anterior;
6. `cadastroToken` nunca entra em Web Storage nem vira sessão.

---

### Task 15: Preparar, mas não finalizar, o fluxo de menor

**Objective:** criar fronteiras e estados sem fingir que o provedor existe.

**Files:**
- Create/modify: telas de responsável/status somente se o incremento for autorizado
- Create: adapter do verificador apenas como interface/fake de testes
- Test: cenários de estado, não aprovação real

**Allowed:**

- formulário do responsável;
- estados `NAO_INICIADA`, `AGUARDANDO_RESULTADO`, `APROVADA`, `REPROVADA` conforme contrato;
- consulta de status;
- fake controlável em testes.

**Forbidden até decisão/implementação externa:**

- simular aprovação em produção;
- afirmar identidade/autoridade verificada;
- armazenar selfie, vídeo, documento ou biometria no frontend;
- concluir E2E real do menor sem provedor e backend.

---

### Task 16: Remover autenticação mock e separar mocks de domínio

**Objective:** evitar que dados locais antigos continuem parecendo sessão real.

**Files:**
- Modify: `src/stores/sessao.tsx`
- Modify/remove: constantes mock de sessão em `src/constants/sessao.ts`
- Modify: `src/types/sessao.ts`
- Modify: testes E2E existentes que leem `sessionStorage`
- Create, se necessário: provider separado para operações simuladas de domínio

**Rules:**

- nenhum mock de token no caminho de produção;
- testes antigos que verificam `sessionStorage` devem ser substituídos por comportamento observável ou interceptação de API;
- não quebrar páginas mock de times/campeonatos por apagar dados operacionais sem migração;
- autenticação e mocks de domínio ficam explicitamente separados.

---

### Task 17: Gates finais e revisão independente

**Objective:** provar a fatia sem sobreafirmar integração.

**Focused commands durante desenvolvimento:**

```bash
npm run test:unit -- <arquivo-ou-padrão>
npx playwright test tests/e2e/autenticacao-login.spec.ts
npx playwright test tests/e2e/autenticacao-sessao.spec.ts
npx playwright test tests/e2e/autenticacao-recuperacao.spec.ts
npx playwright test tests/e2e/autenticacao-cadastro.spec.ts
npm run typecheck
```

**Gate completo antes de concluir:**

```bash
npm run check
```

**Verificações adicionais:**

- `git diff --check`;
- busca por access/refresh token em Web Storage;
- busca por CPF/RG em páginas públicas e fixtures;
- busca por `signInWithMock`, `registerMockAccount` e chave de sessão mock no caminho de produção;
- inspeção do diff e revisão independente de segurança/qualidade;
- integração contra backend real e PostgreSQL somente quando os endpoints existirem;
- atualização de `docs/autenticacao-frontend.md` se o Drive mudar.

**Honest status labels:**

- testes com route interception/fake: frontend verificado contra o contrato;
- endpoints reais ausentes: não integrado;
- backend real + banco + cookies exercitados: integrado;
- E2E real passando: verificado ponta a ponta.

---

## 5. Arquivos provavelmente alterados

### Configuração

- `package.json`
- `package-lock.json`
- `.env.example`
- `vitest.config.ts`
- `tests/setup.ts`

### Contratos e transporte

- `src/types/api/autenticacao.ts`
- `src/types/sessao.ts`
- `src/services/api/problem-details.ts`
- `src/services/api/cliente-api.ts`
- `src/services/autenticacao/autenticacao-api.ts`
- `src/services/autenticacao/autenticacao-http.ts`
- `src/services/autenticacao/autenticacao-fake.ts`
- `src/services/autenticacao/coordenador-refresh.ts`
- `src/services/autenticacao/navegacao-sessao.ts`

### Estado e integração React

- `src/stores/sessao.tsx`
- `src/hooks/use-sessao.ts`
- `src/layouts/provedores-aplicacao.tsx`
- `src/layouts/areas-personas.tsx`
- `src/components/autenticacao/guarda-sessao.tsx`

### Telas/rotas

- `src/screens/publico/login.tsx`
- `src/screens/publico/recuperar-senha.tsx`
- `src/screens/publico/redefinir-senha.tsx`
- `src/screens/publico/cadastro.tsx`
- `src/screens/publico/confirmar-email.tsx`
- `src/screens/conta/minha-area.tsx`
- `src/screens/conta/minha-conta.tsx`
- novas páginas correspondentes em `src/app/`

### Testes

- novos testes em `tests/unit/`
- `tests/e2e/autenticacao-login.spec.ts`
- `tests/e2e/autenticacao-sessao.spec.ts`
- `tests/e2e/autenticacao-recuperacao.spec.ts`
- `tests/e2e/autenticacao-cadastro.spec.ts`
- atualização de `tests/e2e/personal-account.spec.ts` e regressões afetadas

---

## 6. Ordem recomendada de entrega

### Entrega A — núcleo de sessão

Tasks 0–11:

- testes;
- contratos;
- cliente HTTP;
- login;
- refresh;
- store em memória;
- proteção de rotas;
- logout;
- `/minha-conta`.

**Resultado:** frontend pronto para plugar no backend real assim que os cinco endpoints centrais existirem.

### Entrega B — recuperação

Task 12.

### Entrega C — cadastro adulto e confirmação

Tasks 13–14.

### Entrega D — menor

Task 15, somente após provedor e autoridade legal estarem fechados/implementados.

### Entrega E — remoção definitiva dos mocks de autenticação

Tasks 16–17, preservando mocks de outros domínios em provider separado enquanto suas APIs não existem.

---

## 7. Dúvidas abertas e impacto

| Dúvida | Bloqueia começar? | Bloqueia o quê? |
| --- | --- | --- |
| Backend ainda sem endpoints de autenticação | Não | integração real e E2E real |
| Endpoint público para listar municípios | Não para login/sessão | cadastro real |
| Provedor de verificação do responsável | Não | conclusão do fluxo de menor |
| Comprovação de autoridade legal | Não | conclusão do fluxo de menor |
| Topologia final de cookie/CORS/CSRF | Não para lógica/testes | staging/produção |
| Rate limits finais de login | Não | parametrização final/UX precisa de espera |
| Ator “Atleta” versus conta ativa ao habilitar organizador | Não | tela de habilitação do organizador |
| Expiração absoluta da família no modelo backend | Não para frontend | segurança e aceite da integração real |
| Linha `UC-CMP-003` corrompida | Não | governança de Campeonatos, fora da auth inicial |

Não é necessário pedir nova decisão ao usuário antes da **Entrega A**. Antes do cadastro real, deve-se verificar o contrato de municípios. Antes do fluxo real de menor, o provedor e a autoridade legal precisam existir.

---

## 8. Critério para começar imediatamente

Podemos começar pela **Entrega A** sem inventar requisitos. A primeira ação de código será configurar o teste unitário; o primeiro comportamento será o parser/cliente HTTP, e o primeiro fluxo visual será login. Cada passo será test-first, com o backend tratado como dependência externa ainda ausente e sem alegar integração real.
