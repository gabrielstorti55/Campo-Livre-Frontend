import type { CampeonatosApi } from '@/services/campeonatos/campeonatos-api';
import {
  atletasPublicosMock,
  campeonatosPublicosMock,
  timesPublicosMock,
} from '@/mocks/publico/dados-publicos';
import {
  campeonatosOrganizadorMock,
  vinculosCampeonatoOrganizadorMock,
} from '@/mocks/organizador/dados-organizador';
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

function serializarPayloadCanonico(valor: unknown): string {
  if (Array.isArray(valor)) {
    return `[${valor.map(serializarPayloadCanonico).join(',')}]`;
  }
  if (valor && typeof valor === 'object') {
    return `{${Object.entries(valor)
      .sort(([chaveA], [chaveB]) => chaveA.localeCompare(chaveB))
      .map(
        ([chave, item]) =>
          `${JSON.stringify(chave)}:${serializarPayloadCanonico(item)}`,
      )
      .join(',')}}`;
  }
  return JSON.stringify(valor);
}

function obterTimePublico(timeId: string | number) {
  return timesPublicosMock.find((time) => time.id === Number(timeId));
}

const atletasPorId = new Map(
  atletasPublicosMock.map((atleta) => [atleta.id, atleta]),
);

const elencosCampeonatoMock: Readonly<Record<string, readonly string[]>> =
  Object.fromEntries(
    timesPublicosMock.map((time) => [
      String(time.id),
      time.atletaIds.flatMap((atletaId) => {
        const atleta = atletasPorId.get(atletaId);
        return atleta ? [atleta.nome] : [];
      }),
    ]),
  );

export class CampeonatosPrototipo implements CampeonatosApi {
  private readonly payloadsIdempotentes = new Map<string, string>();
  private readonly respostas = new Map<string, CampeonatoCriado>();
  private readonly respostasFinalizacao = new Map<
    string,
    {
      id: string;
      status: 'AGUARDANDO_SORTEIO';
      inscricoesFinalizadasEm: string;
    }
  >();
  private readonly respostasDistribuicao = new Map<
    string,
    { campeonatoId: string; modo: 'AUTOMATICA' | 'MANUAL'; executadaEm: string }
  >();
  private readonly respostasPontosCorridos = new Map<
    string,
    {
      campeonatoId: string;
      modo: 'AUTOMATICA' | 'MANUAL';
      partidasCriadas: number;
      estruturaGeradaEm: string;
    }
  >();
  private readonly respostasMataMata = new Map<
    string,
    {
      campeonatoId: string;
      modo: 'AUTOMATICA' | 'MANUAL';
      confrontosCriados: number;
      estruturaGeradaEm: string;
    }
  >();
  private readonly fasesPorCampeonato = new Map<string, ConfiguracaoFase[]>();
  private readonly convitesPorCampeonato = new Map<
    string,
    ConviteCampeonatoEnviado[]
  >();
  private proximoConviteId = 0;
  private readonly organizadoresPorCampeonato = new Map<
    string,
    OrganizadorCampeonato[]
  >();
  private readonly distribuicoesPorCampeonato = new Map<
    string,
    DistribuicaoCampeonato
  >();
  private readonly estruturasPorCampeonato = new Map<
    string,
    EstruturaMaterializadaCampeonato
  >();
  private readonly fasesMaterializadasPorCampeonato = new Map<
    string,
    Set<string>
  >();
  private sequencia = Math.max(
    0,
    ...campeonatosOrganizadorMock.map((campeonato) => campeonato.id),
  );

  constructor(
    private readonly obterContaAtivaId: (accessToken: string) => string | null,
  ) {}

  private respostaIdempotente<T>(
    chave: string,
    payload: unknown,
    respostas: Map<string, T>,
  ): T | undefined {
    if (!respostas.has(chave)) return undefined;
    if (
      this.payloadsIdempotentes.get(chave) !==
      serializarPayloadCanonico(payload)
    ) {
      throw new Error('IDEMPOTENCY_KEY_REUTILIZADA');
    }
    return respostas.get(chave);
  }

  private registrarRespostaIdempotente<T>(
    chave: string,
    payload: unknown,
    resposta: T,
    respostas: Map<string, T>,
  ): void {
    this.payloadsIdempotentes.set(chave, serializarPayloadCanonico(payload));
    respostas.set(chave, resposta);
  }

  async listarCampeonatosPublicos({
    pagina = 1,
    tamanho = 20,
    nome,
    municipioId,
    uf,
    status,
  }: FiltrosCampeonatosPublicos = {}): Promise<
    Pagina<CampeonatoPublicoResumo>
  > {
    const termo = nome?.trim().toLocaleLowerCase('pt-BR') ?? '';
    const municipioPorNome: Record<string, string> = {
      Franca: '00000000-0000-4000-8000-000000000001',
      Batatais: '00000000-0000-4000-8000-000000000002',
    };
    const itens = campeonatosPublicosMock
      .filter(
        (item) =>
          item.publicado &&
          ['EM_ANDAMENTO', 'ENCERRADO', 'CANCELADO'].includes(item.estado) &&
          (!termo || item.nome.toLocaleLowerCase('pt-BR').includes(termo)) &&
          (!municipioId || municipioPorNome[item.municipio] === municipioId) &&
          (!uf || item.uf === uf.trim().toUpperCase()) &&
          (!status || item.estado === status),
      )
      .map((item) => ({
        id: String(item.id),
        nome: item.nome,
        status: item.estado as CampeonatoPublicoResumo['status'],
        municipio: {
          id: municipioPorNome[item.municipio] ?? `municipio-${item.id}`,
          nome: item.municipio,
          uf: item.uf,
        },
      }))
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    const inicio = (pagina - 1) * tamanho;

    return {
      itens: itens.slice(inicio, inicio + tamanho),
      pagina,
      tamanho,
      totalItens: itens.length,
      totalPaginas: Math.ceil(itens.length / tamanho),
    };
  }

  private autenticar(accessToken: string) {
    const contaId = this.obterContaAtivaId(accessToken);
    if (!contaId) throw new Error('NAO_AUTENTICADO');
    return contaId;
  }

  private obter(campeonatoId: string) {
    const campeonato = campeonatosOrganizadorMock.find(
      (item) => item.id === Number(campeonatoId),
    );
    if (!campeonato) throw new Error('RECURSO_NAO_ENCONTRADO');
    return campeonato;
  }

