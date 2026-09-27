import type { OpcoesConsulta } from '@/services/api/opcoes-consulta';
import type {
  AdiamentoPartidaInput,
  AgendamentoPartidaInput,
  AgendamentoPartidaSalvo,
  CancelamentoPartidaInput,
  ClassificacaoCampeonato,
  DetalheAdministrativoPartida,
  DetalhePublicoPartida,
  EscalacaoPartida,
  FiltrosAgendaPartidas,
  PaginaAgendaPartidas,
  PaginaArtilharia,
  PartidaAdiada,
  PartidaCancelada,
  RegistroWo,
  ResultadoPrototipoRegistrado,
  SumulaCompletaPrototipo,
  SumulaDefinitivaInput,
  SumulaDefinitivaPublicada,
  WoRegistrado,
} from '@/types/api/partidas';

export interface PartidasApi {
  listarAgenda(
    filtros: FiltrosAgendaPartidas,
    opcoes?: OpcoesConsulta,
  ): Promise<PaginaAgendaPartidas>;
  consultarPartida(
    partidaId: string,
    opcoes?: OpcoesConsulta,
  ): Promise<DetalhePublicoPartida>;
  consultarAdministracao(
    partidaId: string,
    accessToken: string,
    opcoes?: OpcoesConsulta,
  ): Promise<DetalheAdministrativoPartida>;
  salvarAgendamento(
    partidaId: string,
    accessToken: string,
    input: AgendamentoPartidaInput,
  ): Promise<AgendamentoPartidaSalvo>;
  adiarPartida(
    partidaId: string,
    accessToken: string,
    input: AdiamentoPartidaInput,
  ): Promise<PartidaAdiada>;
  cancelarPartida(
    partidaId: string,
    accessToken: string,
    input: CancelamentoPartidaInput,
  ): Promise<PartidaCancelada>;
  consultarArtilharia(
    campeonatoId: string,
    pagina?: number,
    tamanho?: number,
  ): Promise<PaginaArtilharia>;
  consultarClassificacao(
    campeonatoId: string,
    faseId: string,
    grupoId?: string,
    opcoes?: OpcoesConsulta,
  ): Promise<ClassificacaoCampeonato>;
  registrarWo(
    partidaId: string,
    accessToken: string,
    input: RegistroWo,
    idempotencyKey: string,
  ): Promise<WoRegistrado>;
  consultarEscalacao?(
    partidaId: string,
    timeCampeonatoId: string,
    accessToken: string,
  ): Promise<EscalacaoPartida>;
  publicarSumula?(
    partidaId: string,
    accessToken: string,
    input: SumulaDefinitivaInput,
    idempotencyKey: string,
  ): Promise<SumulaDefinitivaPublicada>;
  /** Persistência local da demonstração; o integrado usa publicarSumula. */
  registrarSumulaPrototipo?(
    partidaId: string,
    accessToken: string,
    input: SumulaCompletaPrototipo,
  ): Promise<ResultadoPrototipoRegistrado>;
}
