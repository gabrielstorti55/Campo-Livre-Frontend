import type { CampeonatosApi } from '@/services/campeonatos/campeonatos-api';
import type {
  AtualizacaoCampeonato,
  CampeonatoAdministrado,
  CampeonatoConsultado,
  CampeonatoCriado,
  CampeonatoPublicoResumo,
  ConfrontoManual,
  ConfiguracaoFase,
  ConfiguracaoRegulamento,
  ConviteCampeonatoEnviado,
  CriterioDesempate,
  CriacaoCampeonato,
  DetalheAdministrativoCampeonato,
  DistribuicaoCampeonato,
  ElencoContextualCampeonato,
  EstruturaMaterializadaCampeonato,
  FasesPersistidasCampeonato,
  FiltrosCampeonatosPublicos,
  FormatoCampeonato,
  OrganizadorCampeonato,
  Pagina,
  PaginaTimesParticipantes,
  PartidaManual,
  PosicaoManual,
  ResultadoValidacaoCampeonato,
  UsuarioElegivelOrganizador,
} from '@/types/api/campeonatos';

type ClienteCampeonatos = {
  request<T>(path: string, options?: Record<string, unknown>): Promise<T>;
};

export class CampeonatosHttp implements CampeonatosApi {
  constructor(private readonly client: ClienteCampeonatos) {}

  listarCampeonatosPublicos({
    pagina = 1,
    tamanho = 20,
    nome,
    municipioId,
    uf,
    status,
  }: FiltrosCampeonatosPublicos = {}): Promise<
    Pagina<CampeonatoPublicoResumo>
  > {
    const query = new URLSearchParams({
      pagina: String(pagina),
      tamanho: String(tamanho),
    });
    if (nome) query.set('nome', nome);
    if (municipioId) query.set('municipioId', municipioId);
    if (uf) query.set('uf', uf.toUpperCase());
    if (status) query.set('status', status);
    return this.client.request(`/campeonatos?${query.toString()}`);
  }

  listarCampeonatosAdministrados(
    accessToken: string,
    pagina = 1,
    tamanho = 20,
  ): Promise<Pagina<CampeonatoAdministrado>> {
    return this.client.request(
      `/minha-conta/campeonatos?pagina=${pagina}&tamanho=${tamanho}`,
      { accessToken },
    );
  }

  consultarAdministracao(
    campeonatoId: string,
    accessToken: string,
  ): Promise<DetalheAdministrativoCampeonato> {
    return this.client.request(
      `/campeonatos/${encodeURIComponent(campeonatoId)}/administracao`,
      { accessToken },
    );
  }

  criarCampeonato(
    accessToken: string,
    input: CriacaoCampeonato,
    idempotencyKey: string,
  ): Promise<CampeonatoCriado> {
    return this.client.request<CampeonatoCriado>('/campeonatos', {
      method: 'POST',
      accessToken,
      headers: { 'Idempotency-Key': idempotencyKey },
      body: input,
    });
  }

  consultarCampeonato(
    campeonatoId: string,
    accessToken?: string,
  ): Promise<CampeonatoConsultado> {
    return this.client.request<CampeonatoConsultado>(
      `/campeonatos/${campeonatoId}`,
      accessToken ? { accessToken } : undefined,
    );
  }

  atualizarCampeonato(
    campeonatoId: string,
    accessToken: string,
    input: AtualizacaoCampeonato,
  ) {
    return this.client.request<{
      id: string;
      nome: string;
      atualizadoEm: string;
    }>(`/campeonatos/${campeonatoId}`, {
      method: 'PATCH',
      accessToken,
      body: input,
    });
  }

  configurarRegulamento(
    campeonatoId: string,
    accessToken: string,
    input: ConfiguracaoRegulamento,
  ) {
    return this.client.request<{
      campeonatoId: string;
      versaoConfiguracao: number;
      atualizadoEm: string;
    }>(`/campeonatos/${campeonatoId}/regulamento`, {
      method: 'PUT',
      accessToken,
      body: input,
    });
  }

  configurarCriteriosDesempate(
    campeonatoId: string,
    faseId: string,
    accessToken: string,
    criterios: CriterioDesempate[],
  ) {
    return this.client.request<{
      faseId: string;
      criterios: CriterioDesempate[];
    }>(`/campeonatos/${campeonatoId}/fases/${faseId}/criterios-desempate`, {
      method: 'PUT',
      accessToken,
      body: { criterios },
    });
  }

