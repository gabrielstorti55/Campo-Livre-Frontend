import type {
  AlteracaoEstadoOperacionalCampo,
  AtualizacaoCampo,
  CampoAtualizado,
  EstadoOperacionalCampoAlterado,
} from '@/types/api/campos';

export interface GestaoCamposApi {
  atualizarCampo(
    campoId: string,
    accessToken: string,
    input: AtualizacaoCampo,
  ): Promise<CampoAtualizado>;
  alterarEstadoOperacional(
    campoId: string,
    accessToken: string,
    input: AlteracaoEstadoOperacionalCampo,
  ): Promise<EstadoOperacionalCampoAlterado>;
}
