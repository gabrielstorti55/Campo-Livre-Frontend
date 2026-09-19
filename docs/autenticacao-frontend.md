# Autenticação no frontend

## Objetivo

Definir o contrato operacional mínimo para integrar o frontend web do CampoLivre à API de Identidade e Acesso, sem duplicar o catálogo do backend nem tratar telas, mocks ou estados locais como funcionalidades implementadas.

Este documento orienta a primeira fatia vertical:

```text
cadastro pessoal
→ confirmação de e-mail
→ consentimento do responsável, quando aplicável
→ login
→ renovação da sessão
→ consulta da própria conta
→ logout
```

### Estado de implementação em 2026-09-16

O frontend possui dois modos explícitos e sem fallback entre si:

- `integrado`: usa exclusivamente `AutenticacaoHttp`; é o único modo permitido em produção e falha fechada quando a API está indisponível;
- `prototipo`: exige `NEXT_PUBLIC_APP_MODE=prototipo` fora de produção, usa estado somente em memória e exibe permanentemente que os dados são simulados, não persistidos e sem backend.

Estão implementados no contrato, adapters e interfaces: cadastro pessoal adulto, confirmação e reenvio de e-mail, login, bootstrap/refresh, consulta da conta, logout, recuperação e redefinição de senha, alteração autenticada de senha, solicitação e confirmação de alteração de e-mail e reativação da conta. Na revisão remota do backend `dbf3606`, o núcleo `login → GET /minha-conta → refresh → logout` foi exercitado contra PostgreSQL 16 e pelo navegador em modo integrado: login `201`, projeção privada `200`, redirecionamento para `/minha-area`, renovação após reload `200`, cookie `HttpOnly` e logout `204`. Essa evidência não substitui a verificação separada de cadastro, e-mail, consentimento parental e demais fluxos de identidade.

Os gates são separados: `test:e2e:frontend` comprova o comportamento fechado do frontend integrado; `test:e2e:prototype:auth` exercita as jornadas em memória e não é evidência de backend. A suíte legada completa mede o protótipo dos demais domínios. Não se deve adicionar persistência de identidade no navegador nem simular infraestrutura de backend para compatibilizar testes antigos.

## Fontes e precedência

Em caso de divergência, aplicar a seguinte ordem:

1. pasta viva e atualizada do CampoLivre no Google Drive para produto, atores, casos de uso, regras, dados, arquitetura, API e rastreabilidade;
2. Figma mais recente somente para composição visual e interação que não contradigam o Drive;
3. código para o estado efetivamente implementado;
4. este documento como tradução operacional da primeira fatia, nunca como nova fonte de regras de negócio;
5. conversas, memória e documentos antigos apenas como histórico.

Gabriel e Thales decidem em conjunto e Thales materializa a decisão vigente no Drive. Uma declaração anterior em conversa não prevalece enquanto não estiver incorporada à pasta viva. Se dois documentos vigentes do próprio Drive divergirem, registrar o conflito e suspender somente a decisão afetada, sem criar uma terceira regra.

## Auditoria da pasta CampoLivre inteira

Este contrato foi reconciliado com uma nova leitura integral, somente leitura, da pasta viva do Drive `1YwUHqTzc_kQFg4cqQl8yp6fOAJ1De4z6`.

Inventário observado na revisão:

- 207 itens: 188 arquivos e 19 pastas;
- 188 arquivos comparados por caminho e SHA-256 com o snapshot anterior;
- nenhum arquivo adicionado ou removido desde o snapshot anterior;
- 66 arquivos modificados e 122 inalterados;
- 114 UCs na matriz vigente;
- 241 RNs canônicas efetivamente referenciadas pela matriz;
- DBML com 34 tabelas, aproximadamente 481 colunas e 105 referências;
- 68 rotas no resumo atual: 43 de Identidade e Acesso, 20 de Times e Elenco e 5 de Campos.

Essas contagens demonstram cobertura documental, não implementação executável.

Uma segunda leitura ao fim da auditoria detectou dez arquivos alterados no Drive durante o trabalho. O snapshot final foi baixado novamente e essas mudanças foram incorporadas: correções do nome `convites_time`, persistência central de `Idempotency-Key`, uma nova tabela DBML e a reauditoria das 68 rotas.

Uma terceira leitura final encontrou os mesmos 188 arquivos, sem adição, remoção ou diferença de hash em relação ao snapshot reconciliado.

### Camadas verificadas

A reconciliação não se limitou à API. Foram considerados:

- `CampoLivre.md` e `Checkpoint-da-Documentacao.md`;
- `01-Produto/Visao-do-Produto.md`, `Atores.md`, `Escopo-do-MVP.md`, `Monetizacao.md` e `Glossario.md`;
- `02-Dominios/Mapa-de-Dominios.md`;
- inventários e UCs de `03-Casos-de-Uso/`, com ênfase em Identidade, Times e Campos;
- regras de `04-Regras-de-Negocio/`;
- `05-Modelo-de-Dados/Modelo-de-Dominio.md`, `Modelo-Relacional.md` e `CampoLivre.dbml`;
- catálogo, resumo, convenções e validação bottom-up de `06-API/`;
- decisões e auditorias de `07-Arquitetura/`;
- matriz e pendências de `08-Rastreabilidade/`;
- processo de engenharia de `09-Processo/`.

