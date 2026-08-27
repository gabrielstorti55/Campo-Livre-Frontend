import type { CamposApi } from '@/services/campos/campos-api';
import type {
  CampoDetalhado,
  FiltrosCampos,
  PaginaCampos,
} from '@/types/api/campos';

type ClienteCampos = {
  request<T>(path: string, options?: Record<string, unknown>): Promise<T>;
};

export class CamposHttp implements CamposApi {
  constructor(private readonly client: ClienteCampos) {}

  listarCampos({
    nome,
    municipioId,
    statusOperacional,
    pagina = 1,
    tamanho = 20,
  }: FiltrosCampos = {}): Promise<PaginaCampos> {
    const query = new URLSearchParams();
    if (nome) query.set('nome', nome);
    if (municipioId) query.set('municipioId', municipioId);
    if (statusOperacional) query.set('statusOperacional', statusOperacional);
    query.set('page', String(pagina));
    query.set('size', String(tamanho));

    return this.client.request<PaginaCampos>(`/campos?${query.toString()}`);
  }

  consultarCampo(campoId: string): Promise<CampoDetalhado> {
    return this.client.request<CampoDetalhado>(`/campos/${campoId}`);
  }
}