  private autorizar(
    campeonatoId: string,
    accessToken: string,
    permissao: 'CONSULTAR' | 'EDITAR' | 'GERENCIAR_EQUIPE' = 'CONSULTAR',
  ) {
    const contaId = this.autenticar(accessToken);
    const campeonato = this.obter(campeonatoId);
    const vinculo = vinculosCampeonatoOrganizadorMock.find(
      (item) =>
        item.campeonatoId === Number(campeonatoId) && item.contaId === contaId,
    );
    if (!vinculo) throw new Error('NAO_AUTORIZADO');
    if (permissao === 'GERENCIAR_EQUIPE' && vinculo.papel !== 'RESPONSAVEL') {
      throw new Error('PERMISSAO_INSUFICIENTE');
    }
    return { campeonato, vinculo };
  }

  private chaveIdempotencia(
    contaId: string,
    operacao: string,
    idempotencyKey: string,
    campeonatoId?: string,
  ) {
    return [contaId, campeonatoId ?? '', operacao, idempotencyKey].join('|');
  }

  private autorizarOperacao(
    campeonatoId: string,
    accessToken: string,
    operacao: string,
    apenasResponsavel = false,
  ) {
    const autorizado = this.autorizar(campeonatoId, accessToken);
    const responsavel = autorizado.vinculo.papel === 'RESPONSAVEL';
    if (apenasResponsavel && !responsavel) {
      throw new Error('PERMISSAO_INSUFICIENTE');
    }
    if (
      !this.operacoesDoCampeonato(
        autorizado.campeonato.estado,
        responsavel,
        campeonatoId,
      ).includes(operacao)
    ) {
      throw new Error('OPERACAO_NAO_PERMITIDA');
    }
    return { ...autorizado, contaId: autorizado.vinculo.contaId };
  }

  private permissoesDoVinculo(responsavel: boolean) {
    return [
      'CONSULTAR_CONFIGURACAO',
      'EDITAR_DADOS',
      ...(responsavel ? ['GERENCIAR_EQUIPE'] : []),
      'GERENCIAR_CONVITES',
      'CONFIGURAR_ESTRUTURA',
      'REGISTRAR_RESULTADOS',
    ];
  }

  private operacoesDoCampeonato(
    estado: string,
    responsavel: boolean,
    campeonatoId?: string,
  ): string[] {
    const estadoCanonico =
      estado === 'EM_CONFIGURACAO' ? 'EM_INSCRICOES' : estado;
    const operacoes =
      estadoCanonico === 'EM_INSCRICOES'
        ? [
            'ATUALIZAR',
            'VALIDAR_CONFIGURACAO',
            'FINALIZAR_INSCRICOES',
            'CONVIDAR_TIME',
            'CONFIGURAR_ESTRUTURA',
          ]
        : estadoCanonico === 'AGUARDANDO_SORTEIO'
          ? [
              'ATUALIZAR',
              'GERAR_ESTRUTURA',
              ...(campeonatoId &&
              this.estruturasPorCampeonato.get(campeonatoId)?.estado ===
                'GERADA'
                ? ['INICIAR_CAMPEONATO']
                : []),
            ]
          : estadoCanonico === 'EM_ANDAMENTO'
            ? ['ATUALIZAR', 'ENCERRAR_CAMPEONATO']
            : [];
    if (
      responsavel &&
      estadoCanonico !== 'ENCERRADO' &&
      estadoCanonico !== 'CANCELADO'
    ) {
      operacoes.push(
        'ADICIONAR_ORGANIZADOR',
        'REMOVER_ORGANIZADOR',
        'CANCELAR',
      );
    }
    return operacoes;
  }

  async listarCampeonatosAdministrados(
    accessToken: string,
    pagina = 1,
    tamanho = 20,
  ): Promise<Pagina<CampeonatoAdministrado>> {
    const contaId = this.autenticar(accessToken);
    const todos = vinculosCampeonatoOrganizadorMock
      .filter((vinculo) => vinculo.contaId === contaId)
      .map((vinculo) => {
        const campeonato = this.obter(String(vinculo.campeonatoId));
        return {
          campeonatoId: String(campeonato.id),
          nome: campeonato.nome,
          status:
            campeonato.estado === 'EM_CONFIGURACAO'
              ? ('EM_INSCRICOES' as const)
              : campeonato.estado,
          contexto: campeonato.contexto.tipo,
          prefeitura:
            campeonato.contexto.tipo === 'PREFEITURA'
              ? {
                  id: campeonato.contexto.prefeituraId,
                  nome: campeonato.contexto.nome,
                }
              : null,
          vinculo: {
            funcao: vinculo.papel,
            status: 'ATIVO' as const,
          },
          permissoes: this.permissoesDoVinculo(vinculo.papel === 'RESPONSAVEL'),
          atualizadoEm: new Date().toISOString(),
        };
      });
    const inicio = (pagina - 1) * tamanho;
    return {
      itens: todos.slice(inicio, inicio + tamanho),
      pagina,
      tamanho,
      totalItens: todos.length,
      totalPaginas: Math.ceil(todos.length / tamanho),
    };
  }

  async consultarAdministracao(
    campeonatoId: string,
    accessToken: string,
  ): Promise<DetalheAdministrativoCampeonato> {
    const { campeonato, vinculo } = this.autorizar(campeonatoId, accessToken);
    const responsavel = vinculo.papel === 'RESPONSAVEL';
    return {
      campeonatoId,
      nome: campeonato.nome,
      descricao: null,
      status:
        campeonato.estado === 'EM_CONFIGURACAO'
          ? 'EM_INSCRICOES'
          : campeonato.estado,
      formato:
        campeonato.formato === 'GRUPOS_MATA_MATA'
          ? 'GRUPOS_E_MATA_MATA'
          : campeonato.formato,
      contexto: campeonato.contexto.tipo,
      prefeituraId:
        campeonato.contexto.tipo === 'PREFEITURA'
          ? campeonato.contexto.prefeituraId
          : null,
      municipioId: '00000000-0000-4000-8000-000000000001',
      inicioPrevistoEm: campeonato.inicio,
      fimPrevistoEm: null,
      situacaoComercial: 'AUTORIZADO',
      configuracao: {
        limiteTimes: 32,
        limiteAtletasPorTime: 25,
        quantidadeTurnos: 1,
        versao: 3,
        valida: campeonato.pendencias.length === 0,
        pendencias: campeonato.pendencias,
      },
      autoridade: {
        funcao: responsavel ? 'RESPONSAVEL' : 'ORGANIZADOR',
        permissoes: this.permissoesDoVinculo(responsavel),
      },
      operacoesPermitidas: this.operacoesDoCampeonato(
        campeonato.estado,
        responsavel,
        campeonatoId,
      ),
    };
  }

