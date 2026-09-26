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
  ConviteCampeonatoRecebidoPrototipo,
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

export interface CampeonatosApi {
  listarCampeonatosPublicos(
    filtros?: FiltrosCampeonatosPublicos,
  ): Promise<Pagina<CampeonatoPublicoResumo>>;
  listarCampeonatosAdministrados(
    accessToken: string,
    pagina?: number,
    tamanho?: number,
  ): Promise<Pagina<CampeonatoAdministrado>>;
  consultarAdministracao(
    campeonatoId: string,
    accessToken: string,
  ): Promise<DetalheAdministrativoCampeonato>;
  criarCampeonato(
    accessToken: string,
    input: CriacaoCampeonato,
    idempotencyKey: string,
  ): Promise<CampeonatoCriado>;
  consultarCampeonato(
    campeonatoId: string,
    accessToken?: string,
  ): Promise<CampeonatoConsultado>;
  atualizarCampeonato(
    campeonatoId: string,
    accessToken: string,
    input: AtualizacaoCampeonato,
  ): Promise<{ id: string; nome: string; atualizadoEm: string }>;
  configurarRegulamento(
    campeonatoId: string,
    accessToken: string,
    input: ConfiguracaoRegulamento,
  ): Promise<{
    campeonatoId: string;
    versaoConfiguracao: number;
    atualizadoEm: string;
  }>;
  configurarCriteriosDesempate(
    campeonatoId: string,
    faseId: string,
    accessToken: string,
    criterios: CriterioDesempate[],
  ): Promise<{ faseId: string; criterios: CriterioDesempate[] }>;
  listarOrganizadores(
    campeonatoId: string,
    accessToken: string,
    pagina?: number,
    tamanho?: number,
    status?: 'ATIVO' | 'ENCERRADO',
  ): Promise<Pagina<OrganizadorCampeonato>>;
  buscarOrganizadorElegivel(
    campeonatoId: string,
    email: string,
    accessToken: string,
  ): Promise<Pagina<UsuarioElegivelOrganizador>>;
  adicionarOrganizador(
    campeonatoId: string,
    usuarioId: string,
    accessToken: string,
  ): Promise<{
    organizadorId: string;
    usuarioId: string;
    funcao: 'ORGANIZADOR';
    status: 'ATIVO';
  }>;
  removerOrganizador(
    campeonatoId: string,
    organizadorId: string,
    accessToken: string,
    motivo: string,
  ): Promise<{
    organizadorId: string;
    status: 'ENCERRADO';
    encerradoEm: string;
  }>;
  validarConfiguracao(
    campeonatoId: string,
    accessToken: string,
  ): Promise<ResultadoValidacaoCampeonato>;
  finalizarInscricoes(
    campeonatoId: string,
    accessToken: string,
    idempotencyKey: string,
  ): Promise<{
    id: string;
    status: 'AGUARDANDO_SORTEIO';
    inscricoesFinalizadasEm: string;
  }>;
  iniciarCampeonato(
    campeonatoId: string,
    accessToken: string,
  ): Promise<{ id: string; status: 'EM_ANDAMENTO'; iniciadoEm: string }>;
  encerrarCampeonato(
    campeonatoId: string,
    accessToken: string,
  ): Promise<{ id: string; status: 'ENCERRADO'; encerradoEm: string }>;
  cancelarCampeonato(
    campeonatoId: string,
    accessToken: string,
    motivo: string,
  ): Promise<{ id: string; status: 'CANCELADO'; canceladoEm: string }>;
  listarTimesParticipantes(
    campeonatoId: string,
    accessToken?: string,
    pagina?: number,
    tamanho?: number,
  ): Promise<PaginaTimesParticipantes>;
  convidarTime(
    campeonatoId: string,
    timeId: string,
    accessToken: string,
  ): Promise<{
    conviteId: string;
    timeId: string;
    status: 'PENDENTE';
    expiraEm: string;
  }>;
  cancelarConviteTime(
    campeonatoId: string,
    conviteId: string,
    accessToken: string,
  ): Promise<{ conviteId: string; status: 'CANCELADO'; canceladoEm: string }>;
  listarConvitesEnviados(
    campeonatoId: string,
    accessToken: string,
    pagina?: number,
    tamanho?: number,
    status?: ConviteCampeonatoEnviado['status'],
  ): Promise<Pagina<ConviteCampeonatoEnviado>>;
  listarConvitesRecebidosComoCapitao?(
    accessToken: string,
    pagina?: number,
    tamanho?: number,
  ): Promise<Pagina<ConviteCampeonatoRecebidoPrototipo>>;
  responderConviteCampeonato?(
    conviteId: string,
    acao: 'ACEITAR' | 'RECUSAR',
    accessToken: string,
  ): Promise<{
    conviteId: string;
    status: 'ACEITO' | 'RECUSADO';
    encerradoEm: string;
  }>;
  consultarElencoContextual(
    campeonatoId: string,
    timeId: string,
    accessToken: string,
  ): Promise<ElencoContextualCampeonato>;
  selecionarEstruturaFases(
    campeonatoId: string,
    accessToken: string,
    input: { formato: FormatoCampeonato; fases: ConfiguracaoFase[] },
  ): Promise<{
    campeonatoId: string;
    versaoConfiguracao: number;
    fasesCriadas: number;
  }>;
  consultarFases(
    campeonatoId: string,
    accessToken?: string,
  ): Promise<FasesPersistidasCampeonato>;
  consultarDistribuicao(
    campeonatoId: string,
    accessToken: string,
  ): Promise<DistribuicaoCampeonato>;
  consultarEstrutura(
    campeonatoId: string,
    accessToken: string,
    faseId?: string,
  ): Promise<EstruturaMaterializadaCampeonato>;
  distribuirTimes(
    campeonatoId: string,
    accessToken: string,
    modo: 'AUTOMATICA' | 'MANUAL',
    posicoesManuais: PosicaoManual[],
    idempotencyKey: string,
  ): Promise<{
    campeonatoId: string;
    modo: 'AUTOMATICA' | 'MANUAL';
    executadaEm: string;
  }>;
  materializarPontosCorridos(
    campeonatoId: string,
    accessToken: string,
    modo: 'AUTOMATICA' | 'MANUAL',
    partidasManuais: PartidaManual[],
    idempotencyKey: string,
  ): Promise<{
    campeonatoId: string;
    modo: 'AUTOMATICA' | 'MANUAL';
    partidasCriadas: number;
    estruturaGeradaEm: string;
  }>;
  materializarMataMata(
    campeonatoId: string,
    accessToken: string,
    modo: 'AUTOMATICA' | 'MANUAL',
    confrontosManuais: ConfrontoManual[],
    idempotencyKey: string,
  ): Promise<{
    campeonatoId: string;
    modo: 'AUTOMATICA' | 'MANUAL';
    confrontosCriados: number;
    estruturaGeradaEm: string;
  }>;
}