## Registro de decisões e autoridade

### Fatos verificados no Drive vigente

- Cadastro e autenticação pertencem a uma conta pessoal; Prefeitura é instituição sem credencial própria.
- Login usa somente e-mail e senha.
- Login Google, 2FA e reautenticação específica para operações críticas ficam fora do MVP documentado.
- Conta menor fica sem autenticação e perfil público até confirmar o próprio e-mail e obter consentimento aprovado.
- Depois de ativado, o menor recebe a mesma projeção pública do adulto.
- Nome de usuário é imutável e identifica a URL pública.
- Perfil esportivo é público no MVP; privacidade configurável fica pós-MVP.
- Logout encerra somente a sessão atual; troca/recuperação de senha e bloqueio revogam todas.
- Painel de organizador pode ser habilitado por conta ativa, mas não concede autoridade sobre campeonato algum.
- Capitão é papel contextual de um vínculo com time; funcionário de Prefeitura depende de vínculo institucional; administrador é autoridade global.
- Visitantes consultam conteúdo esportivo e campos definidos como públicos sem autenticação.
- A arquitetura prevê frontend web e backend no mesmo domínio em produção, com HTTPS obrigatório e Cloudflare na borda.
- Times e Campos já possuem contratos documentais próprios; Campeonatos, Partidas, Perfis/Leaderboards e Monetização ainda não possuem rotas materializadas no catálogo atual.

### Regras canônicas que substituem declarações anteriores de conversa

- Cadastro é de conta pessoal; jogador, capitão, organizador, funcionário de Prefeitura e administrador são capacidades ou vínculos posteriores conforme cada domínio.
- A conta recém-criada não recebe vínculo de negócio automaticamente.
- CPF e RG são obrigatórios, privados, normalizados e únicos nos limites definidos pelo modelo vigente.
- O login continua exclusivamente por e-mail e senha; CPF e RG não são credenciais.
- Menor de 18 anos segue o fluxo de consentimento do responsável e, depois de ativado, recebe a projeção pública documentada.
- O Drive não proíbe atualmente o menor de atuar em Prefeitura nem declara que essa é sua única restrição. O frontend não deve criar essa vedação por conta própria.
- O Drive não declara uma idade mínima adicional além da distinção entre adulto e menor. O frontend não deve inventar um corte etário.
- Perfil esportivo e idade calculada permanecem públicos no MVP; privacidade configurável fica pós-MVP.

### Decisões técnicas desta primeira fatia

- Integrar primeiro o cliente web; mobile fica fora da fatia inicial.
- Access token permanece somente em memória.
- Refresh token web permanece em cookie `HttpOnly`; JavaScript não o lê nem o persiste.
- Conta autenticada sem vínculos começa em `/minha-area`.
- Mocks devem implementar a mesma interface dos adapters reais, sem participar do caminho de produção.

Essas decisões técnicas podem ser revistas se a implantação do backend exigir BFF, domínio ou política de cookie diferente.

## Limites, contradições e pendências explícitas

A implementação não deve inventar solução para os itens abaixo:

1. O provedor de verificação de identidade, prova de vida e maioridade do responsável ainda não foi escolhido.
2. A validação estrutural e a unicidade do CPF não comprovam sua titularidade. O método de verificação real permanece pendente.
3. A transição da conta quando o menor completa 18 anos ainda precisa de contrato definitivo.
4. A autoridade legal do responsável sobre o menor não é comprovada apenas pela maioridade e identidade do adulto.
5. A implantação deve cumprir a decisão de web e backend no mesmo domínio e fechar CORS de desenvolvimento, proteção CSRF, `SameSite` e escopo dos cookies.
6. Os rate limits finais de login ainda precisam de aprovação; os limites já documentados para recuperação de senha podem ser adotados.
7. Login e `/minha-conta` retornam identidade, administrador e habilitação de organizador, mas não retornam os vínculos necessários para reconstruir `teamIds`, capitanias, campeonatos administrados ou Prefeituras da store mock atual.
8. Não existe no catálogo atual um endpoint agregado de “meus contextos”. Navegação contextual deve aguardar contratos de domínio ou usar consultas específicas documentadas, sem inventar vínculos a partir do login.
9. O cadastro adulto registra apenas `termosAceitos` e data do aceite; não há versão/hash dos Termos nem contrato explícito para apresentação do Aviso de Privacidade. Isso precisa ser fechado antes da produção.
10. O UC de habilitação do organizador chama o ator de “Atleta”, enquanto RN e API exigem somente conta pessoal ativa com e-mail confirmado. Até a fonte ser reconciliada, não exigir vínculo esportivo no frontend sem decisão canônica no Drive.
11. A API exige expiração absoluta da família de refresh em 30 dias, mas o modelo só materializa expiração por linha e não demonstra uma invariante que impeça a rotação de estender a família. O backend precisa fechar e testar essa garantia.
12. A atualização final corrompeu a linha `UC-CMP-003` na matriz: ela foi dividida em duas linhas e recebeu conteúdo de `chaves_idempotencia` pertencente a outros UCs. A matriz não pode ser considerada estruturalmente íntegra até essa linha ser reparada.
13. Cadastro pessoal, criação de time e edição de perfil usam o catálogo interno publicado em `GET /municipios`; o frontend envia o UUID opaco selecionado e não substitui esse identificador por código IBGE.

