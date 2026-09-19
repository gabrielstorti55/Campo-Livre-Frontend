import type { PrefeiturasApi } from '@/services/prefeituras/prefeituras-api';
import type { PaginaPrefeiturasDaConta } from '@/types/api/prefeituras';

export class PrefeiturasPrototipo implements PrefeiturasApi {
  constructor(
    private readonly obterContaAtivaId: (accessToken: string) => string | null,
  ) {}

  async listarMinhasPrefeituras(
    accessToken: string,
    pagina = 1,
    tamanho = 20,
  ): Promise<PaginaPrefeiturasDaConta> {
    const contaId = this.obterContaAtivaId(accessToken);
    if (!contaId) throw new Error('NAO_AUTENTICADO');

    const todos =
      contaId === 'conta-prefeitura'
        ? [
            {
              membroId: 'membro-prefeitura-franca',
              papel: 'RESPONSAVEL' as const,
              iniciadoEm: '2025-01-01T12:00:00.000Z',
              prefeitura: {
                id: 'prefeitura-franca',
                nomeOficial: 'Prefeitura de Franca',
                status: 'ATIVA' as const,
                municipio: {
                  id: '00000000-0000-4000-8000-000000000001',
                  nome: 'Franca',
                  uf: 'SP',
                },
                emailContatoPublico: 'esporte@franca.sp.gov.br',
                telefoneContatoPublico: null,
              },
            },
          ]
        : [];
    const inicio = (pagina - 1) * tamanho;
    return {
      itens: todos.slice(inicio, inicio + tamanho),
      pagina,
      tamanho,
      totalItens: todos.length,
      totalPaginas: Math.ceil(todos.length / tamanho),
    };
  }
}
