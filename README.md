# CampoLivre — Frontend

Frontend web do CampoLivre/LigaPro, sistema de gestão de campeonatos esportivos municipais desenvolvido como TCC da Uni-FACEF.

## Tecnologias

- React 19 e TypeScript
- Vite 8
- React Router
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

A variável `VITE_API_URL` define a URL base da API CampoLivre. A interface ainda usa dados simulados enquanto o contrato da API é consolidado.

## Execução

```bash
# Desenvolvimento
npm run dev

# Build e visualização local
npm run build
npm run preview
```

O servidor de desenvolvimento usa, por padrão, `http://localhost:5173`.

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
├── app/                    # bootstrap, rotas e estilos globais
├── features/               # capacidades do produto
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

As pastas e arquivos usam `kebab-case`, seguindo a convenção do backend NestJS. Código específico de uma capacidade fica em `features`; somente elementos reutilizados por diferentes capacidades ficam em `shared`.

## Componentes

As primitivas de interface ficam em `src/shared/components/ui` e seguem o padrão shadcn/ui sobre Radix UI. Como o shadcn distribui o código-fonte dos componentes para o próprio projeto, esses arquivos pertencem ao repositório, mas não são implementações improvisadas.

Componentes como cabeçalhos, cartões de campeonato e linhas de lista continuam sendo componentes próprios do CampoLivre: eles compõem as primitivas shadcn para representar conceitos do produto. O projeto mantém somente as primitivas efetivamente utilizadas; `npm run deadcode` verifica arquivos e dependências sem consumidores.

## Backend

Repositório de referência: https://github.com/thalesleall/Campo-Livre

O frontend não deve duplicar regras de negócio nem inventar contratos. A integração será orientada pelo OpenAPI/Swagger publicado pelo backend.

## Estado atual

A interface migrada preserva as telas do protótipo Lovable, mas a maior parte dos fluxos ainda é local e usa mocks. Renderização ou feedback visual não significam persistência no backend.

Mais detalhes: [docs/architecture.md](docs/architecture.md).
