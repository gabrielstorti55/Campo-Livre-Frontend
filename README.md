# CampoLivre — Frontend

Frontend web do CampoLivre, sistema de gestão de campeonatos esportivos municipais desenvolvido como TCC da Uni-FACEF.

## Tecnologias

- Next.js 16 com App Router
- React 19 e TypeScript
- Tailwind CSS, shadcn/ui e primitivas Radix UI
- Playwright para testes ponta a ponta

## Requisitos

- Node.js 22 LTS ou versão compatível
- npm

## Configuração

```bash
npm install
cp .env.example .env
```

A variável `NEXT_PUBLIC_API_URL` definirá a URL base pública da API CampoLivre quando a integração começar. A interface ainda usa dados simulados enquanto o contrato da API é consolidado. Segredos e credenciais de servidor não devem receber o prefixo `NEXT_PUBLIC_`.

## Execução

```bash
# Desenvolvimento
npm run dev

# Build e execução de produção local
npm run build
npm run start
```

O servidor de desenvolvimento usa, por padrão, `http://localhost:3000`.

## Qualidade

```bash
npm run format:check
npm run lint
npm run deadcode
npm run typecheck
npm run build
npm run test:e2e

# Frontend integrado, fechado e sem fallback
npm run test:e2e:frontend

# Jornadas de autenticação somente no protótipo em memória
npm run test:e2e:prototype:auth

# Executa todos os gates acima
npm run check
```

## Modos da aplicação

- `NEXT_PUBLIC_APP_MODE=integrado`: usa somente adapters HTTP e falha fechada; produção sempre resolve para este modo.
- `NEXT_PUBLIC_APP_MODE=prototipo`: disponível somente fora de produção e usa dados em memória para demonstração.

Não existe fallback HTTP → protótipo. A autenticação não é persistida em Web Storage nem em cookie acessível por JavaScript.

### Executar a demonstração sem backend

Para visualizar os dados e fluxos preparados para a apresentação, basta iniciar o frontend em modo protótipo:

```bash
npm run dev:prototype -- --hostname 127.0.0.1 --port 3001
```

Abra `http://127.0.0.1:3001`. Nesse modo não é necessário iniciar a API NestJS nem o PostgreSQL. Os dados criados durante a demonstração ficam somente em memória e são reiniciados quando o servidor é encerrado.

### Contas de demonstração

Todas as contas abaixo usam a senha `senha-mock` e representam identidades separadas:

| Jornada               | Conta                         | Papel preparado                                                        |
| --------------------- | ----------------------------- | ---------------------------------------------------------------------- |
| Primeiro acesso       | `sem-time@campolivre.test`    | Lucas Ferreira, sem time e com convite pendente                        |
| Jogador               | `atleta@campolivre.test`      | Diego Souza, atleta do Vila Nova FC, sem privilégios de organizador    |
| Organizador           | `colaborador@campolivre.test` | Juliana Lopes, organizadora sem vínculo esportivo                      |
| Jogador + organizador | `pessoa@campolivre.test`      | Marcos Oliveira, capitão do Vila Nova FC e responsável por campeonatos |
| Prefeitura            | `prefeitura@campolivre.test`  | Gestora Municipal vinculada à Prefeitura de Franca                     |

A conta da Prefeitura representa uma funcionária vinculada à instituição, e não uma identidade impessoal compartilhada. A conta `atleta-cancelado@campolivre.test` existe para testes de exceção e não faz parte do roteiro principal.

### Roteiro resumido da apresentação

1. **Visitante:** início → campeonatos → classificação/estrutura → partida e súmula → time → atleta.
2. **Cadastro:** criar uma conta temporária, confirmar o e-mail no fluxo simulado e mostrar o primeiro acesso.
3. **Jogador:** entrar como Diego Souza e mostrar perfil, time, campeonatos e eventos.
4. **Organizador:** entrar como Juliana Lopes e mostrar campeonatos administrados, participantes, regulamento, estrutura e partidas.
5. **Papéis acumulados:** entrar como Marcos Oliveira e demonstrar a troca entre área esportiva e organização.
6. **Prefeitura:** entrar como Gestora Municipal e mostrar painel, campos e organizadores vinculados.

Na área do organizador, **Meus Campeonatos** contém somente as competições que a conta pode administrar. **Explorar campeonatos** abre o catálogo público de todas as competições. **Minha área** permite retornar ao perfil da conta e escolher outra área disponível.

## Estrutura

```text
src/
├── app/                    # App Router: rotas, layouts e entrypoints
│   ├── (explore)/          # consulta pública sem alterar as URLs
│   ├── atleta/
│   ├── organizador/
│   └── prefeitura/
├── screens/                # telas por público, conta e persona
├── components/             # ui, layout e módulos visuais de domínio
├── hooks/                  # hooks React compartilhados
├── services/               # consultas, adapters e regras locais
├── stores/                 # estado reativo e persistência no navegador
├── types/                  # contratos internos
├── mocks/                  # dados simulados isolados
├── layouts/                # shells das áreas
├── utils/                  # utilitários técnicos
└── constants/              # constantes compartilhadas

tests/
└── e2e/
```

O App Router é a única fonte das rotas. Os arquivos `page.tsx` e `layout.tsx` são adaptadores pequenos que compõem telas de `screens`. Todos os componentes de navegação usam diretamente `next/link` e `next/navigation`; não há React Router, Pages Router nem camada paralela de rotas.

Pastas técnicas permanecem em inglês. Arquivos, pastas de persona/domínio e identificadores próprios usam português, com caminhos em `kebab-case` e sem acentos.

## Componentes

As primitivas ficam em `src/components/ui` e seguem o padrão shadcn/ui sobre Radix UI. Como o shadcn distribui seu código-fonte para o projeto, esses arquivos pertencem ao repositório, mas preservam os nomes técnicos da biblioteca.

Padrões reutilizáveis ficam em `components/layout`; composições reais de domínio ficam em `components/modules/<dominio>`. O projeto mantém somente componentes e primitivas com consumidores comprovados; `npm run deadcode` verifica arquivos e dependências sem uso.

## Identidade visual

O sistema visual aprovado está documentado em [DESIGN.md](DESIGN.md). Ele combina **Campo Editorial + Estádio Municipal** e é obrigatório para áreas públicas, conta, atleta, organizador, Prefeitura e estados futuros da integração com a API.

As fontes Barlow Condensed e IBM Plex Sans são empacotadas localmente por `@fontsource`; a produção não depende de fontes remotas.

## Integração com a API

- [Arquitetura do frontend](docs/architecture.md)
- [Roadmap de integração do frontend](docs/roadmap-integracao-frontend.md)
- [Fluxo de atleta e bloqueios](docs/fluxo-atleta-frontend.md)
- [Questões contratuais a acertar](docs/questoes-a-acertar.md)
- [Contrato básico de autenticação no frontend](docs/autenticacao-frontend.md)
- [Pendências da autenticação para o backend](docs/pendencias-autenticacao-backend.md)

## Backend

Repositório de referência: https://github.com/thalesleall/Campo-Livre

O Next.js é o frontend web e não substitui o backend NestJS. Regras de negócio, autorização definitiva e persistência continuam no backend. A integração será orientada pelo OpenAPI/Swagger publicado pela API.

## Estado atual

A migração para Next.js preserva as telas e rotas do protótipo, agora servidas pelo App Router. A maior parte dos fluxos continua local e usa mocks; renderização no servidor ou feedback visual não significam persistência no backend.

Mais detalhes: [docs/architecture.md](docs/architecture.md).
