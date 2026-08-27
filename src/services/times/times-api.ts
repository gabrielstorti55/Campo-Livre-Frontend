import type {
  AtletaParaConvite,
  AtualizacaoTime,
  CancelamentoConviteTime,
  ConviteTimeEnviado,
  DesativacaoTime,
  EncerramentoMembroTime,
  FiltrosTimes,
  PaginaConvitesTime,
  PaginaElenco,
  PaginaHistoricoElenco,
  PaginaTimes,
  RespostaAtualizacaoTime,
  RespostaEscudoTime,
  ReativacaoTime,
  ReenvioConviteTime,
  SaidaVoluntariaTime,
  TimeDetalhado,
  TransferenciaCapitania,
} from '@/types/api/times';

export interface TimesApi {
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
