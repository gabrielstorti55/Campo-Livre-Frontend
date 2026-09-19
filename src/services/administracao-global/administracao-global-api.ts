import type {
  EntradaBloqueio,
  EntradaCriacaoPrefeitura,
  EntradaEdicaoPrefeitura,
  FiltrosAdministradores,
  FiltrosPrefeiturasAdministrativas,
  PaginaAdministradores,
  PaginaPrefeiturasAdministrativas,
  PaginaUsuariosInstitucionais,
  PrefeituraCriadaAdministracao,
  PrefeituraEditadaAdministracao,
  RespostaBloqueio,
  RespostaConcessaoAdministrador,
  RespostaDesbloqueio,
  RespostaRevogacaoAdministrador,
} from '@/types/api/administracao-global';

export interface AdministracaoGlobalApi {
  listarAdministradores(
    accessToken: string,
    filtros?: FiltrosAdministradores,
  ): Promise<PaginaAdministradores>;
  buscarUsuarioPorEmail(
    email: string,
    accessToken: string,
  ): Promise<PaginaUsuariosInstitucionais>;
  bloquearUsuario(
    usuarioId: string,
    entrada: EntradaBloqueio,
    accessToken: string,
  ): Promise<RespostaBloqueio>;
  desbloquearUsuario(
    usuarioId: string,
    justificativa: string,
    accessToken: string,
  ): Promise<RespostaDesbloqueio>;
  concederAdministrador(
    usuarioId: string,
    accessToken: string,
  ): Promise<RespostaConcessaoAdministrador>;
  revogarAdministrador(
    usuarioId: string,
    justificativa: string,
    accessToken: string,
  ): Promise<RespostaRevogacaoAdministrador>;
  listarPrefeituras(
    accessToken: string,
    filtros?: FiltrosPrefeiturasAdministrativas,
  ): Promise<PaginaPrefeiturasAdministrativas>;
  criarPrefeitura(
    entrada: EntradaCriacaoPrefeitura,
    accessToken: string,
    idempotencyKey: string,
  ): Promise<PrefeituraCriadaAdministracao>;
  editarPrefeitura(
    prefeituraId: string,
    entrada: EntradaEdicaoPrefeitura,
    accessToken: string,
  ): Promise<PrefeituraEditadaAdministracao>;
}
