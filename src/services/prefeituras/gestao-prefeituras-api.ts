import type {
  AceiteConvitePrefeitura,
  ConvitePrefeituraCriado,
  ConvitePrefeituraPorToken,
  PaginaConvitesPrefeituraEnviados,
  PaginaConvitesPrefeituraRecebidos,
  PaginaFuncionariosPrefeitura,
  PaginaUsuariosInstitucionais,
  ReenvioConvitePrefeitura,
  RemocaoFuncionarioPrefeitura,
  StatusFuncionarioPrefeitura,
  TransferenciaResponsabilidadePrefeitura,
} from '@/types/api/prefeituras';

export interface GestaoPrefeiturasApi {
  listarFuncionarios(
    prefeituraId: string,
    accessToken: string,
    status?: StatusFuncionarioPrefeitura,
    pagina?: number,
    tamanho?: number,
  ): Promise<PaginaFuncionariosPrefeitura>;
  listarConvitesEnviados(
    prefeituraId: string,
    accessToken: string,
    pagina?: number,
    tamanho?: number,
  ): Promise<PaginaConvitesPrefeituraEnviados>;
  buscarUsuarioInstitucional(
    email: string,
    accessToken: string,
  ): Promise<PaginaUsuariosInstitucionais>;
  convidarFuncionario(
    prefeituraId: string,
    usuarioId: string,
    accessToken: string,
    idempotencyKey: string,
  ): Promise<ConvitePrefeituraCriado>;
  reenviarConvite(
    prefeituraId: string,
    conviteId: string,
    accessToken: string,
    idempotencyKey: string,
  ): Promise<ReenvioConvitePrefeitura>;
  removerFuncionario(
    prefeituraId: string,
    membroId: string,
    accessToken: string,
    motivo: string,
  ): Promise<RemocaoFuncionarioPrefeitura>;
  transferirResponsabilidade(
    prefeituraId: string,
    sucessorMembroId: string,
    accessToken: string,
  ): Promise<TransferenciaResponsabilidadePrefeitura>;
  listarConvitesRecebidos(
    accessToken: string,
    pagina?: number,
    tamanho?: number,
  ): Promise<PaginaConvitesPrefeituraRecebidos>;
  aceitarConviteRecebido(
    conviteId: string,
    accessToken: string,
  ): Promise<AceiteConvitePrefeitura>;
  recusarConviteRecebido(conviteId: string, accessToken: string): Promise<void>;
  consultarConvitePorToken(token: string): Promise<ConvitePrefeituraPorToken>;
  aceitarConvitePorToken(
    token: string,
    accessToken: string,
  ): Promise<AceiteConvitePrefeitura>;
  recusarConvitePorToken(token: string, accessToken: string): Promise<void>;
}
