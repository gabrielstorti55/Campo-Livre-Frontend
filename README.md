# CampoLivre — Frontend

Frontend web do CampoLivre/LigaPro, sistema de gestão de campeonatos esportivos municipais desenvolvido como TCC da Uni-FACEF.

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

# Executa todos os gates acima
npm run check
```

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

## Backend

Repositório de referência: https://github.com/thalesleall/Campo-Livre

O Next.js é o frontend web e não substitui o backend NestJS. Regras de negócio, autorização definitiva e persistência continuam no backend. A integração será orientada pelo OpenAPI/Swagger publicado pela API.

## Estado atual

A migração para Next.js preserva as telas e rotas do protótipo, agora servidas pelo App Router. A maior parte dos fluxos continua local e usa mocks; renderização no servidor ou feedback visual não significam persistência no backend.

Mais detalhes: [docs/architecture.md](docs/architecture.md).
