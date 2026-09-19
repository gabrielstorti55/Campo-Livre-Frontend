import type { AutenticacaoApi } from '@/services/autenticacao/autenticacao-api';
import { ErroApi } from '@/services/api/problem-details';
import type { RespostaRenovacao } from '@/types/api/autenticacao';

type Renovador = Pick<AutenticacaoApi, 'renovar'>;

export function deveRenovarAccessToken(error: ErroApi): boolean {
  return (
    error.problem.status === 401 &&
    [
      'NAO_AUTENTICADO',
      'ACCESS_TOKEN_EXPIRADO',
      'ACCESS_TOKEN_INVALIDO',
    ].includes(error.problem.codigo ?? '')
  );
}

export class CoordenadorRefresh {
  private renovacaoEmAndamento: Promise<RespostaRenovacao> | null = null;

  constructor(private readonly api: Renovador) {}

  renovar(): Promise<RespostaRenovacao> {
    if (this.renovacaoEmAndamento) return this.renovacaoEmAndamento;

    const renewal = this.api.renovar();
    this.renovacaoEmAndamento = renewal;

    const clear = () => {
      if (this.renovacaoEmAndamento === renewal) {
        this.renovacaoEmAndamento = null;
      }
    };
    void renewal.then(clear, clear);

    return renewal;
  }

  async executarComRenovacao<T>(
    request: (novoAccessToken?: string) => Promise<T>,
    deveRenovar: (error: ErroApi) => boolean = deveRenovarAccessToken,
  ): Promise<T> {
    try {
      return await request();
    } catch (error) {
      if (!(error instanceof ErroApi) || !deveRenovar(error)) {
        throw error;
      }

      const renewal = await this.renovar();
      return request(renewal.accessToken);
    }
  }
}
