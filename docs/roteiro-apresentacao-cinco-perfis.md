# Roteiro de demonstração — cinco perfis do CampoLivre

## Objetivo

Demonstrar, em aproximadamente **13 minutos**, que o CampoLivre atende pessoas com vínculos diferentes sem atribuir permissões automaticamente. O mesmo login sempre termina em **Minha área**, onde a pessoa escolhe explicitamente o contexto em que deseja atuar.

> **Aviso para a apresentação:** esta demonstração utiliza o modo protótipo, com dados simulados mantidos em memória. A interface representa os fluxos do produto; não deve ser apresentada como persistência definitiva no backend.

## Contas

Todas utilizam a senha `senha-mock`.

| Ordem | Persona           | Conta                         | Ideia principal                                      |
| ----- | ----------------- | ----------------------------- | ---------------------------------------------------- |
| 1     | Lucas Ferreira    | `sem-time@campolivre.test`    | Conta válida sem vínculo ou papel automático         |
| 2     | Diego Souza       | `atleta@campolivre.test`      | Atleta vinculado a um time                           |
| 3     | Juliana Lopes     | `colaborador@campolivre.test` | Organizadora sem vínculo esportivo                   |
| 4     | Marcos Oliveira   | `pessoa@campolivre.test`      | Uma pessoa com papéis acumulados                     |
| 5     | Gestora Municipal | `prefeitura@campolivre.test`  | Gestão institucional e habilitação como organizadora |

---

# Roteiro principal

## 0. Abertura — 40 segundos

### Tela

Página inicial ou tela de login.

### Fala sugerida

> “O CampoLivre foi pensado para organizar e dar visibilidade ao futebol municipal. Em vez de criar sistemas separados para cada público, ele trabalha com uma única conta e diferentes vínculos. Vou demonstrar isso por meio de cinco pessoas: uma conta sem vínculo, um atleta, uma organizadora, uma pessoa com papéis acumulados e uma gestora municipal.”

> “Todos os logins terminam primeiro em Minha área. O sistema não escolhe um papel silenciosamente; a própria pessoa seleciona o contexto em que deseja atuar.”

---

## 1. Lucas Ferreira — primeiro acesso sem vínculo — 1 minuto e 30 segundos

### Login

- E-mail: `sem-time@campolivre.test`
- Senha: `senha-mock`

### Cliques

1. Entrar.
2. Permanecer em **Minha área**.
3. Apontar o aviso de que Lucas ainda não participa de nenhum time.
4. Mostrar as ações **Entrar em um time**, **Criar um time** e **Ativar painel de organizador**.
5. Não ativar nada neste momento.

### Fala sugerida

> “Lucas representa uma conta recém-criada. Estar autenticado não transforma automaticamente a pessoa em atleta, capitão ou organizador.”

> “Como ele ainda não possui vínculos, o CampoLivre apresenta caminhos de entrada: procurar uma equipe, criar um time ou habilitar a atuação como organizador. Isso mantém a autorização coerente com as relações reais da conta.”

### O que este perfil comprova

- Uma conta pode existir sem papel de negócio.
- O onboarding orienta a próxima ação possível.

### Transição

> “Agora vou entrar com alguém que já possui um vínculo esportivo.”

---

## 2. Diego Souza — atleta — 2 minutos

### Login

- Sair da conta de Lucas.
- E-mail: `atleta@campolivre.test`
- Senha: `senha-mock`

### Cliques

1. Em **Minha área**, clicar em **Entrar como atleta**.
2. Em **Times e convites**, mostrar o vínculo com o **Vila Nova FC**.
3. Abrir o menu e acessar **Perfil**.
4. Mostrar **Suas estatísticas**:
   - 11 partidas;
   - 1 gol.
5. Se houver tempo, abrir **Meus campeonatos** ou **Meus Eventos** pelo menu.

### Fala sugerida

> “Diego já participa do Vila Nova FC, então a área de atleta fica disponível. A entrada principal reúne o time atual, os convites recebidos e a consulta de outras equipes.”