  listarOrganizadores(
    campeonatoId: string,
    accessToken: string,
    pagina = 1,
    tamanho = 20,
    status?: 'ATIVO' | 'ENCERRADO',
  ): Promise<Pagina<OrganizadorCampeonato>> {
    const filtroStatus = status ? `&status=${status}` : '';
    return this.client.request(
      `/campeonatos/${encodeURIComponent(campeonatoId)}/organizadores?pagina=${pagina}&tamanho=${tamanho}${filtroStatus}`,
      { accessToken },
    );
  }

  buscarOrganizadorElegivel(
    campeonatoId: string,
    email: string,
    accessToken: string,
  ): Promise<Pagina<UsuarioElegivelOrganizador>> {
    return this.client.request(
      `/usuarios/busca-organizadores?email=${encodeURIComponent(email)}&campeonatoId=${encodeURIComponent(campeonatoId)}`,
      { accessToken },
    );
  }

  adicionarOrganizador(
    campeonatoId: string,
    usuarioId: string,
    accessToken: string,
  ) {
    return this.client.request<{
      organizadorId: string;
      usuarioId: string;
      funcao: 'ORGANIZADOR';
      status: 'ATIVO';
    }>(`/campeonatos/${campeonatoId}/organizadores`, {
      method: 'POST',
      accessToken,
      body: { usuarioId },
    });
  }

  removerOrganizador(
    campeonatoId: string,
    organizadorId: string,
    accessToken: string,
    motivo: string,
  ) {
    return this.client.request<{
      organizadorId: string;
      status: 'ENCERRADO';
      encerradoEm: string;
    }>(`/campeonatos/${campeonatoId}/organizadores/${organizadorId}/remocao`, {
      method: 'POST',
      accessToken,
      body: { motivo, confirmacao: true },
    });
  }

  validarConfiguracao(
    campeonatoId: string,
    accessToken: string,
  ): Promise<ResultadoValidacaoCampeonato> {
    return this.client.request<ResultadoValidacaoCampeonato>(
      `/campeonatos/${campeonatoId}/validacoes`,
      { method: 'POST', accessToken, body: {} },
    );
  }

  finalizarInscricoes(
    campeonatoId: string,
    accessToken: string,
    idempotencyKey: string,
  ) {
    return this.client.request<{
      id: string;
      status: 'AGUARDANDO_SORTEIO';
      inscricoesFinalizadasEm: string;
    }>(`/campeonatos/${campeonatoId}/finalizacao-inscricoes`, {
      method: 'POST',
      accessToken,
      headers: { 'Idempotency-Key': idempotencyKey },
      body: { confirmacao: true },
    });
  }

  iniciarCampeonato(campeonatoId: string, accessToken: string) {
    return this.client.request<{
      id: string;
      status: 'EM_ANDAMENTO';
      iniciadoEm: string;
    }>(`/campeonatos/${campeonatoId}/inicio`, {
      method: 'POST',
      accessToken,
      body: { confirmacao: true },
    });
  }

  encerrarCampeonato(campeonatoId: string, accessToken: string) {
    return this.client.request<{
      id: string;
      status: 'ENCERRADO';
      encerradoEm: string;
    }>(`/campeonatos/${campeonatoId}/encerramento`, {
      method: 'POST',
      accessToken,
      body: { confirmacao: true },
    });
  }

  cancelarCampeonato(
    campeonatoId: string,
    accessToken: string,
    motivo: string,
  ) {
    return this.client.request<{
      id: string;
      status: 'CANCELADO';
      canceladoEm: string;
    }>(`/campeonatos/${campeonatoId}/cancelamento`, {
      method: 'POST',
      accessToken,
      body: { motivo, confirmacao: true },
    });
  }

  listarTimesParticipantes(
    campeonatoId: string,
    accessToken?: string,
    pagina = 1,
    tamanho = 20,
  ): Promise<PaginaTimesParticipantes> {
    return this.client.request<PaginaTimesParticipantes>(
      `/campeonatos/${campeonatoId}/times?pagina=${pagina}&tamanho=${tamanho}`,
      accessToken ? { accessToken } : undefined,
    );
  }

  convidarTime(campeonatoId: string, timeId: string, accessToken: string) {
    return this.client.request<{
      conviteId: string;
      timeId: string;
      status: 'PENDENTE';
      expiraEm: string;
    }>(`/campeonatos/${campeonatoId}/convites`, {
      method: 'POST',
      accessToken,
      body: { timeId },
    });
  }

