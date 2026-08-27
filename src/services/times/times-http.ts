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

type ClienteTimes = {
  request<T>(path: string, options?: Record<string, unknown>): Promise<T>;
};

export class TimesHttp {
  constructor(private readonly client: ClienteTimes) {}

  removerAtleta(
    timeId: string,
    membroId: string,
    accessToken: string,
    motivo: string,
  ): Promise<EncerramentoMembroTime> {
    return this.client.request<EncerramentoMembroTime>(
      `/times/${timeId}/elenco/${membroId}/remocao`,
      { method: 'POST', accessToken, body: { motivo } },
    );
  }

  sairDoTime(
    timeId: string,
    accessToken: string,
  ): Promise<SaidaVoluntariaTime> {
    return this.client.request<SaidaVoluntariaTime>(`/times/${timeId}/saida`, {
      method: 'POST',
      accessToken,
    });
  }

  transferirCapitania(
    timeId: string,
    sucessorMembroId: string,
    accessToken: string,
  ): Promise<TransferenciaCapitania> {
    return this.client.request<TransferenciaCapitania>(
      `/times/${timeId}/transferencia-capitania`,
      {
        method: 'POST',
        accessToken,
        body: { sucessorMembroId, confirmacao: true },
      },
    );
  }

  listarHistoricoElenco(
    timeId: string,
    accessToken: string,
    pagina = 1,
    tamanho = 20,
  ): Promise<PaginaHistoricoElenco> {
    const query = new URLSearchParams({
      page: String(pagina),
      size: String(tamanho),
    });
    return this.client.request<PaginaHistoricoElenco>(
      `/times/${timeId}/historico-elenco?${query.toString()}`,
      { accessToken },
    );
  }

  desativarTime(
    timeId: string,
    accessToken: string,
    motivo: string,
  ): Promise<DesativacaoTime> {
    return this.client.request<DesativacaoTime>(
      `/times/${timeId}/desativacao`,
      {
        method: 'POST',
        accessToken,
        body: { motivo, confirmacao: true },
      },
    );
  }

  reativarTime(timeId: string, accessToken: string): Promise<ReativacaoTime> {
    return this.client.request<ReativacaoTime>(`/times/${timeId}/reativacao`, {
      method: 'POST',
      accessToken,
    });
  }

  buscarAtletaParaConvite(
    email: string,
    accessToken: string,
  ): Promise<AtletaParaConvite> {
    return this.client.request<AtletaParaConvite>(
      `/usuarios/busca-time?email=${encodeURIComponent(email)}`,
      { accessToken },
    );
  }

  enviarConvite(
    timeId: string,
    accessToken: string,
    usuarioDestinatarioId: string,
    idempotencyKey: string,
  ): Promise<ConviteTimeEnviado> {
    return this.client.request<ConviteTimeEnviado>(
      `/times/${timeId}/convites`,
      {
        method: 'POST',
        accessToken,
        headers: { 'Idempotency-Key': idempotencyKey },
        body: { usuarioDestinatarioId },
      },
    );
  }

  reenviarConvite(
    timeId: string,
    conviteId: string,
    accessToken: string,
    idempotencyKey: string,
  ): Promise<ReenvioConviteTime> {
    return this.client.request<ReenvioConviteTime>(
      `/times/${timeId}/convites/${conviteId}/reenvio`,
      {
        method: 'POST',
        accessToken,
        headers: { 'Idempotency-Key': idempotencyKey },
      },
    );
  }

  cancelarConvite(
    timeId: string,
    conviteId: string,
    accessToken: string,
  ): Promise<CancelamentoConviteTime> {
    return this.client.request<CancelamentoConviteTime>(
      `/times/${timeId}/convites/${conviteId}/cancelamento`,
      { method: 'POST', accessToken },
    );
  }

  enviarEscudo(
    timeId: string,
    accessToken: string,
    arquivo: File,
  ): Promise<RespostaEscudoTime> {
    const body = new FormData();
    body.set('arquivo', arquivo);
    return this.client.request<RespostaEscudoTime>(`/times/${timeId}/escudo`, {
      method: 'PUT',
      accessToken,
      body,
    });
  }

  removerEscudo(timeId: string, accessToken: string): Promise<void> {
    return this.client.request(`/times/${timeId}/escudo`, {
      method: 'DELETE',
      accessToken,
    });
  }

  atualizarTime(
    timeId: string,
    accessToken: string,
    input: AtualizacaoTime,
  ): Promise<RespostaAtualizacaoTime> {
    return this.client.request<RespostaAtualizacaoTime>(`/times/${timeId}`, {
      method: 'PATCH',
      accessToken,
      body: input,
    });
  }

  consultarTime(timeId: string): Promise<TimeDetalhado> {
    return this.client.request<TimeDetalhado>(`/times/${timeId}`);
  }

  listarElenco(
    timeId: string,
    pagina = 1,
    tamanho = 20,
  ): Promise<PaginaElenco> {
    return this.client.request<PaginaElenco>(
      `/times/${timeId}/elenco?page=${pagina}&size=${tamanho}`,
    );
  }

  listarTimes({
    nome,
    municipioId,
    uf,
    pagina = 1,
    tamanho = 20,
  }: FiltrosTimes = {}): Promise<PaginaTimes> {
    const query = new URLSearchParams();
    if (nome) query.set('nome', nome);
    if (municipioId) query.set('municipioId', municipioId);
    if (uf) query.set('uf', uf);
    query.set('page', String(pagina));
    query.set('size', String(tamanho));

    return this.client.request<PaginaTimes>(`/times?${query.toString()}`);
  }

  listarMeusConvites(
    accessToken: string,
    pagina = 1,
    tamanho = 20,
  ): Promise<PaginaConvitesTime> {
    const query = new URLSearchParams({
      page: String(pagina),
      size: String(tamanho),
    });
    return this.client.request<PaginaConvitesTime>(
      `/minha-conta/convites-time?${query.toString()}`,
      { accessToken },
    );
  }
}