> “No perfil, o atleta consegue editar seus dados públicos e consultar os números esportivos associados à própria identidade. No caso do Diego, o protótipo apresenta 11 partidas e 1 gol.”

> “O vínculo com um time não significa participação automática em todos os campeonatos. O elenco permanente e a inscrição em uma competição são relações diferentes.”

### O que este perfil comprova

- O contexto Atleta depende de vínculo esportivo.
- Times e convites são reunidos em uma entrada única.
- Cada atleta consulta suas próprias estatísticas.
- Time, inscrição no campeonato e escalação da partida são relações distintas.

### Transição

> “O próximo perfil não participa de um time, mas possui autoridade sobre um campeonato.”

---

## 3. Juliana Lopes — organizadora — 2 minutos e 30 segundos

### Login

- Sair da conta de Diego.
- E-mail: `colaborador@campolivre.test`
- Senha: `senha-mock`

### Cliques

1. Em **Minha área**, clicar em **Entrar como organizador**.
2. Mostrar **Meus Campeonatos**.
3. Explicar que a lista contém somente campeonatos vinculados à conta.
4. Abrir o campeonato administrado por Juliana.
5. Percorrer rapidamente as abas:
   - Geral;
   - Participantes;
   - Regulamento;
   - Estrutura;
   - Partidas.
6. Na visão geral, apontar o estado atual e as operações permitidas.
7. Evitar finalizar inscrições durante o ensaio; guardar a mutação para a apresentação, se desejar demonstrá-la.

### Fala sugerida

> “Juliana representa uma organizadora sem vínculo esportivo. Isso mostra que a capacidade de organizar não depende de pertencer a um time.”

> “Em Meus Campeonatos aparecem somente as competições que ela pode administrar. O catálogo público continua separado, porque consultar todos os campeonatos é diferente de possuir autoridade sobre eles.”

> “Dentro do workspace, a organização é dividida entre configuração geral, participantes, regulamento, estrutura e partidas. As operações disponíveis dependem do estado do campeonato e das permissões da pessoa naquele campeonato.”

### Demonstração opcional

No campeonato 4, se o estado estiver **Em inscrições** e sem pendências, clicar em **Finalizar inscrições** e mostrar a mudança para **Aguardando sorteio**.

Fala:

> “A finalização não remove as validações. Ela só ocorre quando a configuração e os participantes satisfazem as regras; depois disso, o campeonato avança para a preparação da estrutura.”

### O que este perfil comprova

- Autoridade contextual por campeonato.
- Separação entre catálogo público e campeonatos administrados.
- Evolução por estados, sem liberar operações apenas pela presença de um botão.

### Transição

> “Até agora vimos papéis separados. O Marcos demonstra o caso em que a mesma pessoa acumula atuações diferentes.”

---

## 4. Marcos Oliveira — atleta, capitão e organizador — 4 minutos

### Login

- Sair da conta de Juliana.
- E-mail: `pessoa@campolivre.test`
- Senha: `senha-mock`

### Parte A — contexto Atleta

#### Cliques

1. Em **Minha área**, apontar os dois contextos disponíveis:
   - Atleta;
   - Organizador.
2. Clicar em **Entrar como atleta**.
3. Em **Times e convites**, mostrar o **Vila Nova FC** e a função de **Capitão**.
4. Pelo menu, abrir **Perfil**.
5. Mostrar:
   - 14 partidas;
   - 7 gols;
   - Copa Franca 2025 — Campeão;
   - Torneio dos Bairros 2024 — Campeão.

#### Fala sugerida

> “Marcos possui mais de uma atuação, mas continua sendo uma única pessoa e uma única conta. Como atleta e capitão, ele acompanha o Vila Nova FC, seus convites e seus dados esportivos.”

> “O perfil reúne os números publicados e os títulos conquistados. Os títulos representam resultados esportivos, e não medalhas ou gamificação.”

### Parte B — troca explícita para Organizador

#### Cliques