  cancelarConviteTime(
    campeonatoId: string,
    conviteId: string,
    accessToken: string,
  ) {
    return this.client.request<{
      conviteId: string;
      status: 'CANCELADO';
      canceladoEm: string;
    }>(`/campeonatos/${campeonatoId}/convites/${conviteId}/cancelamento`, {
      method: 'POST',
      accessToken,
      body: { confirmacao: true },
    });
  }

  listarConvitesEnviados(
    campeonatoId: string,
    accessToken: string,
    pagina = 1,
    tamanho = 20,
    status?: ConviteCampeonatoEnviado['status'],
  ): Promise<Pagina<ConviteCampeonatoEnviado>> {
    const filtroStatus = status ? `&status=${status}` : '';
    return this.client.request(
      `/campeonatos/${encodeURIComponent(campeonatoId)}/convites?pagina=${pagina}&tamanho=${tamanho}${filtroStatus}`,
      { accessToken },
    );
  }

  consultarElencoContextual(
    campeonatoId: string,
    timeId: string,
    accessToken: string,
  ): Promise<ElencoContextualCampeonato> {
    return this.client.request(
      `/campeonatos/${encodeURIComponent(campeonatoId)}/times/${encodeURIComponent(timeId)}/elenco`,
      { accessToken },
    );
  }

  selecionarEstruturaFases(
    campeonatoId: string,
    accessToken: string,
    input: { formato: FormatoCampeonato; fases: ConfiguracaoFase[] },
  ) {
    return this.client.request<{
      campeonatoId: string;
      versaoConfiguracao: number;
      fasesCriadas: number;
    }>(`/campeonatos/${campeonatoId}/estrutura-fases`, {
      method: 'PUT',
      accessToken,
      body: input,
    });
  }

  consultarFases(
    campeonatoId: string,
    accessToken?: string,
  ): Promise<FasesPersistidasCampeonato> {
    return this.client.request<FasesPersistidasCampeonato>(
      `/campeonatos/${campeonatoId}/fases`,
      accessToken ? { accessToken } : undefined,
    );
  }

  consultarDistribuicao(
    campeonatoId: string,
    accessToken: string,
  ): Promise<DistribuicaoCampeonato> {
    return this.client.request(
      `/campeonatos/${encodeURIComponent(campeonatoId)}/distribuicao`,
      { accessToken },
    );
  }

  consultarEstrutura(
    campeonatoId: string,
    accessToken: string,
    faseId?: string,
  ): Promise<EstruturaMaterializadaCampeonato> {
    const filtroFase = faseId ? `?faseId=${encodeURIComponent(faseId)}` : '';
    return this.client.request(
      `/campeonatos/${encodeURIComponent(campeonatoId)}/estrutura${filtroFase}`,
      { accessToken },
    );
  }

  distribuirTimes(
    campeonatoId: string,
    accessToken: string,
    modo: 'AUTOMATICA' | 'MANUAL',
    posicoesManuais: PosicaoManual[],
    idempotencyKey: string,
  ) {
    return this.client.request<{
      campeonatoId: string;
      modo: 'AUTOMATICA' | 'MANUAL';
      executadaEm: string;
    }>(`/campeonatos/${campeonatoId}/distribuicao`, {
      method: 'POST',
      accessToken,
      headers: { 'Idempotency-Key': idempotencyKey },
      body: { modo, posicoesManuais },
    });
  }

  materializarPontosCorridos(
    campeonatoId: string,
    accessToken: string,
    modo: 'AUTOMATICA' | 'MANUAL',
    partidasManuais: PartidaManual[],
    idempotencyKey: string,
  ) {
    return this.client.request<{
      campeonatoId: string;
      modo: 'AUTOMATICA' | 'MANUAL';
      partidasCriadas: number;
      estruturaGeradaEm: string;
    }>(`/campeonatos/${campeonatoId}/estrutura/pontos-corridos`, {
      method: 'POST',
      accessToken,
      headers: { 'Idempotency-Key': idempotencyKey },
      body: { modo, partidasManuais },
    });
  }

  materializarMataMata(
    campeonatoId: string,
    accessToken: string,
    modo: 'AUTOMATICA' | 'MANUAL',
    confrontosManuais: ConfrontoManual[],
    idempotencyKey: string,
  ) {
    return this.client.request<{
      campeonatoId: string;
      modo: 'AUTOMATICA' | 'MANUAL';
      confrontosCriados: number;
      estruturaGeradaEm: string;
    }>(`/campeonatos/${campeonatoId}/estrutura/mata-mata`, {
      method: 'POST',
      accessToken,
      headers: { 'Idempotency-Key': idempotencyKey },
      body: { modo, confrontosManuais },
    });
  }
}
