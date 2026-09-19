import type { PartidasApi } from '@/services/partidas/partidas-api';
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

type ClienteHttp = {
  request<T>(path: string, options?: Record<string, unknown>): Promise<T>;
};

export class PartidasHttp implements PartidasApi {
  constructor(private readonly http: ClienteHttp) {}

  listarAgenda(
    filtros: FiltrosAgendaPartidas,
    opcoes?: OpcoesConsulta,
  ): Promise<PaginaAgendaPartidas> {
    const { pagina = 1, tamanho = 20, ...opcionais } = filtros;
    const query = new URLSearchParams({
      pagina: String(pagina),
      tamanho: String(tamanho),
    });
    for (const [chave, valor] of Object.entries(opcionais)) {
      if (typeof valor === 'string' && valor) query.set(chave, valor);
    }
    return this.http.request(
      `/partidas?${query.toString()}`,
      opcoes?.signal ? { signal: opcoes.signal } : undefined,
    );
  }

  consultarPartida(
    partidaId: string,
    opcoes?: OpcoesConsulta,
  ): Promise<DetalhePublicoPartida> {
    return this.http.request(
      `/partidas/${encodeURIComponent(partidaId)}`,
      opcoes?.signal ? { signal: opcoes.signal } : undefined,
    );
  }

  consultarAdministracao(
    partidaId: string,
    accessToken: string,
    opcoes?: OpcoesConsulta,
  ): Promise<DetalheAdministrativoPartida> {
    return this.http.request(
      `/partidas/${encodeURIComponent(partidaId)}/administracao`,
      { accessToken, ...(opcoes?.signal ? { signal: opcoes.signal } : {}) },
    );
  }

  salvarAgendamento(
    partidaId: string,
    accessToken: string,
    input: AgendamentoPartidaInput,
  ): Promise<AgendamentoPartidaSalvo> {
    return this.http.request<AgendamentoPartidaSalvo>(
      `/partidas/${encodeURIComponent(partidaId)}/agendamento`,
      { method: 'PUT', accessToken, body: input },
    );
  }

  adiarPartida(
    partidaId: string,
    accessToken: string,
    input: AdiamentoPartidaInput,
  ): Promise<PartidaAdiada> {
    return this.http.request<PartidaAdiada>(
      `/partidas/${encodeURIComponent(partidaId)}/adiamentos`,
      { method: 'POST', accessToken, body: input },
    );
  }

  cancelarPartida(
    partidaId: string,
    accessToken: string,
    input: CancelamentoPartidaInput,
  ): Promise<PartidaCancelada> {
    return this.http.request<PartidaCancelada>(
      `/partidas/${encodeURIComponent(partidaId)}/cancelamentos`,
      { method: 'POST', accessToken, body: input },
    );
  }

  consultarArtilharia(
    campeonatoId: string,
    pagina = 1,
    tamanho = 20,
  ): Promise<PaginaArtilharia> {
    return this.http.request(
      `/campeonatos/${encodeURIComponent(campeonatoId)}/artilharia?pagina=${pagina}&tamanho=${tamanho}`,
    );
  }

  registrarWo(
    partidaId: string,
    accessToken: string,
    input: RegistroWo,
    idempotencyKey: string,
  ): Promise<WoRegistrado> {
    return this.http.request(`/partidas/${encodeURIComponent(partidaId)}/wo`, {
      method: 'POST',
      accessToken,
      headers: { 'Idempotency-Key': idempotencyKey },
      body: input,
    });
  }
}