1. Abrir o menu e voltar para **Minha área**.
2. Clicar em **Entrar como organizador**.
3. Abrir **Meus Campeonatos**.
4. Entrar na **Copa Demonstração 2026**, campeonato 8.
5. Abrir **Participantes**.
6. Mostrar o Vila Nova FC com:
   - 8 atletas no elenco geral;
   - 7 atletas inscritos na competição;
   - Thiago Cardoso vinculado ao time, mas fora da inscrição do campeonato.
7. Abrir **Estrutura** ou **Chaveamento** e mostrar semifinais e final.
8. Abrir **Partidas** e apontar a entrada para a **Súmula**.
9. Se o tempo permitir, abrir a Súmula sem confirmar definitivamente.

#### Fala sugerida

> “A troca de contexto altera a área de trabalho e as ações apresentadas, mas não troca a conta nem concede uma nova autoridade sobre recursos não vinculados.”

> “Na Copa Demonstração 2026, o Vila Nova possui oito integrantes no elenco geral, mas somente sete estão inscritos. Essa separação é importante porque a Súmula só permite selecionar atletas elegíveis naquela competição.”

> “Depois das inscrições, o organizador prepara a estrutura, agenda as partidas e registra a Súmula. A Súmula reúne escalação, arbitragem, gols, cartões, substituições, relatório e, quando necessário, prorrogação e pênaltis. A confirmação definitiva encerra a partida e avança o vencedor no chaveamento.”

### O que este perfil comprova

- Uma conta pode acumular papéis.
- A troca de contexto é explícita.
- Elenco permanente e inscrição no campeonato são diferentes.
- Chaveamento, partidas e Súmula formam um fluxo operacional conectado.

### Transição

> “Por fim, vou mostrar como o município participa sem ser tratado como uma conta impessoal.”

---

## 5. Gestora Municipal — Prefeitura — 2 minutos e 30 segundos

### Login

- Sair da conta de Marcos.
- E-mail: `prefeitura@campolivre.test`
- Senha: `senha-mock`

### Parte A — contexto Prefeitura

#### Cliques

1. Em **Minha área**, clicar em **Entrar como Prefeitura**.
2. Mostrar o painel de gestão municipal.
3. Abrir **Campos** pelo menu.
4. Explicar o cadastro e a administração dos espaços municipais.

#### Fala sugerida

> “A Prefeitura não é uma conta compartilhada. Esta é uma pessoa identificada, vinculada à Prefeitura de Franca, que recebe o contexto institucional correspondente.”

> “Nesse contexto, ela acompanha recursos municipais, como os campos, sem misturar essas operações com o painel esportivo de atleta ou com a gestão de campeonatos.”

### Parte B — Prefeitura também como organizadora

#### Cliques

1. Voltar para **Minha área**.
2. Clicar em **Ativar painel de organizador**.
3. Entrar no contexto **Organizador**.
4. Abrir **Novo campeonato**.
5. No campo de contexto responsável, selecionar a **Prefeitura de Franca**.
6. Mostrar que o campeonato pode ser criado em nome da instituição.
7. Opcionalmente, preencher e criar um campeonato demonstrativo.

#### Fala sugerida

> “O vínculo com a Prefeitura não concede automaticamente a capacidade de organizar campeonatos. Essa atuação é habilitada por uma ação explícita.”

> “Depois da habilitação, a mesma pessoa mantém os dois contextos: Prefeitura e Organizador. Ao criar um campeonato, ela pode indicar a Prefeitura de Franca como contexto responsável, sem perder a identidade individual que executou a ação.”

### O que este perfil comprova

- Pessoa e instituição são entidades distintas.
- O contexto municipal deriva de vínculo institucional.
- A capacidade de organizadora é habilitada explicitamente.
- Um campeonato pode ser criado em nome da Prefeitura.

---

## 6. Encerramento — 40 segundos

### Fala sugerida

> “Os cinco perfis mostram a ideia central do CampoLivre: as permissões não são rótulos fixos colocados no cadastro. Elas surgem dos vínculos da pessoa com times, campeonatos e instituições.”

> “Lucas mostrou a conta sem vínculo; Diego, a jornada do atleta; Juliana, a gestão contextual de campeonatos; Marcos, o acúmulo e a troca explícita de papéis; e a Gestora Municipal, a separação entre identidade pessoal e atuação institucional.”