As demais pendências não bloqueiam login, refresh, logout, consulta ou atualização da própria conta. O catálogo interno de municípios removeu o bloqueio de seleção de `municipioId`. Provedor e autoridade legal ainda delimitam a homologação externa do fluxo de menor, embora o frontend já represente e envie o contrato publicado.

### Resíduos do Drive que não devem orientar implementação nova

A pasta inteira ainda contém contradições históricas. Para esta fatia, prevalecem os documentos específicos e inventários atuais do próprio Drive:

- `03-Casos-de-Uso/Campos-e-Reservas/` e `04-Regras-de-Negocio/Campos-e-Reservas.md` são resíduos do escopo antigo; reservas e agenda oficial são externas à Prefeitura.
- `03-Casos-de-Uso/Gamificacao-e-Talentos/` e `04-Regras-de-Negocio/Gamificacao-e-Talentos.md` são resíduos; o MVP usa Perfis e Leaderboards sem conquistas.
- `Atores.md` ainda menciona conquistas, em conflito com `Escopo-do-MVP.md` e Perfis e Leaderboards.
- `Mapa-de-Dominios.md` ainda menciona publicidade local administrada internamente, em conflito com AdSense no MVP e campanhas próprias pós-MVP.
- checkpoints históricos conservam contagens antigas; as contagens mecânicas do inventário vigente não devem ser substituídas por esses números.
- `Modelo-Relacional.md` ainda anuncia 32 tabelas e “exatamente 13” no bloco inicial, embora o DBML tenha 34 e o próprio bloco contenha `consentimentos_responsavel` e `chaves_idempotencia`.
- frontmatter `em-definicao` em API e regras convive com validações bottom-up que declaram blocos aprovados; tratar o contrato como documentalmente validado, não implementado.

## Estado atual observado no frontend

| Rota web                     | Estado frontend                                                               |
| ---------------------------- | ----------------------------------------------------------------------------- |
| `/login`                     | login por e-mail e senha, mensagem neutra e retorno interno seguro            |
| `/cadastro`                  | cadastro adulto com seleção pelo catálogo interno de municípios               |
| `/confirmar-email`           | consome token uma vez e o remove da URL                                       |
| `/recuperar-senha`           | solicitação com resposta pública neutra                                       |
| `/redefinir-senha`           | redefine por token e exige novo login                                         |
| `/minha-area`                | destino privado neutro para conta sem vínculos                                |
| `/minha-conta`               | projeção privada e acesso às ações de segurança                               |
| `/minha-conta/seguranca`     | alteração autenticada de senha e encerramento da sessão local                 |
| `/minha-conta/alterar-email` | solicita o novo endereço sem substituir imediatamente o atual                 |
| `/confirmar-alteracao-email` | confirma a troca por token removido da URL                                    |
| `/reativar-conta`            | reativa no prazo, com credenciais e confirmação, sem criar sessão automática  |
| `/solicitar-reativacao`      | solicita link com resposta neutra, sem revelar elegibilidade                  |
| `/confirmar-reativacao`      | confirma por token de uso único, removido imediatamente da URL                |

A identidade de protótipo existe somente em memória e é perdida em uma recarga completa. Access token, refresh token e credenciais de sessão não são persistidos em `localStorage` ou `sessionStorage`. Produção seleciona obrigatoriamente o adapter HTTP; o protótipo é apenas infraestrutura de demonstração e E2E, não evidência de autenticação, autorização ou persistência real.

Projeções fictícias de outros domínios (`teamIds`, capitanias, campeonatos organizados e vínculos institucionais) só podem existir em uma sessão explicitamente marcada como protótipo. Nenhum desses vínculos é retornado por `POST /login` ou `GET /minha-conta`; portanto, eles não podem ser promovidos a dados reais de sessão sem uma fonte de API correspondente.

## Impactos dos demais domínios na sessão e navegação

A autenticação prova a identidade e fornece capacidades globais mínimas. Autorizações operacionais pertencem aos respectivos domínios.

| Contexto da interface     | Fonte documental da autorização                                      | Implicação para o frontend                                  |
| ------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------- |
| Visitante                 | projeções públicas de Times, Campos, Campeonatos, Partidas e Perfis  | não exigir login para leitura pública aprovada              |
| Conta pessoal             | sessão ativa e `GET /minha-conta`                                    | apresentar `/minha-area` mesmo sem vínculo algum            |
| Atleta                    | vínculo ativo em `membros_time` ou participação esportiva contextual | não inferir apenas porque a pessoa possui conta             |
| Capitão                   | único vínculo `CAPITAO` ativo no time                                | proteger ações por time; contexto global `atleta` não basta |
| Organizador habilitado    | `organizadorHabilitado` permite acessar o painel                     | habilitação não concede acesso a campeonato de terceiros    |
| Organizador de campeonato | vínculo ativo em `organizadores_campeonato`                          | autorização sempre contextual ao campeonato                 |
| Funcionário de Prefeitura | vínculo institucional ativo                                          | aplicar a elegibilidade documentada no fluxo institucional  |
| Responsável da Prefeitura | vínculo `RESPONSAVEL/ATIVO` único                                    | somente ele administra vínculos e campos municipais         |
| Administrador             | função global `administrador`                                        | autoridade global separada dos demais contextos             |

