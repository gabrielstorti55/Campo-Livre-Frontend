import { rmSync } from 'node:fs';

// O Next dev pode ser encerrado pelo Playwright enquanto atualiza os tipos
// derivados. Tipos de desenvolvimento incompletos não devem entrar no build.
rmSync('.next/dev/types', {
  recursive: true,
  force: true,
  maxRetries: 5,
  retryDelay: 100,
});
