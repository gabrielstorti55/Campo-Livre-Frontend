import type { OpcoesConsulta } from '@/services/api/opcoes-consulta';
import type {
  AdiamentoPartidaInput,
  AgendamentoPartidaInput,
  AgendamentoPartidaSalvo,
  CancelamentoPartidaInput,
  DetalheAdministrativoPartida,
  DetalhePublicoPartida,
  FiltrosAgendaPartidas,
  PaginaAgendaPartidas,
  PaginaArtilharia,
  PartidaAdiada,
  PartidaCancelada,
  RegistroWo,
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
  registrarWo(
    partidaId: string,
    accessToken: string,
    input: RegistroWo,
    idempotencyKey: string,
  ): Promise<WoRegistrado>;
}