Benefício gratuito, isenção, crédito e pagamento são situação comercial da conta, não papel ou autorização global. Notificações, convites e vínculos também pertencem aos módulos de domínio e não à store de sessão.

### Deep links e autorização

- visitante em rota privada pode ter somente um destino interno seguro preservado e deve ser encaminhado ao login;
- depois do login, o destino deve ser revalidado; URL externa, esquema arbitrário e open redirect são proibidos;
- autenticado sem vínculo recebe estado de permissão negada ou volta à área neutra conforme a rota;
- papel em outro time, campeonato ou Prefeitura não autoriza o recurso atual;
- administrador global não recebe bypass automático sobre times, campeonatos ou partidas;
- convite por link pode preservar o destino durante o login, mas token de convite não autentica a conta e aceite/recusa só ocorrem para o destinatário autenticado.

### Idempotência

O cliente deve enviar `Idempotency-Key` somente nas operações em que o catálogo o exige. Ao repetir a mesma intenção após timeout ou falha de transporte, deve reutilizar a mesma chave e o mesmo payload; uma nova intenção recebe nova chave. Reutilizar uma chave com payload diferente deve tratar `409 IDEMPOTENCY_KEY_REUTILIZADA` como conflito, não como erro temporário a repetir.

No catálogo atual, isso se aplica a cinco operações: criação de Prefeitura, convite e reenvio institucional, convite e reenvio de time. Nenhuma delas integra a primeira fatia de autenticação, mas o `cliente-api` não pode assumir que todo `POST` é livremente repetível.

### Times e Elenco

O Drive agora documenta 20 rotas de Times. Para a navegação autenticada, são especialmente relevantes:

- `GET /api/v1/minha-conta/convites-time` para o painel de convites;
- aceite e recusa nominal pelo token do destinatário;
- criação de time tornando o criador capitão atomicamente;
- capitania e demais permissões sempre vinculadas ao `timeId`;
- elenco e detalhes do time são projeções públicas;
- busca de atleta para convite usa somente e-mail exato e não expõe CPF ou RG.

A primeira autenticação não deve implementar esses fluxos, mas o modelo de sessão não pode contrariá-los.

### Campos e Prefeitura

O Drive agora documenta cinco rotas de Campos:

- consulta e listagem são públicas;
- cadastro, edição e alteração do estado operacional exigem vínculo `RESPONSAVEL/ATIVO` na Prefeitura proprietária;
- município do campo deriva da Prefeitura e não é escolhido no payload operacional;
- reservas, disponibilidade e agenda oficial permanecem fora do CampoLivre.

Esconder menus não substitui autorização. Deep links e chamadas diretas precisam ser recusados pelo backend quando o vínculo contextual exigido não existir ou estiver inapto; o frontend não acrescenta bloqueio etário que o Drive não definiu.

### Fronteira pública e privada

Uma pessoa autenticada deve reutilizar as mesmas páginas públicas canônicas, recebendo apenas ações contextuais adicionais quando autorizada. Não criar versões “logadas” duplicadas dos recursos.

| Recurso            | Projeção pública                                                      | Projeção privada ou contextual                                                                             |
| ------------------ | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Time               | identidade, descrição, elenco permitido e fatos esportivos publicados | convites, mutações, motivos e histórico administrativo                                                     |
| Campo              | allowlist cadastral, município/UF e estado informado                  | cadastro, atualização, estado e auditoria institucional                                                    |
| Campeonato         | publicação após início e histórico público aplicável                  | rascunho, configuração e cancelamento pré-início                                                           |
| Partida            | agenda, estado, resultado e fatos publicados                          | preparação da súmula, justificativas restritas e PDF oficial autorizado                                    |
| Perfil/leaderboard | perfil esportivo, idade calculada, históricos e rankings              | CPF, e-mail, telefone, data completa de nascimento e dados do responsável nunca entram na projeção pública |
| Monetização        | AdSense não bloqueante                                                | benefício, checkout e histórico financeiro da própria conta                                                |

### Campeonatos, Partidas, Perfis e Monetização

Esses domínios possuem UCs, regras, modelo e rastreabilidade, mas ainda não possuem contratos de rota materializados no catálogo vivo. Portanto:

- manter as telas atuais em adapters mock explicitamente separados;
- não inventar DTOs ou endpoints a partir dos formulários existentes;
- não usar a store de autenticação como banco local desses domínios;
- não promover mocks a integração até os respectivos gates bottom-up e contratos serem publicados.

## Rotas web necessárias

### Existentes, a integrar

- `/login`;
- `/cadastro`;
- `/recuperar-senha`;
- `/minha-area`.

### A criar quando a respectiva fatia for implementada

- `/confirmar-email?token=...`;
- `/redefinir-senha?token=...`;
- `/cadastro/status`;
- `/cadastro/responsavel`;
- `/cadastro/responsavel/verificacao`;
- `/revogar-consentimento?token=...`;
- `/minha-conta/seguranca`.

Tokens recebidos por URL devem ser consumidos uma única vez e removidos da URL visível com `router.replace` após a captura. Não registrar tokens em logs, analytics ou mensagens de erro.

## Cadastro pessoal único

### Campos da interface

