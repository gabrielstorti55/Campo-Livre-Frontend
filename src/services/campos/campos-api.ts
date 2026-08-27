import type {
  CampoDetalhado,
  FiltrosCampos,
  PaginaCampos,
} from '@/types/api/campos';

export interface CamposApi {
  listarCampos(filtros?: FiltrosCampos): Promise<PaginaCampos>;
  consultarCampo(campoId: string): Promise<CampoDetalhado>;
}