  async listarOrganizadores(
    campeonatoId: string,
    accessToken: string,
    pagina = 1,
    tamanho = 20,
    _status?: 'ATIVO' | 'ENCERRADO',
  ): Promise<Pagina<OrganizadorCampeonato>> {
    const { campeonato } = this.autorizar(campeonatoId, accessToken);
    const identidades: Record<string, { nome: string; nomeUsuario: string }> = {
      'mock-person-1': {
        nome: 'Marcos Oliveira',
        nomeUsuario: 'marcosoliveira',
      },
      'mock-person-unlinked-1': {
        nome: 'Lucas Ferreira',
        nomeUsuario: 'lucasferreira',
      },
      'mock-person-collaborator-1': {
        nome: 'Juliana Lopes',
        nomeUsuario: 'julianalopes',
      },
      'mock-person-athlete-1': {
        nome: 'Diego Souza',
        nomeUsuario: 'diegosouza',
      },
      'conta-prefeitura': {
        nome: 'Gestora Municipal',
        nomeUsuario: 'gestoramunicipal',
      },
    };
    const responsavel = identidades[campeonato.responsavel] ?? {
      nome: 'Responsável pelo campeonato',
      nomeUsuario: 'responsavel',
    };
    const todos: OrganizadorCampeonato[] = [
      {
        organizadorId: `responsavel-${campeonatoId}`,
        usuario: {
          id: campeonato.responsavel,
          nome: responsavel.nome,
          nomeUsuario: responsavel.nomeUsuario,
        },
        funcao: 'RESPONSAVEL' as const,
        status: 'ATIVO' as const,
        adicionadoEm: new Date().toISOString(),
        encerradoEm: null,
        podeSerRemovido: false,
      },
      ...(this.organizadoresPorCampeonato.get(campeonatoId) ?? []),
    ].filter((organizador) => !_status || organizador.status === _status);
    const inicio = (pagina - 1) * tamanho;
    return {
      itens: todos.slice(inicio, inicio + tamanho),
      pagina,
      tamanho,
      totalItens: todos.length,
      totalPaginas: Math.ceil(todos.length / tamanho),
    };
  }

  async buscarOrganizadorElegivel(
    campeonatoId: string,
    email: string,
    accessToken: string,
  ): Promise<Pagina<UsuarioElegivelOrganizador>> {
    this.autorizarOperacao(
      campeonatoId,
      accessToken,
      'ADICIONAR_ORGANIZADOR',
      true,
    );
    const itens = email.includes('@')
      ? [
          {
            usuarioId: `usuario-${email}`,
            nome: 'Pessoa do protótipo',
            nomeUsuario: email.split('@')[0] ?? email,
            elegivel: true as const,
          },
        ]
      : [];
    return {
      itens,
      pagina: 1,
      tamanho: 1,
      totalItens: itens.length,
      totalPaginas: itens.length,
    };
  }

  async consultarCampeonato(
    campeonatoId: string,
    accessToken?: string,
  ): Promise<CampeonatoConsultado> {
    if (accessToken) this.autenticar(accessToken);
    const campeonato = this.obter(campeonatoId);
    const status =
      campeonato.estado === 'EM_CONFIGURACAO'
        ? 'EM_INSCRICOES'
        : campeonato.estado;
    return {
      id: String(campeonato.id),
      nome: campeonato.nome,
      status,
      formato:
        campeonato.formato === 'GRUPOS_MATA_MATA'
          ? 'GRUPOS_E_MATA_MATA'
          : campeonato.formato,
      municipio: {
        id: '00000000-0000-4000-8000-000000000001',
        nome: campeonato.municipio,
        uf: campeonato.uf,
      },
    };
  }

  async atualizarCampeonato(
    campeonatoId: string,
    accessToken: string,
    input: AtualizacaoCampeonato,
  ) {
    const { campeonato } = this.autorizarOperacao(
      campeonatoId,
      accessToken,
      'ATUALIZAR',
    );
    campeonato.nome = input.nome;
    campeonato.inicio = input.inicioPrevistoEm;
    return {
      id: campeonatoId,
      nome: input.nome,
      atualizadoEm: new Date().toISOString(),
    };
  }

  async configurarRegulamento(
    campeonatoId: string,
    accessToken: string,
    _input: ConfiguracaoRegulamento,
  ) {
    this.autorizarOperacao(campeonatoId, accessToken, 'CONFIGURAR_ESTRUTURA');
    return {
      campeonatoId,
      versaoConfiguracao: 2,
      atualizadoEm: new Date().toISOString(),
    };
  }

  async configurarCriteriosDesempate(
    campeonatoId: string,
    faseId: string,
    accessToken: string,
    criterios: CriterioDesempate[],
  ) {
    this.autorizarOperacao(campeonatoId, accessToken, 'CONFIGURAR_ESTRUTURA');
    return { faseId, criterios };
  }

  async adicionarOrganizador(
    campeonatoId: string,
    usuarioId: string,
    accessToken: string,
  ) {
    this.autorizarOperacao(
      campeonatoId,
      accessToken,
      'ADICIONAR_ORGANIZADOR',
      true,
    );
    const resposta = {
      organizadorId: `organizador-${usuarioId}`,
      usuarioId,
      funcao: 'ORGANIZADOR' as const,
      status: 'ATIVO' as const,
    };
    const organizadores =
      this.organizadoresPorCampeonato.get(campeonatoId) ?? [];
    if (
      !organizadores.some(
        (item) => item.organizadorId === resposta.organizadorId,
      )
    ) {
      organizadores.push({
        organizadorId: resposta.organizadorId,
        usuario: { id: usuarioId, nome: usuarioId, nomeUsuario: usuarioId },
        funcao: 'ORGANIZADOR',
        status: 'ATIVO',
        adicionadoEm: new Date().toISOString(),
        encerradoEm: null,
        podeSerRemovido: true,
      });
      this.organizadoresPorCampeonato.set(campeonatoId, organizadores);
      vinculosCampeonatoOrganizadorMock.push({
        contaId: usuarioId,
        campeonatoId: Number(campeonatoId),
        papel: 'ORGANIZADOR',
      });
    }
    return resposta;
  }