| Campo                    | Obrigatório | Enviado à API | Observação                                       |
| ------------------------ | ----------: | ------------: | ------------------------------------------------ |
| Nome completo            |         sim |           sim | `nome`                                           |
| Nome de usuário          |         sim |           sim | imutável após o cadastro                         |
| E-mail                   |         sim |           sim | normalização definitiva ocorre no backend        |
| Telefone                 |         não |           sim | enviar `null` quando ausente                     |
| CPF                      |         sim |           sim | privado; não usar como login                     |
| Número do RG             |         sim |           sim | `rgNumero`; privado e imutável                   |
| Órgão expedidor do RG    |         sim |           sim | `rgOrgaoExpedidor`; normalizado pelo backend     |
| UF do RG                 |         sim |           sim | `rgUf`                                           |
| Data de nascimento       |         sim |           sim | determina o fluxo adulto ou menor no backend     |
| Município                |         sim |           sim | enviar `municipioId`, não texto livre            |
| Senha                    |         sim |           sim | política validada novamente no backend           |
| Confirmar senha          |         sim |           não | validação exclusiva da interface                 |
| Aceite dos Termos        |         sim |           sim | enviar `termosAceitos: true`                     |
| Tipo jogador/organizador |  não existe |           não | papéis/capacidades são adquiridos posteriormente |

### Endpoint

```http
POST /api/v1/cadastros
```

Payload vigente no Drive:

```json
{
  "nome": "string",
  "nomeUsuario": "string",
  "email": "string",
  "telefone": null,
  "cpf": "string",
  "rgNumero": "string",
  "rgOrgaoExpedidor": "string",
  "rgUf": "string",
  "dataNascimento": "YYYY-MM-DD",
  "municipioId": "uuid",
  "senha": "string",
  "termosAceitos": true
}
```

O frontend pode validar formato para resposta imediata, mas o backend continua responsável por elegibilidade, CPF, RG, idade, unicidade, política de senha, município e aceite.

### Resultado e navegação

Resposta executável no backend `8de1105a`:

```json
{
  "cadastroId": "uuid",
  "status": "PENDENTE_CONFIRMACAO | AGUARDANDO_CONSENTIMENTO",
  "proximaAcao": "CONFIRMAR_EMAIL"
}
```

Adultos e menores confirmam primeiro o próprio e-mail. O cadastro nunca retorna token ou outra credencial de continuidade. No caso de menor, `AGUARDANDO_CONSENTIMENTO` descreve o estado da conta, mas `proximaAcao` continua sendo `CONFIRMAR_EMAIL`.

Não determinar no frontend se o usuário é adulto ou menor como fonte de verdade. A interface pode adaptar o texto com base na data informada, mas deve obedecer ao estado retornado pelo backend.

### Erros mínimos

- `DADOS_INVALIDOS`: associar erros aos campos quando `erros` estiver presente;
- `MUNICIPIO_NAO_ENCONTRADO` ou `MUNICIPIO_INATIVO`: solicitar nova seleção;
- `EMAIL_INDISPONIVEL`: informar indisponibilidade sem sugerir dados da conta existente;
- `NOME_USUARIO_INDISPONIVEL`: pedir outro nome;
- `CPF_INDISPONIVEL`: informar que o CPF não pode ser utilizado e oferecer canal de suporte;
- `RG_INDISPONIVEL`: informar que o RG não pode ser utilizado e oferecer canal de suporte, sem revelar outra conta;
- `TERMOS_NAO_ACEITOS`: manter o formulário e destacar o aceite;
- `LIMITE_EXCEDIDO`: respeitar `Retry-After` e impedir reenvio durante o período.

No backend `8de1105a`, o throttler emite `Retry-After-public`, mas esse header não está exposto pelo CORS e o cliente HTTP atual não devolve headers aos adapters. Até isso ser reconciliado, a interface informa a espera sem inventar contagem regressiva.

## Confirmação de e-mail

### Confirmar

```http
POST /api/v1/confirmacoes-email
```

```json
{
  "token": "token-recebido-na-url"
}
```

Estados da tela:

- enviando;
- confirmado e conta ativa;
- confirmado, mas aguardando responsável;
- token inválido;
- token expirado;
- token já utilizado;
- limite excedido.

### Reenviar

```http
POST /api/v1/confirmacoes-email/reenvios
```

Entrada:

```json
{ "email": "string" }
```

A resposta neutra `{ "envioAceito": true }` deve produzir a mesma mensagem visual independentemente da existência ou elegibilidade da conta. O frontend não recebe, persiste nem reenvia `cadastroToken`.

## Consentimento do responsável

O fluxo é aplicável quando a confirmação do e-mail retornar `statusConta: "AGUARDANDO_CONSENTIMENTO"` e `consentimentoResponsavelNecessario: true`. Essa confirmação estabelece um cookie web `HttpOnly`, curto e restrito às rotas de consentimento; não cria sessão normal.

### Dados solicitados

- nome completo do responsável;
- CPF;
- data de nascimento;
- e-mail;
- relação com o menor;
- declaração de responsabilidade legal;
- senha de revogação e confirmação local;
- aceite do termo específico, que deve destacar a exposição pública integral do perfil do menor.

### Contratos

```http
POST /api/v1/consentimentos-responsavel
GET /api/v1/consentimentos-responsavel/parental/{token}
POST /api/v1/consentimentos-responsavel/parental/{token}/documentos
```