> “Com isso, o sistema busca organizar a operação esportiva e tornar campeonatos, partidas, resultados e trajetórias mais visíveis para a comunidade, sem prometer impactos que ainda não foram medidos.”

---

# Versão curta — 7 a 8 minutos

Se a banca reduzir o tempo:

1. **Lucas — 45 s:** mostrar ausência de vínculo e ações de onboarding.
2. **Diego — 1 min:** entrar como atleta, mostrar Vila Nova e estatísticas.
3. **Juliana — 1 min:** mostrar Meus Campeonatos e abas do workspace.
4. **Marcos — 3 min:** mostrar dois contextos, perfil/títulos, participantes 8 × 7, chaveamento e Súmula.
5. **Prefeitura — 1 min e 30 s:** painel municipal, ativação de organizador e formulário de novo campeonato.
6. **Conclusão — 30 s:** vínculos geram capacidades; troca de contexto não troca identidade.

Na versão curta, não preencher formulários e não confirmar operações irreversíveis.

---

# Preparação antes da apresentação

## Iniciar o protótipo

```bash
npm run dev:prototype -- --hostname 127.0.0.1 --port 3001
```

Abrir:

```text
http://127.0.0.1:3001
```

## Checklist técnico

- [ ] Confirmar que a porta 3001 abre antes de sair para a apresentação.
- [ ] Usar zoom do navegador entre 100% e 110%.
- [ ] Fechar abas, notificações e extensões desnecessárias.
- [ ] Manter as cinco contas em uma cola impressa ou em um arquivo local.
- [ ] Confirmar que todas usam `senha-mock`.
- [ ] Reiniciar o servidor antes da apresentação para restaurar o estado inicial.
- [ ] Depois de iniciar a demonstração, não reiniciar o servidor.
- [ ] Não atualizar a página com F5 durante uma sessão autenticada; usar os links internos.
- [ ] Fazer logout pelo menu ao trocar de persona.
- [ ] Não finalizar inscrições nem confirmar uma Súmula durante o último ensaio, pois essas ações alteram o estado em memória.
- [ ] Ter capturas de segurança das telas principais caso o ambiente falhe.

## Ordem das abas de segurança

Manter capturas ou slides de apoio para:

1. Minha área de Marcos com Atleta e Organizador;
2. perfil de Marcos com estatísticas e títulos;
3. participantes do campeonato 8 mostrando elenco geral e inscritos;
4. chaveamento da Copa Demonstração 2026;
5. formulário da Súmula;
6. Minha área da Prefeitura e formulário de novo campeonato.

---

# Respostas curtas para perguntas prováveis

## “Por que todo login vai para Minha área?”

> “Porque uma conta pode não ter vínculo algum ou possuir vários contextos. Minha área é um destino neutro e evita que o sistema escolha silenciosamente uma atuação incompatível.”

## “Capitão é um tipo diferente de conta?”

> “Não. Capitão é uma função contextual dentro de um time. A identidade continua sendo a mesma conta pessoal.”

## “Estar no time significa disputar todos os campeonatos?”

> “Não. O elenco do time é permanente; a inscrição é específica de cada competição; e a escalação é específica de cada partida.”

## “A Prefeitura é uma conta compartilhada?”

> “Não. Uma pessoa autenticada possui vínculo com a instituição e atua em nome dela conforme suas permissões.”

## “A Prefeitura pode organizar campeonatos?”

> “Sim, mas isso não é concedido silenciosamente. A pessoa habilita explicitamente a atuação como organizadora e, ao criar o campeonato, escolhe a Prefeitura como contexto responsável.”

## “Esses dados estão no backend?”

> “Nesta demonstração, não. O modo protótipo utiliza dados simulados em memória para representar e validar as jornadas de interface. Isso não deve ser confundido com persistência integrada.”

## “O resultado simples e a Súmula são fluxos diferentes?”

> “Não no protótipo atual. A Súmula é o registro esportivo principal: dela são derivados o placar, os eventos e o avanço do vencedor.”