  async removerOrganizador(
    campeonatoId: string,
    organizadorId: string,
    accessToken: string,
    _motivo: string,
  ) {
    this.autorizarOperacao(
      campeonatoId,
      accessToken,
      'REMOVER_ORGANIZADOR',
      true,
    );
    const organizador = (
      this.organizadoresPorCampeonato.get(campeonatoId) ?? []
    ).find(
      (item) => item.organizadorId === organizadorId && item.status === 'ATIVO',
    );
    if (!organizador) throw new Error('RECURSO_NAO_ENCONTRADO');
    const encerradoEm = new Date().toISOString();
    organizador.status = 'ENCERRADO';
    organizador.encerradoEm = encerradoEm;
    organizador.podeSerRemovido = false;
    const indiceVinculo = vinculosCampeonatoOrganizadorMock.findIndex(
      (item) =>
        item.campeonatoId === Number(campeonatoId) &&
        item.contaId === organizador.usuario.id &&
        item.papel === 'ORGANIZADOR',
    );
    if (indiceVinculo >= 0)
      vinculosCampeonatoOrganizadorMock.splice(indiceVinculo, 1);
    return { organizadorId, status: 'ENCERRADO' as const, encerradoEm };
  }

  async validarConfiguracao(
    campeonatoId: string,
    accessToken: string,
  ): Promise<ResultadoValidacaoCampeonato> {
    const { campeonato } = this.autorizarOperacao(
      campeonatoId,
      accessToken,
      'VALIDAR_CONFIGURACAO',
    );
    return {
      valido: campeonato.pendencias.length === 0,
      erros: campeonato.pendencias.map((mensagem) => ({
        codigo: 'CONFIGURACAO_PENDENTE',
        mensagem,
      })),
      versaoConfiguracao: 3,
    };
  }

  async finalizarInscricoes(
    campeonatoId: string,
    accessToken: string,
    idempotencyKey: string,
  ) {
    const autorizado = this.autorizar(campeonatoId, accessToken);
    const chave = this.chaveIdempotencia(
      autorizado.vinculo.contaId,
      'FINALIZAR_INSCRICOES',
      idempotencyKey,
      campeonatoId,
    );
    const payload = { confirmacao: true };
    const anterior = this.respostaIdempotente(
      chave,
      payload,
      this.respostasFinalizacao,
    );
    if (anterior) return anterior;
    const { campeonato } = this.autorizarOperacao(
      campeonatoId,
      accessToken,
      'FINALIZAR_INSCRICOES',
    );
    if (campeonato.pendencias.length > 0) {
      throw new Error('CONFIGURACAO_INVALIDA');
    }
    campeonato.estado = 'AGUARDANDO_SORTEIO';
    const resposta = {
      id: campeonatoId,
      status: 'AGUARDANDO_SORTEIO' as const,
      inscricoesFinalizadasEm: new Date().toISOString(),
    };
    this.registrarRespostaIdempotente(
      chave,
      payload,
      resposta,
      this.respostasFinalizacao,
    );
    return resposta;
  }

  async iniciarCampeonato(campeonatoId: string, accessToken: string) {
    const { campeonato } = this.autorizarOperacao(
      campeonatoId,
      accessToken,
      'INICIAR_CAMPEONATO',
    );
    campeonato.estado = 'EM_ANDAMENTO';
    return {
      id: campeonatoId,
      status: 'EM_ANDAMENTO' as const,
      iniciadoEm: new Date().toISOString(),
    };
  }

  async encerrarCampeonato(campeonatoId: string, accessToken: string) {
    const { campeonato } = this.autorizarOperacao(
      campeonatoId,
      accessToken,
      'ENCERRAR_CAMPEONATO',
    );
    campeonato.estado = 'ENCERRADO';
    return {
      id: campeonatoId,
      status: 'ENCERRADO' as const,
      encerradoEm: new Date().toISOString(),
    };
  }

  async cancelarCampeonato(
    campeonatoId: string,
    accessToken: string,
    _motivo: string,
  ) {
    const { campeonato } = this.autorizarOperacao(
      campeonatoId,
      accessToken,
      'CANCELAR',
      true,
    );
    campeonato.estado = 'CANCELADO';
    return {
      id: campeonatoId,
      status: 'CANCELADO' as const,
      canceladoEm: new Date().toISOString(),
    };
  }

  async criarCampeonato(
    accessToken: string,
    input: CriacaoCampeonato,
    idempotencyKey: string,
  ): Promise<CampeonatoCriado> {
    const contaId = this.obterContaAtivaId(accessToken);
    if (!contaId) throw new Error('NAO_AUTENTICADO');
    const chave = this.chaveIdempotencia(contaId, 'CRIAR', idempotencyKey);
    const anterior = this.respostaIdempotente(chave, input, this.respostas);
    if (anterior) return anterior;

    this.sequencia += 1;
    const prefeitura = input.contexto === 'PREFEITURA';
    const resposta: CampeonatoCriado = {
      id: String(this.sequencia),
      status: 'EM_INSCRICOES',
      responsavelUsuarioId: contaId,
      situacaoComercial: 'AUTORIZADO',
      origemAutorizacao: prefeitura ? 'ISENTO_PREFEITURA' : 'BENEFICIO',
      pagamentoNecessario: false,
    };
    const idNumerico = Number(resposta.id);
    campeonatosOrganizadorMock.push({
      id: idNumerico,
      nome: input.nome,
      modalidade: 'Futebol',
      formato:
        input.formato === 'GRUPOS_E_MATA_MATA'
          ? 'GRUPOS_MATA_MATA'
          : input.formato,
      municipio: 'Franca',
      uf: 'SP',
      inicio: input.inicioPrevistoEm,
      visibilidade: 'PUBLICO',
      estado: 'EM_INSCRICOES',
      contexto:
        input.contexto === 'PREFEITURA' && input.prefeituraId
          ? {
              tipo: 'PREFEITURA',
              nome: 'Prefeitura de Franca',
              prefeituraId: input.prefeituraId,
            }
          : {
              tipo: 'PESSOAL',
              nome:
                contaId === 'mock-person-unlinked-1'
                  ? 'Lucas Ferreira'
                  : contaId === 'mock-person-collaborator-1'
                    ? 'Juliana Lopes'
                    : contaId === 'mock-person-1'
                      ? 'Marcos Oliveira'
                      : 'Organização pessoal',
            },
      responsavel: contaId,
      timeIds: [],
      partidaIds: [],
      pendencias: [],
      convitesPendentes: 0,
    });
    vinculosCampeonatoOrganizadorMock.push({
      contaId,
      campeonatoId: idNumerico,
      papel: 'RESPONSAVEL',
    });
    this.registrarRespostaIdempotente(chave, input, resposta, this.respostas);
    return resposta;
  }