No commit backend `8de1105a`, somente o primeiro contrato acima está registrado em controller. A consulta do link parental e o upload documental permanecem canônicos, mas ainda não executáveis.

O endpoint interno de decisão nunca é chamado pelo navegador:

```http
POST /api/v1/integracoes/telegram/revisoes
```

O frontend ainda não deve publicar o formulário real de consentimento porque:

- a API aceita `termoVersao` declarada pelo navegador sem conferir um termo vigente controlado pelo servidor;
- o cookie de continuidade é limpo inclusive em respostas `400` e `422`, deixando a tentativa sem recuperação apesar de o token persistido continuar não consumido;
- o link parental enviado por e-mail não possui rota executável de consulta ou upload e não pode ser reenviado.

Até esses contratos serem completados:

- tipos e interfaces podem ser preparados;
- testes podem usar o adapter de protótipo explicitamente injetado;
- a interface pode representar estados pendentes;
- não apresentar a verificação como funcional em ambiente real;
- não simular aprovação em produção;
- não armazenar o documento no frontend além do tempo necessário ao upload.

O Drive vigente não define uma vedação etária específica para convites, funções ou vínculos de Prefeitura. O frontend deve aplicar somente os estados de conta e critérios de elegibilidade retornados pelas APIs, sem bloquear menores por regra local inventada.

## Login

### Endpoint

```http
POST /api/v1/login
```

```json
{
  "email": "string",
  "senha": "string",
  "plataforma": "WEB"
}
```

### Sucesso

Resposta web canônica:

```json
{
  "accessToken": "string",
  "tokenTipo": "Bearer",
  "accessTokenExpiraEm": "date-time",
  "refreshToken": null,
  "refreshTokenExpiraEm": "date-time",
  "usuario": {
    "id": "uuid",
    "nome": "string",
    "nomeUsuario": "string",
    "administrador": false,
    "organizadorHabilitado": false
  }
}
```

- guardar `accessToken` somente em memória;
- nunca persistir access ou refresh token em `localStorage` ou `sessionStorage`;
- considerar o refresh token recebido exclusivamente pelo cookie `HttpOnly`;
- carregar ou reconciliar a projeção privada da conta;
- redirecionar para `/minha-area` quando não houver contexto ativo;
- não inventar papel com base na tela utilizada para entrar.

### Erros

| Código                  | Tratamento visual                                                          |
| ----------------------- | -------------------------------------------------------------------------- |
| `CREDENCIAIS_INVALIDAS` | “E-mail ou senha inválidos.”                                               |
| `EMAIL_NAO_CONFIRMADO`  | explicar confirmação e oferecer reenvio sem expor tokens                   |
| `CONTA_INAPTA`          | informar que a conta não pode acessar e orientar o próximo passo permitido |
| `LIMITE_EXCEDIDO`       | informar espera temporária e respeitar `Retry-After`                       |
| falha de rede/servidor  | mensagem de indisponibilidade sem afirmar erro de credencial               |

A mensagem de credenciais deve permanecer neutra. Não distinguir e-mail inexistente de senha incorreta.

## Sessão web

### Estratégia

- access token com duração documentada de 15 minutos, somente em memória;
- refresh token rotativo com expiração absoluta documentada de 30 dias;
- refresh em cookie `HttpOnly`, `Secure` em staging/produção e `SameSite` compatível com a implantação;
- requisições de autenticação e renovação devem usar `credentials: 'include'`;
- até cinco sessões simultâneas por conta; a sexta revoga a ativa mais antiga;
- access token identifica a sessão por `sessionId`; cada operação autenticada revalida a revogação, de modo que logout e revogações tenham efeito imediato;
- o frontend não lê, copia ou registra o refresh token.

### Inicialização da aplicação

Ao iniciar ou recarregar:

1. marcar a sessão como `carregando`;
2. chamar `POST /api/v1/login/renovacoes` com corpo vazio e credenciais incluídas;
3. em sucesso, guardar o novo access token em memória e consultar `/api/v1/minha-conta`;
4. em `RENOVACAO_INVALIDA` ou `RENOVACAO_EXPIRADA`, assumir visitante;
5. em `REUTILIZACAO_DETECTADA`, limpar o estado local, informar encerramento de segurança e exigir novo login;
6. nunca renderizar brevemente uma área privada antes de concluir a inicialização.

Resposta web canônica da renovação:

```json
{
  "accessToken": "string",
  "tokenTipo": "Bearer",
  "accessTokenExpiraEm": "date-time",
  "refreshToken": null,
  "refreshTokenExpiraEm": "date-time"
}
```

### Renovação durante o uso

- renovar uma vez antes da expiração ou após um único `401` autenticado;
- deduplicar renovações concorrentes para impedir múltiplos usos do mesmo refresh token;
- repetir a requisição original apenas uma vez após renovação bem-sucedida;
- reconciliar novamente `/minha-conta` após refresh quando o shell depender de `administrador` ou `organizadorHabilitado`, pois a resposta de renovação não devolve a projeção privada;
- não criar loop de refresh;
- `403` de autorização não dispara renovação automática.

### Logout

```http
POST /api/v1/logout
```

- encerrar somente a sessão atual;
- tratar `204` como sucesso;
- limpar access token, conta e capacidades localmente mesmo se a sessão já estiver expirada;
- redirecionar para `/login`;
- não afetar outras sessões da conta;
- o backend deve expirar o cookie.

