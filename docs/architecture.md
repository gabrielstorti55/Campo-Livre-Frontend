# Arquitetura do frontend

## Objetivo

Manter o protótipo visual do CampoLivre evolutivo sem carregar a estrutura gerada pelo Lovable para a implementação integrada. A organização é por capacidade de negócio, com infraestrutura compartilhada pequena e explícita.

## Limites

### `app`

Contém apenas o ponto de entrada, configuração de rotas e estilos globais. Não deve concentrar regras de negócio.

### `features`

Cada diretório representa uma capacidade do produto:

- `auth`: entrada, cadastro e recuperação de acesso;
- `campeonatos`: listagem, criação, visão geral e chaveamento;
- `dashboard`: páginas iniciais por perfil;
- `partidas`: agendamento e súmula;
- `perfis`: visualização e configuração dos perfis;
- `prefeitura`: campos, calendário, aprovações e organizadores;
- `times`: busca, criação e gestão de equipes.

Páginas e componentes exclusivos ficam próximos da feature que os utiliza.

### `shared`

Recebe somente código utilizado por mais de uma feature:

- `components/ui`: primitivas visuais;
- `components`: padrões visuais compartilhados do CampoLivre;
- `hooks`: hooks independentes de domínio;
- `lib`: utilitários técnicos pequenos.

`shared` não deve depender de páginas de `features`.

### `mocks`

Concentra os dados temporários usados pelo protótipo. O isolamento deixa explícito que os fluxos ainda não são persistidos e facilita substituir mocks por serviços com contratos estáveis.

## Dependências permitidas

```text
app -> features -> shared
  \-------> mocks <---/
```

- `app` pode compor features e shared;
- features podem usar shared e, temporariamente, mocks;
- shared não deve importar features;
- uma feature não deve acessar detalhes internos de outra sem um contrato explícito.

## Nomenclatura

A convenção acompanha os arquivos do backend NestJS:

- arquivos e diretórios: `kebab-case`;
- componentes e tipos: `PascalCase`;
- funções, hooks e variáveis: `camelCase`;
- testes: `*.spec.ts` ou `*.spec.tsx`;
- páginas: `*-page.tsx`.

## Próxima evolução

1. Consolidar o contrato OpenAPI com o backend.
2. Criar o cliente HTTP e o tratamento comum de erros.
3. Migrar uma fatia vertical por vez de mock para serviço real.
4. Adicionar testes de integração dos estados de loading, erro e permissão.
5. Dividir rotas por carregamento sob demanda se o bundle continuar acima do limite recomendado.
