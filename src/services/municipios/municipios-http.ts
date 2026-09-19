import type { MunicipiosApi } from '@/services/municipios/municipios-api';
import type {
  FiltrosMunicipios,
  PaginaMunicipios,
} from '@/types/api/municipios';

type ClienteMunicipios = {
  request<T>(path: string, options?: Record<string, unknown>): Promise<T>;
};

export class MunicipiosHttp implements MunicipiosApi {
  constructor(private readonly client: ClienteMunicipios) {}

  listarMunicipios({
    nome,
    uf,
    pagina = 1,
    tamanho = 20,
  }: FiltrosMunicipios = {}): Promise<PaginaMunicipios> {
    const query = new URLSearchParams();
    if (nome) query.set('nome', nome);
    if (uf) query.set('uf', uf.toUpperCase());
    query.set('pagina', String(pagina));
    query.set('tamanho', String(tamanho));

    return this.client.request<PaginaMunicipios>(
      `/municipios?${query.toString()}`,
    );
  }
}