## Recuperação de senha

### Solicitar

```http
POST /api/v1/recuperacao-senha
```

```json
{
  "email": "string"
}
```

A mensagem de sucesso deve ser neutra:

> Se existir uma conta elegível para esse e-mail, enviaremos as instruções de recuperação.

Não afirmar “enviamos” como certeza, pois isso permite inferir cadastro e falhas operacionais.

### Confirmar

```http
POST /api/v1/recuperacao-senha/confirmacoes
```

```json
{
  "token": "string",
  "novaSenha": "string"
}
```

- token de uso único válido por 30 minutos;
- nova solicitação invalida tokens anteriores;
- sucesso revoga todas as sessões;
- redirecionar ao login com confirmação de senha alterada;
- nunca autenticar automaticamente após redefinição.

## Minha conta e capacidades

### Consulta

```http
GET /api/v1/minha-conta
Authorization: Bearer ***
```

Esta rota está registrada no backend `dbf3606` e foi verificada em execução real após login e renovação. O store continua dependendo dela para montar a sessão; o frontend não deve fabricar e-mail, município, documentos ou demais campos privados a partir do resumo mínimo de `login.usuario`. CPF, campos de RG, data de nascimento, idade e município são nullable na projeção publicada e devem ser tratados como ausentes sem quebrar a sessão ou a tela privada.

Em implantação cross-origin, login, refresh, confirmação de menor e consentimento também dependem de `CORS_CREDENTIALS=true` e origem explicitamente autorizada. O `.env.example` do backend mantém essa opção desativada; deve-se configurar CORS ou fornecer proxy same-origin, além de definir `NEXT_PUBLIC_API_URL` quando a API não estiver sob `/api/v1` na mesma origem.

A projeção privada abastece nome, nome de usuário, e-mail, telefone, CPF, RG, data de nascimento, município, perfil e apenas os indicadores globais `administrador` e `organizadorHabilitado`. Ela não agrega vínculos contextuais.

CPF e RG pertencem somente à projeção privada do titular. O frontend deve modelá-los conforme o contrato de `/minha-conta`, impedir sua entrada em projeções públicas e evitar logs, analytics e fixtures com documentos reais.

### CPF

- nunca exibir CPF em perfil público;
- na área privada, exibir mascarado por padrão;
- não registrar CPF em logs, analytics, monitoramento de erros ou fixtures versionadas;
- não usar CPF como credencial;
- não afirmar “identidade verificada” enquanto apenas formato e unicidade forem comprovados.

### Papéis e navegação

- ausência de capacidades leva a `/minha-area`;
- vínculo esportivo pode habilitar a experiência de atleta;
- `POST /api/v1/minha-conta/organizador` habilita organizador posteriormente;
- atleta e organizador podem coexistir;
- contexto ativo é preferência de navegação, não autorização;
- autorização real deriva de vínculos e capacidades consultados nas APIs proprietárias; login e `/minha-conta` não retornam todos os contextos;
- elegibilidade institucional segue as regras e respostas vigentes das APIs de Prefeitura; idade não é bloqueio local no contrato atual.

## Camada de integração recomendada

Evitar `fetch` em componentes. A integração deve concentrar transporte, serialização e erros.

Estrutura inicial sugerida, criada apenas conforme uso real:

```text
src/services/api/cliente-api.ts
src/services/api/problem-details.ts
src/services/autenticacao/autenticacao-api.ts
src/services/autenticacao/sessao-api.ts
src/types/api/autenticacao.ts
src/stores/sessao.tsx
```

Responsabilidades:

- `cliente-api.ts`: URL base, headers, `credentials`, Bearer token, Problem Details e repetição única após refresh;
- `autenticacao-api.ts`: cadastro, confirmação, login e recuperação;
- `sessao-api.ts`: refresh, logout e minha conta;
- `sessao.tsx`: estado em memória e transições; não deve conter mocks ou regras de transporte;
- componentes: formulário, feedback e navegação, sem conhecer detalhes do cookie.

Enquanto um endpoint ainda não existir, o adapter mock deve implementar a mesma interface do adapter real e permanecer explicitamente separado, por exemplo `autenticacao-api.mock.ts`. Não usar condicionais de mock espalhadas nas telas.

## Estado da sessão no frontend

Modelo conceitual mínimo:

```ts
type EstadoSessao =
  | { estado: 'carregando' }
  | { estado: 'visitante' }
  | {
      estado: 'autenticado';
      accessToken: string;
      accessTokenExpiraEm: string;
      usuario: UsuarioDaSessao;
      capacidadesGlobais: {
        administrador: boolean;
        organizadorHabilitado: boolean;
      };
      contextoAtivo: ContextoAtivo | null;
      estadoContextos: 'nao-carregado' | 'carregando' | 'carregado' | 'erro';
    };
```

`ContextoAtivo` referencia uma seleção de navegação já carregada por API de domínio; não replica todos os vínculos dentro da sessão. Enquanto `estadoContextos` não for `carregado`, nenhuma permissão contextual deve ser presumida.

Estados de formulário devem ser independentes:

```text
ocioso → enviando → sucesso
                 ↘ erro de validação
                 ↘ erro de negócio
                 ↘ erro temporário
```

