import type { CamposApi } from '@/services/campos/campos-api';
import type { GestaoCamposApi } from '@/services/campos/gestao-campos-api';
import type {
  AlteracaoEstadoOperacionalCampo,
  AtualizacaoCampo,
  CadastroCampo,
  CampoAtualizado,
  CampoCriado,
  CampoDetalhado,
  EstadoOperacionalCampoAlterado,
  FiltrosCampos,
  PaginaCampos,
} from '@/types/api/campos';

type ClienteCampos = {
  request<T>(path: string, options?: Record<string, unknown>): Promise<T>;
};

export class CamposHttp implements CamposApi, GestaoCamposApi {
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
    query.set('pagina', String(pagina));
    query.set('tamanho', String(tamanho));

    return this.client.request<PaginaCampos>(`/campos?${query.toString()}`);
  }

  consultarCampo(campoId: string): Promise<CampoDetalhado> {
    return this.client.request<CampoDetalhado>(`/campos/${campoId}`);
  }

  cadastrarCampo(
    prefeituraId: string,
    accessToken: string,
    input: CadastroCampo,
  ): Promise<CampoCriado> {
    return this.client.request<CampoCriado>(
      `/prefeituras/${encodeURIComponent(prefeituraId)}/campos`,
      { method: 'POST', accessToken, body: input },
    );
  }

  atualizarCampo(
    campoId: string,
    accessToken: string,
    input: AtualizacaoCampo,
  ): Promise<CampoAtualizado> {
    return this.client.request<CampoAtualizado>(
      `/campos/${encodeURIComponent(campoId)}`,
      { method: 'PATCH', accessToken, body: input },
    );
  }

  alterarEstadoOperacional(
    campoId: string,
    accessToken: string,
    input: AlteracaoEstadoOperacionalCampo,
  ): Promise<EstadoOperacionalCampoAlterado> {
    return this.client.request<EstadoOperacionalCampoAlterado>(
      `/campos/${encodeURIComponent(campoId)}/estado-operacional`,
      { method: 'POST', accessToken, body: input },
    );
  }
}
