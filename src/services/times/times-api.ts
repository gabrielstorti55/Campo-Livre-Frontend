import type {
  AtletaParaConvite,
  AceiteConviteTime,
  AtualizacaoTime,
  CancelamentoConviteTime,
  ConviteTimeEnviado,
  ConviteTimePorToken,
  CriacaoTime,
  DesativacaoTime,
  EncerramentoMembroTime,
  FiltrosTimes,
  PaginaConvitesTime,
  PaginaConvitesTimeEnviados,
  PaginaElenco,
  PaginaHistoricoElenco,
  PaginaTimesDaConta,
  PaginaTimes,
  RespostaAtualizacaoTime,
  RespostaEscudoTime,
  RecusaConviteTime,
  ReativacaoTime,
  ReenvioConviteTime,
  SaidaVoluntariaTime,
  TimeCriado,
  TimeDetalhado,
  TransferenciaCapitania,
} from '@/types/api/times';

export interface TimesApi {
  consultarConvitePorToken(
    token: string,
    accessToken: string,
  ): Promise<ConviteTimePorToken>;
  aceitarConvitePorToken(
    token: string,
    accessToken: string,
  ): Promise<AceiteConviteTime>;
  recusarConvitePorToken(
    token: string,
    accessToken: string,
  ): Promise<RecusaConviteTime>;
  criarTime(
    accessToken: string,
    input: CriacaoTime,
    idempotencyKey: string,
  ): Promise<TimeCriado>;
  listarMeusTimes(
    accessToken: string,
    pagina?: number,
    tamanho?: number,
  ): Promise<PaginaTimesDaConta>;
  removerAtleta(
    timeId: string,
    membroId: string,
    accessToken: string,
    motivo: string,
  ): Promise<EncerramentoMembroTime>;
  sairDoTime(timeId: string, accessToken: string): Promise<SaidaVoluntariaTime>;
  transferirCapitania(
    timeId: string,
    sucessorMembroId: string,
    accessToken: string,
  ): Promise<TransferenciaCapitania>;
  listarHistoricoElenco(
    timeId: string,
    accessToken: string,
    pagina?: number,
    tamanho?: number,
  ): Promise<PaginaHistoricoElenco>;
  desativarTime(
    timeId: string,
    accessToken: string,
    motivo: string,
  ): Promise<DesativacaoTime>;
  reativarTime(timeId: string, accessToken: string): Promise<ReativacaoTime>;
  buscarAtletaParaConvite(
    email: string,
    accessToken: string,
  ): Promise<AtletaParaConvite>;
  enviarConvite(
    timeId: string,
    accessToken: string,
    usuarioDestinatarioId: string,
    idempotencyKey: string,
  ): Promise<ConviteTimeEnviado>;
  listarConvitesEnviados(
    timeId: string,
    accessToken: string,
    pagina?: number,
    tamanho?: number,
  ): Promise<PaginaConvitesTimeEnviados>;
  reenviarConvite(
    timeId: string,
    conviteId: string,
    accessToken: string,
    idempotencyKey: string,
  ): Promise<ReenvioConviteTime>;
  cancelarConvite(
    timeId: string,
    conviteId: string,
    accessToken: string,
  ): Promise<CancelamentoConviteTime>;
  enviarEscudo(
    timeId: string,
    accessToken: string,
    arquivo: File,
  ): Promise<RespostaEscudoTime>;
  removerEscudo(timeId: string, accessToken: string): Promise<void>;
  atualizarTime(
    timeId: string,
    accessToken: string,
    input: AtualizacaoTime,
  ): Promise<RespostaAtualizacaoTime>;
  consultarTime(timeId: string): Promise<TimeDetalhado>;
  listarElenco(
    timeId: string,
    pagina?: number,
    tamanho?: number,
  ): Promise<PaginaElenco>;
  listarTimes(filtros?: FiltrosTimes): Promise<PaginaTimes>;
  listarMeusConvites(
    accessToken: string,
    pagina?: number,
    tamanho?: number,
  ): Promise<PaginaConvitesTime>;
}