  async listarTimesParticipantes(
    campeonatoId: string,
    accessToken?: string,
    pagina = 1,
    tamanho = 20,
  ): Promise<PaginaTimesParticipantes> {
    if (accessToken) this.autenticar(accessToken);
    const campeonato = this.obter(campeonatoId);
    const todos = campeonato.timeIds.map((timeId, indice) => {
      const time = obterTimePublico(timeId);
      return {
        timeId: String(timeId),
        nome: time?.nome ?? `Time ${timeId}`,
        sigla: time?.escudo ?? `T${String(timeId).padStart(2, '0')}`,
        escudoUrl: null,
        statusParticipacao: 'ATIVO' as const,
        ordemInscricao: indice + 1,
      };
    });
    const inicio = (pagina - 1) * tamanho;
    return {
      itens: todos.slice(inicio, inicio + tamanho),
      pagina,
      tamanho,
      totalItens: todos.length,
      totalPaginas: Math.ceil(todos.length / tamanho),
    };
  }

  async convidarTime(
    campeonatoId: string,
    timeId: string,
    accessToken: string,
  ) {
    this.autorizarOperacao(campeonatoId, accessToken, 'CONVIDAR_TIME');
    const time = obterTimePublico(timeId);
    const convite = {
      conviteId: `convite-${campeonatoId}-${timeId}-${++this.proximoConviteId}`,
      timeId,
      status: 'PENDENTE' as const,
      expiraEm: new Date(Date.now() + 7 * 86400000).toISOString(),
    };
    const enviados = this.convitesPorCampeonato.get(campeonatoId) ?? [];
    if (
      enviados.some(
        (item) =>
          item.time.id === timeId &&
          (item.status === 'PENDENTE' || item.status === 'ACEITO'),
      )
    ) {
      throw new Error('TIME_JA_CONVIDADO');
    }
    enviados.push({
      conviteId: convite.conviteId,
      time: {
        id: timeId,
        nome: time?.nome ?? `Time ${timeId}`,
        sigla: time?.escudo ?? 'TIM',
      },
      destinatario: {
        usuarioId: `capitao-${timeId}`,
        nome:
          timeId === '1'
            ? 'Marcos Oliveira'
            : timeId === '2'
              ? 'Henrique Alves'
              : `Capitão do ${time?.nome ?? 'time'}`,
      },
      status: 'PENDENTE',
      enviadoEm: new Date().toISOString(),
      expiraEm: convite.expiraEm,
      encerradoEm: null,
      podeCancelar: true,
    });
    this.convitesPorCampeonato.set(campeonatoId, enviados);
    return convite;
  }

  async cancelarConviteTime(
    campeonatoId: string,
    conviteId: string,
    accessToken: string,
  ) {
    this.autorizarOperacao(campeonatoId, accessToken, 'CONVIDAR_TIME');
    const convite = (this.convitesPorCampeonato.get(campeonatoId) ?? []).find(
      (item) => item.conviteId === conviteId && item.status === 'PENDENTE',
    );
    if (!convite) throw new Error('RECURSO_NAO_ENCONTRADO');
    const canceladoEm = new Date().toISOString();
    convite.status = 'CANCELADO';
    convite.encerradoEm = canceladoEm;
    convite.podeCancelar = false;
    return { conviteId, status: 'CANCELADO' as const, canceladoEm };
  }

  async listarConvitesEnviados(
    campeonatoId: string,
    accessToken: string,
    pagina = 1,
    tamanho = 20,
    status?: ConviteCampeonatoEnviado['status'],
  ): Promise<Pagina<ConviteCampeonatoEnviado>> {
    this.autorizar(campeonatoId, accessToken);
    const todos = (this.convitesPorCampeonato.get(campeonatoId) ?? []).filter(
      (convite) => !status || convite.status === status,
    );
    const inicio = (pagina - 1) * tamanho;
    return {
      itens: todos.slice(inicio, inicio + tamanho),
      pagina,
      tamanho,
      totalItens: todos.length,
      totalPaginas: Math.ceil(todos.length / tamanho),
    };
  }