Não representar “hidratado” como sinônimo de autenticado.

## Problem Details

A API segue RFC 9457 e pode retornar:

```ts
type ProblemDetails = {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  codigo?: string;
  erros?: Array<{
    campo?: string;
    mensagem: string;
  }>;
};
```

Regras da interface:

- mapear `erros` aos campos quando possível;
- usar `codigo` para comportamento, nunca comparar `detail`;
- apresentar uma mensagem geral quando não houver campo;
- não mostrar stack trace, resposta bruta ou identificadores internos;
- preservar foco, `aria-live` e associação entre campo e mensagem;
- tratar `429` com bloqueio temporário do botão e contagem baseada em `Retry-After`.

## Critérios de aceite da primeira fatia

### Gate antes de implementar

Pode começar contra uma interface de serviço e adapter mock fiel ao contrato:

- login por e-mail e senha;
- inicialização e renovação da sessão web;
- logout;
- recuperação de senha;
- consulta privada da própria conta, incluindo RG somente na projeção privada documentada;
- estados visuais, Problem Details e proteção de rotas.

Não pode ser considerado integrado ao backend real enquanto os endpoints não existirem e forem exercitados.

O cadastro adulto pode seguir o contrato vigente com CPF e RG. O fluxo real de menor possui bloqueios adicionais: provedor de verificação e comprovação de autoridade legal do responsável. É permitido preparar interfaces e estados no modo protótipo explicitamente identificado; é proibido simular aprovação em produção ou declarar o fluxo concluído.

### Login e sessão

- [ ] Login envia e-mail, senha e `plataforma: 'WEB'`.
- [ ] Senha incorreta e e-mail inexistente exibem a mesma mensagem.
- [ ] Access token existe apenas em memória.
- [ ] Refresh token não aparece em JavaScript nem em armazenamento web.
- [ ] Recarregar a página recupera uma sessão válida pelo cookie.
- [ ] Renovações concorrentes são deduplicadas.
- [ ] Refresh reutilizado encerra a sessão local e exige login.
- [ ] Logout ou revogação invalida imediatamente chamadas com o access token da sessão revogada.
- [ ] Renovação reconcilia os indicadores globais exibidos no shell.
- [ ] Logout é idempotente e limpa o estado local.
- [ ] Área privada não pisca antes da inicialização da sessão.
- [ ] Conta sem capacidade cai em `/minha-area`.

### Cadastro

- [ ] Cadastro é pessoal e não pergunta “jogador ou organizador”.
- [ ] Número, órgão expedidor e UF do RG são obrigatórios e enviados conforme o contrato vigente.
- [ ] CPF e data de nascimento são obrigatórios.
- [ ] Município usa identificador da API.
- [ ] Confirmação da senha não é enviada.
- [ ] Conta adulta segue para confirmação de e-mail.
- [ ] Conta menor segue para consentimento do responsável.
- [ ] Cadastro não autentica automaticamente.

### Recuperação

- [ ] Solicitação usa mensagem neutra.
- [ ] Token expirado, inválido e utilizado possuem estados próprios sem expor detalhes.
- [ ] Redefinição bem-sucedida exige novo login.

### Segurança e privacidade

- [ ] CPF não aparece em perfil público, logs ou fixtures.
- [ ] Nenhum token de autenticação é persistido em `localStorage` ou `sessionStorage`.
- [ ] O frontend não cria bloqueio etário institucional que não exista no Drive; autorização de Prefeitura continua contextual e validada pelo backend.
- [ ] O backend continua sendo testado como autoridade; esconder controles não é considerado autorização.

## Estratégia de implementação e testes

Implementar em fatias verticais com teste antes do código:

1. login válido e inválido;
2. recuperação da sessão ao recarregar;
3. refresh e deduplicação;
4. logout;
5. consulta da própria conta;
6. recuperação de senha;
7. cadastro adulto;
8. confirmação de e-mail;
9. cadastro de menor e consentimento, após escolha do provedor.

Testes esperados:

- testes direcionados de serviços e estado de sessão quando a infraestrutura de testes unitários for adicionada;
- Playwright para fluxos visíveis e redirecionamentos;
- adapter de protótipo controlável para estados e Problem Details;
- integração real com API e PostgreSQL antes de considerar a fatia concluída.

## Fora do escopo desta primeira documentação

- implementação do backend;
- escolha do provedor de identidade;
- aplicativo mobile;
- papéis detalhados de times, campeonatos e Prefeitura;
- integração das 20 rotas de Times e das 5 rotas de Campos já documentadas;
- privacidade configurável de perfil pós-MVP;
- todas as demais rotas de Identidade e Acesso que não participam da primeira fatia.
- ciclo completo da conta: desativação, carência, reativação, eliminação, bloqueio administrativo e gestão de sessões.

## Definição de pronto

A primeira integração de autenticação só está pronta quando:

1. os contratos usados coincidirem com a API implementada;
2. mocks não participarem do caminho de produção;
3. login, refresh, logout e minha conta funcionarem contra o backend real;
4. estados de loading, erro, sucesso e sessão expirada estiverem cobertos;
5. tokens não forem persistidos de forma insegura;
6. testes direcionados e E2E da fatia passarem;
7. `npm run check` passar;
8. a documentação for atualizada se qualquer contrato mudar.
