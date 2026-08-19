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
├── app/                    # App Router, layouts, providers e estilos globais
│   ├── (explore)/          # consulta pública sem alterar as URLs
│   ├── atleta/
│   ├── organizador/
│   └── prefeitura/
├── features/               # capacidades e telas do produto
│   ├── auth/
│   ├── campeonatos/
│   ├── dashboard/
│   ├── partidas/
│   ├── perfis/
│   ├── prefeitura/
│   └── times/
├── mocks/                  # dados simulados isolados
└── shared/                 # UI e utilitários reutilizáveis
    ├── components/
    └── lib/

tests/
└── e2e/
```

O App Router é a única fonte das rotas. Os arquivos `page.tsx` e `layout.tsx` são adaptadores pequenos que compõem as páginas das features. Todos os componentes de navegação usam diretamente `next/link` e `next/navigation`; não há React Router nem camada de compatibilidade.

As pastas e arquivos usam `kebab-case`, seguindo a convenção do backend NestJS. Código específico de uma capacidade fica em `features`; somente elementos reutilizados por diferentes capacidades ficam em `shared`.

## Componentes

As primitivas de interface ficam em `src/shared/components/ui` e seguem o padrão shadcn/ui sobre Radix UI. Como o shadcn distribui o código-fonte dos componentes para o próprio projeto, esses arquivos pertencem ao repositório, mas não são implementações improvisadas.

Componentes como cabeçalhos, cartões de campeonato e linhas de lista continuam sendo componentes próprios do CampoLivre: eles compõem as primitivas shadcn para representar conceitos do produto. O projeto mantém somente as primitivas efetivamente utilizadas; `npm run deadcode` verifica arquivos e dependências sem consumidores.

## Backend

Repositório de referência: https://github.com/thalesleall/Campo-Livre

O Next.js é o frontend web e não substitui o backend NestJS. Regras de negócio, autorização definitiva e persistência continuam no backend. A integração será orientada pelo OpenAPI/Swagger publicado pela API.

## Estado atual

A migração para Next.js preserva as telas e rotas do protótipo, agora servidas pelo App Router. A maior parte dos fluxos continua local e usa mocks; renderização no servidor ou feedback visual não significam persistência no backend.

Mais detalhes: [docs/architecture.md](docs/architecture.md).