  async consultarElencoContextual(
    campeonatoId: string,
    timeId: string,
    accessToken: string,
  ): Promise<ElencoContextualCampeonato> {
    this.autorizar(campeonatoId, accessToken);
    const time = obterTimePublico(timeId);
    const nomesAtletas = elencosCampeonatoMock[timeId] ?? [];
    const atletas = nomesAtletas.map((nome, indice) => ({
      atletaCampeonatoId: `atleta-campeonato-${campeonatoId}-${timeId}-${indice + 1}`,
      membroTimeId: `membro-${timeId}-${indice + 1}`,
      nomeUsuario: nome
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/\s+/g, ''),
      nomeExibicao: nome,
      status: 'ATIVO' as const,
      inscritoEm: '2026-08-10T12:00:00.000Z',
    }));
    return {
      campeonatoId,
      time: {
        id: timeId,
        nome: time?.nome ?? `Time ${timeId}`,
        sigla: time?.escudo ?? 'TIM',
        statusParticipacao: 'ATIVO',
      },
      limiteAtletasPorTime: 25,
      minimoAtletas: 7,
      atletas,
      quantidadeAtivos: atletas.length,
      pendencias: atletas.length < 7 ? ['Elenco abaixo do mínimo'] : [],
      atualizadoEm: new Date().toISOString(),
    };
  }

  async selecionarEstruturaFases(
    campeonatoId: string,
    accessToken: string,
    input: { formato: FormatoCampeonato; fases: ConfiguracaoFase[] },
  ) {
    const { campeonato } = this.autorizarOperacao(
      campeonatoId,
      accessToken,
      'CONFIGURAR_ESTRUTURA',
    );
    this.fasesPorCampeonato.set(campeonatoId, input.fases);
    campeonato.formato =
      input.formato === 'GRUPOS_E_MATA_MATA'
        ? 'GRUPOS_MATA_MATA'
        : input.formato;
    return {
      campeonatoId,
      versaoConfiguracao: 3,
      fasesCriadas: input.fases.length,
    };
  }

  async consultarFases(
    campeonatoId: string,
    accessToken?: string,
  ): Promise<FasesPersistidasCampeonato> {
    if (accessToken) this.autorizar(campeonatoId, accessToken);
    const campeonato = this.obter(campeonatoId);
    const fasesConfiguradas = this.fasesPorCampeonato.get(campeonatoId);
    const fases = fasesConfiguradas ?? [
      {
        ordem: 1,
        nome:
          campeonato.formato === 'MATA_MATA'
            ? 'Fase eliminatória'
            : 'Fase classificatória',
        tipo:
          campeonato.formato === 'MATA_MATA'
            ? ('MATA_MATA' as const)
            : ('PONTOS_CORRIDOS' as const),
        turnos: 'TURNO_UNICO' as const,
        pontosVitoria: 3,
        pontosEmpate: 1,
        pontosDerrota: 0,
        quantidadeGrupos: null,
        classificadosPorGrupo: null,
        numeroPartidasConfronto: null,
        permiteProrrogacao: null,
        permitePenaltis: null,
        golDeOuro: null,
      },
    ];
    const materializadas =
      this.fasesMaterializadasPorCampeonato.get(campeonatoId) ??
      new Set<string>(fasesConfiguradas ? [] : [`${campeonatoId}-fase-1`]);
    return {
      campeonatoId,
      versaoConfiguracao: 3,
      fases: fases.map((fase) => ({
        faseId: `${campeonatoId}-fase-${fase.ordem}`,
        nome: fase.nome,
        ordem: fase.ordem,
        tipo: fase.tipo,
        quantidadeTurnos:
          fase.turnos === 'TURNO_E_RETORNO' ? 2 : fase.turnos ? 1 : null,
        classificadosPorGrupo: fase.classificadosPorGrupo,
        grupos: Array.from(
          { length: fase.quantidadeGrupos ?? 0 },
          (_, indice) => ({
            grupoId: `${campeonatoId}-fase-${fase.ordem}-grupo-${indice + 1}`,
            nome: `Grupo ${String.fromCharCode(65 + indice)}`,
            ordem: indice + 1,
          }),
        ),
        statusMaterializacao: materializadas.has(
          `${campeonatoId}-fase-${fase.ordem}`,
        )
          ? ('GERADA' as const)
          : ('NAO_GERADA' as const),
      })),
    };
  }

  async consultarDistribuicao(
    campeonatoId: string,
    accessToken: string,
  ): Promise<DistribuicaoCampeonato> {
    this.autorizar(campeonatoId, accessToken);
    return (
      this.distribuicoesPorCampeonato.get(campeonatoId) ?? {
        campeonatoId,
        estado: 'NAO_EXECUTADA',
        modo: null,
        semente: null,
        versaoAlgoritmo: null,
        executadaEm: null,
        posicoes: [],
      }
    );
  }

  async consultarEstrutura(
    campeonatoId: string,
    accessToken: string,
  ): Promise<EstruturaMaterializadaCampeonato> {
    this.autorizar(campeonatoId, accessToken);
    return (
      this.estruturasPorCampeonato.get(campeonatoId) ?? {
        campeonatoId,
        estado: 'NAO_GERADA',
        modo: null,
        geradaEm: null,
        pontosCorridos: [],
        mataMata: [],
      }
    );
  }

  async distribuirTimes(
    campeonatoId: string,
    accessToken: string,
    modo: 'AUTOMATICA' | 'MANUAL',
    posicoesManuais: PosicaoManual[],
    idempotencyKey: string,
  ) {
    const autorizado = this.autorizar(campeonatoId, accessToken);
    const chave = this.chaveIdempotencia(
      autorizado.vinculo.contaId,
      'DISTRIBUIR_TIMES',
      idempotencyKey,
      campeonatoId,
    );
    const payload = { modo, posicoesManuais };
    const anterior = this.respostaIdempotente(
      chave,
      payload,
      this.respostasDistribuicao,
    );
    if (anterior) return anterior;
    const { campeonato } = this.autorizarOperacao(
      campeonatoId,
      accessToken,
      'GERAR_ESTRUTURA',
    );

    const executadaEm = new Date().toISOString();
    const faseId = `${campeonatoId}-fase-${
      this.fasesPorCampeonato.get(campeonatoId)?.[0]?.ordem ?? 1
    }`;
    const posicoes =
      modo === 'MANUAL'
        ? posicoesManuais.map((item) => ({ ...item }))
        : campeonato.timeIds.map((timeId, indice) => ({
            timeId: String(timeId),
            faseId,
            grupoId: null,
            posicao: indice + 1,
            semente: indice + 1,
          }));
    this.distribuicoesPorCampeonato.set(campeonatoId, {
      campeonatoId,
      estado: 'EXECUTADA',
      modo,
      semente: modo === 'AUTOMATICA' ? `prototipo-${campeonatoId}` : null,
      versaoAlgoritmo: 'prototipo-v2',
      executadaEm,
      posicoes,
    });
    const resposta = { campeonatoId, modo, executadaEm };
    this.registrarRespostaIdempotente(
      chave,
      payload,
      resposta,
      this.respostasDistribuicao,
    );
    return resposta;
  }

  async materializarPontosCorridos(
    campeonatoId: string,
    accessToken: string,
    modo: 'AUTOMATICA' | 'MANUAL',
    partidasManuais: PartidaManual[],
    idempotencyKey: string,
  ) {
    const autorizado = this.autorizar(campeonatoId, accessToken);
    const chaveIdempotencia = this.chaveIdempotencia(
      autorizado.vinculo.contaId,
      'MATERIALIZAR_PONTOS_CORRIDOS',
      idempotencyKey,
      campeonatoId,
    );
    const payload = { modo, partidasManuais };
    const respostaAnterior = this.respostaIdempotente(
      chaveIdempotencia,
      payload,
      this.respostasPontosCorridos,
    );
    if (respostaAnterior) return respostaAnterior;
    this.autorizarOperacao(campeonatoId, accessToken, 'GERAR_ESTRUTURA');

    const distribuicao = this.distribuicoesPorCampeonato.get(campeonatoId);
    if (!distribuicao || distribuicao.estado !== 'EXECUTADA') {
      throw new Error('ORDEM_MATERIALIZACAO_INVALIDA');
    }
    const fases = [...(this.fasesPorCampeonato.get(campeonatoId) ?? [])].sort(
      (a, b) => a.ordem - b.ordem,
    );
    const fase = fases.find((item) => item.tipo !== 'MATA_MATA');
    const faseId = `${campeonatoId}-fase-${fase?.ordem ?? 1}`;
    const materializadas =
      this.fasesMaterializadasPorCampeonato.get(campeonatoId) ??
      new Set<string>();

    const estruturaGeradaEm = new Date().toISOString();
    let partidasProjetadas: PartidaManual[];
    if (modo === 'MANUAL') {
      partidasProjetadas = partidasManuais.map((partida) => ({ ...partida }));
    } else {
      const gruposDeTimes = new Map<
        string,
        { grupoId: string | null; times: string[] }
      >();
      for (const posicao of [...distribuicao.posicoes].sort(
        (a, b) => a.posicao - b.posicao,
      )) {
        const chaveGrupo = posicao.grupoId ?? '';
        const grupo = gruposDeTimes.get(chaveGrupo) ?? {
          grupoId: posicao.grupoId,
          times: [],
        };
        if (!grupo.times.includes(posicao.timeId))
          grupo.times.push(posicao.timeId);
        gruposDeTimes.set(chaveGrupo, grupo);
      }
      partidasProjetadas = [];
      for (const grupo of gruposDeTimes.values()) {
        const participantes: Array<string | null> = [...grupo.times];
        if (participantes.length % 2 === 1) participantes.push(null);
        let rotacao = participantes;
        const quantidadeRodadas = Math.max(0, rotacao.length - 1);
        for (let rodada = 1; rodada <= quantidadeRodadas; rodada += 1) {
          for (let indice = 0; indice < rotacao.length / 2; indice += 1) {
            const timeA = rotacao[indice];
            const timeB = rotacao[rotacao.length - 1 - indice];
            if (!timeA || !timeB) continue;
            partidasProjetadas.push({
              faseId,
              grupoId: grupo.grupoId,
              rodada,
              timeMandanteId: rodada % 2 === 0 ? timeB : timeA,
              timeVisitanteId: rodada % 2 === 0 ? timeA : timeB,
            });
          }
          rotacao = [
            rotacao[0] ?? null,
            rotacao.at(-1) ?? null,
            ...rotacao.slice(1, -1),
          ];
        }
        if (fase?.turnos === 'TURNO_E_RETORNO') {
          const ida = partidasProjetadas.filter(
            (partida) => partida.grupoId === grupo.grupoId,
          );
          partidasProjetadas.push(
            ...ida.map((partida) => ({
              ...partida,
              rodada: partida.rodada + quantidadeRodadas,
              timeMandanteId: partida.timeVisitanteId,
              timeVisitanteId: partida.timeMandanteId,
            })),
          );
        }
      }
    }

    const grupos = new Map<
      string,
      { faseId: string; grupoId: string | null; rodadas: Map<number, string[]> }
    >();
    partidasProjetadas.forEach((partida, indice) => {
      const chaveGrupo = `${partida.faseId}|${partida.grupoId ?? ''}`;
      const grupo = grupos.get(chaveGrupo) ?? {
        faseId: partida.faseId,
        grupoId: partida.grupoId,
        rodadas: new Map<number, string[]>(),
      };
      const ids = grupo.rodadas.get(partida.rodada) ?? [];
      ids.push(`${campeonatoId}-partida-${indice + 1}`);
      grupo.rodadas.set(partida.rodada, ids);
      grupos.set(chaveGrupo, grupo);
    });
    const estruturaAnterior = this.estruturasPorCampeonato.get(campeonatoId);
    const pontosCorridos = Array.from(grupos.values(), (grupo) => ({
      faseId: grupo.faseId,
      grupoId: grupo.grupoId,
      rodadas: Array.from(grupo.rodadas, ([numero, partidaIds]) => ({
        numero,
        partidaIds,
      })).sort((a, b) => a.numero - b.numero),
    }));
    const chavesAtualizadas = new Set(
      pontosCorridos.map((grupo) => `${grupo.faseId}|${grupo.grupoId ?? ''}`),
    );
    this.estruturasPorCampeonato.set(campeonatoId, {
      campeonatoId,
      estado: 'GERADA',
      modo,
      geradaEm: estruturaGeradaEm,
      pontosCorridos: [
        ...(estruturaAnterior?.pontosCorridos.filter(
          (grupo) =>
            !chavesAtualizadas.has(`${grupo.faseId}|${grupo.grupoId ?? ''}`),
        ) ?? []),
        ...pontosCorridos,
      ],
      mataMata: estruturaAnterior?.mataMata ?? [],
    });
    partidasProjetadas.forEach((partida) => materializadas.add(partida.faseId));
    if (partidasProjetadas.length === 0) materializadas.add(faseId);
    this.fasesMaterializadasPorCampeonato.set(campeonatoId, materializadas);
    const resposta = {
      campeonatoId,
      modo,
      partidasCriadas: partidasProjetadas.length,
      estruturaGeradaEm,
    };
    this.registrarRespostaIdempotente(
      chaveIdempotencia,
      payload,
      resposta,
      this.respostasPontosCorridos,
    );
    return resposta;
  }

  async materializarMataMata(
    campeonatoId: string,
    accessToken: string,
    modo: 'AUTOMATICA' | 'MANUAL',
    confrontosManuais: ConfrontoManual[],
    idempotencyKey: string,
  ) {
    const autorizado = this.autorizar(campeonatoId, accessToken);
    const chaveIdempotencia = this.chaveIdempotencia(
      autorizado.vinculo.contaId,
      'MATERIALIZAR_MATA_MATA',
      idempotencyKey,
      campeonatoId,
    );
    const payload = { modo, confrontosManuais };
    const respostaAnterior = this.respostaIdempotente(
      chaveIdempotencia,
      payload,
      this.respostasMataMata,
    );
    if (respostaAnterior) return respostaAnterior;
    this.autorizarOperacao(campeonatoId, accessToken, 'GERAR_ESTRUTURA');

    const distribuicao = this.distribuicoesPorCampeonato.get(campeonatoId);
    if (!distribuicao || distribuicao.estado !== 'EXECUTADA') {
      throw new Error('ORDEM_MATERIALIZACAO_INVALIDA');
    }
    const fases = [...(this.fasesPorCampeonato.get(campeonatoId) ?? [])].sort(
      (a, b) => a.ordem - b.ordem,
    );
    const fase = fases.find((item) => item.tipo === 'MATA_MATA');
    const faseId = `${campeonatoId}-fase-${fase?.ordem ?? 1}`;
    const materializadas =
      this.fasesMaterializadasPorCampeonato.get(campeonatoId) ??
      new Set<string>();

    const estruturaGeradaEm = new Date().toISOString();
    let confrontosProjetados: ConfrontoManual[];
    if (modo === 'MANUAL') {
      confrontosProjetados = confrontosManuais.map((confronto) => ({
        ...confronto,
      }));
    } else {
      const faseClassificatoria = fases.find(
        (item) => item.ordem < (fase?.ordem ?? 1) && item.tipo !== 'MATA_MATA',
      );
      const quantidadeVagas = faseClassificatoria
        ? (faseClassificatoria.quantidadeGrupos ?? 1) *
          (faseClassificatoria.classificadosPorGrupo ?? 0)
        : 0;
      const times: Array<string | null> = faseClassificatoria
        ? Array.from({ length: quantidadeVagas }, () => null)
        : [...distribuicao.posicoes]
            .sort((a, b) => a.posicao - b.posicao)
            .map((posicao) => posicao.timeId)
            .filter(
              (timeId, indice, todos) => todos.indexOf(timeId) === indice,
            );
      if (times.length < 2) {
        confrontosProjetados = [];
      } else {
        const tamanhoChave = 2 ** Math.ceil(Math.log2(times.length));
        const quantidadeRodadas = Math.log2(tamanhoChave);
        const chavesPorRodada: string[][] = [];
        for (let rodada = 1; rodada <= quantidadeRodadas; rodada += 1) {
          chavesPorRodada.push(
            Array.from(
              { length: tamanhoChave / 2 ** rodada },
              (_, indice) => `automatico-${rodada}-${indice + 1}`,
            ),
          );
        }
        confrontosProjetados = chavesPorRodada.flatMap((chaves, indiceRodada) =>
          chaves.map((chaveLocal, indice) => {
            const rodada = indiceRodada + 1;
            const timeAId = rodada === 1 ? (times[indice] ?? null) : null;
            const timeBId =
              rodada === 1 ? (times[tamanhoChave - 1 - indice] ?? null) : null;
            const destino =
              chavesPorRodada[indiceRodada + 1]?.[Math.floor(indice / 2)] ??
              null;
            return {
              chaveLocal,
              faseId,
              rodada,
              ordem: indice + 1,
              tipo:
                rodada === 1 && Boolean(timeAId) !== Boolean(timeBId)
                  ? ('BYE' as const)
                  : ('NORMAL' as const),
              timeAId,
              timeBId,
              confrontoDestinoChaveLocal: destino,
              posicaoDestino: destino ? (indice % 2 === 0 ? 'A' : 'B') : null,
              criterioByeAplicado:
                rodada === 1 && Boolean(timeAId) !== Boolean(timeBId)
                  ? ('SEMENTE' as const)
                  : null,
            };
          }),
        );
      }
    }

    const idsPorChave = new Map(
      confrontosProjetados.map((confronto, indice) => [
        confronto.chaveLocal,
        `${campeonatoId}-confronto-${indice + 1}`,
      ]),
    );
    const estruturaAnterior = this.estruturasPorCampeonato.get(campeonatoId);
    const fasesAtualizadas = new Set(
      confrontosProjetados.map((confronto) => confronto.faseId),
    );
    fasesAtualizadas.add(faseId);
    this.estruturasPorCampeonato.set(campeonatoId, {
      campeonatoId,
      estado: 'GERADA',
      modo,
      geradaEm: estruturaGeradaEm,
      pontosCorridos: estruturaAnterior?.pontosCorridos ?? [],
      mataMata: [
        ...(estruturaAnterior?.mataMata.filter(
          (confronto) => !fasesAtualizadas.has(confronto.faseId),
        ) ?? []),
        ...confrontosProjetados.map((confronto, indice) => ({
          confrontoId: idsPorChave.get(confronto.chaveLocal)!,
          faseId: confronto.faseId,
          rodada: confronto.rodada,
          ordem: confronto.ordem,
          tipo: confronto.tipo,
          timeAId: confronto.timeAId,
          timeBId: confronto.timeBId,
          partidaId:
            confronto.tipo === 'NORMAL'
              ? `${campeonatoId}-mata-mata-${indice + 1}`
              : null,
          confrontoDestinoId: confronto.confrontoDestinoChaveLocal
            ? (idsPorChave.get(confronto.confrontoDestinoChaveLocal) ?? null)
            : null,
          posicaoDestino: confronto.posicaoDestino,
          criterioByeAplicado: confronto.criterioByeAplicado,
        })),
      ],
    });
    confrontosProjetados.forEach((confronto) =>
      materializadas.add(confronto.faseId),
    );
    if (confrontosProjetados.length === 0) materializadas.add(faseId);
    this.fasesMaterializadasPorCampeonato.set(campeonatoId, materializadas);
    const resposta = {
      campeonatoId,
      modo,
      confrontosCriados: confrontosProjetados.length,
      estruturaGeradaEm,
    };
    this.registrarRespostaIdempotente(
      chaveIdempotencia,
      payload,
      resposta,
      this.respostasMataMata,
    );
    return resposta;
  }
}
