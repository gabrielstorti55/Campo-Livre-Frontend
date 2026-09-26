import {
  campeonatosOrganizadorMock,
  vinculosCampeonatoOrganizadorMock,
} from '@/mocks/organizador/dados-organizador';
import { obterPublicacaoPartidaMock } from '@/mocks/partidas/publicacao-partida.mock';
import {
  campeonatosPublicosMock,
  classificacaoPublicaMock,
  locaisPartidaPublicosMock,
  partidasPublicasMock,
  timesPublicosMock,
} from '@/mocks/publico/dados-publicos';
import type { PartidasApi } from '@/services/partidas/partidas-api';
import { PartidasChaveamentoPrototipo } from '@/services/prototipo/partidas-chaveamento-prototipo';
import type { OpcoesConsulta } from '@/services/api/opcoes-consulta';
import { listarArtilhariaPublica } from '@/services/publico/catalogo-publico.mock';
import type {
  AdiamentoPartidaInput,
  AgendamentoPartidaInput,
  AgendamentoPartidaSalvo,
  CancelamentoPartidaInput,
  ClassificacaoCampeonato,
  DetalheAdministrativoPartida,
  DetalhePublicoPartida,
  FiltrosAgendaPartidas,
  PaginaAgendaPartidas,
  PaginaArtilharia,
  PartidaAdiada,
  PartidaCancelada,
  RegistroWo,
  SumulaCompletaPrototipo,
  WoRegistrado,
} from '@/types/api/partidas';

const agora = () => new Date().toISOString();

const estadoPublicoParaApi = {
  A_DEFINIR: 'PENDENTE_AGENDAMENTO',
  AGENDADA: 'AGENDADA',
  ADIADA: 'ADIADA',
  CANCELADA: 'CANCELADA',
  AGUARDANDO_PUBLICACAO: 'AGENDADA',
  RESULTADO_PUBLICADO: 'ENCERRADA_SUMULA',
} as const;

const motivoPublicoParaApi = {
  Clima: 'CLIMA',
  'Condição do campo': 'CONDICAO_CAMPO',
  'Indisponibilidade logística': 'INDISPONIBILIDADE_LOGISTICA',
  'Decisão administrativa': 'DECISAO_ADMINISTRATIVA',
  Desistência: 'DESISTENCIA',
  'Força maior': 'FORCA_MAIOR',
} as const;

export class PartidasPrototipo implements PartidasApi {
  private readonly resultadosWo = new Map<string, WoRegistrado>();
  private readonly partidasLegadasAdministrativas = new Map<
    string,
    DetalheAdministrativoPartida
  >();
  private readonly respostasPorChave = new Map<
    string,
    { payload: string; resposta: WoRegistrado }
  >();
  private readonly partidas = new Map<string, DetalheAdministrativoPartida>([
    [
      '1',
      {
        partidaId: '1',
        campeonatoId: '1',
        faseId: 'fase-classificatoria-1',
        grupoId: null,
        confrontoId: null,
        rodada: 1,
        mandante: {
          timeCampeonatoId: 'tc-1',
          timeId: '1',
          nome: 'Vila Nova FC',
        },
        visitante: {
          timeCampeonatoId: 'tc-2',
          timeId: '2',
          nome: 'Leões FC',
        },
        estado: 'AGENDADA',
        agendamento: {
          inicioEm: '2026-09-27T18:00:00.000Z',
          campoId: '1',
          versao: 1,
          autorizacaoExternaConfirmada: true,
        },
        motivoAdministrativo: null,
        operacoesPermitidas: ['REAGENDAR', 'ADIAR', 'CANCELAR', 'REGISTRAR_WO'],
        pdfOficial: { status: 'INEXISTENTE' },
        atualizadoEm: agora(),
      },
    ],
  ]);

  constructor(
    private readonly autenticar: (accessToken: string) => string | null,
    private readonly partidasChaveamento = new PartidasChaveamentoPrototipo(),
  ) {}

  private sincronizarPartidasDoChaveamento() {
    for (const gerada of this.partidasChaveamento.listar()) {
      const existente = this.partidas.get(gerada.partidaId);
      if (existente) {
        if (gerada.resultado) {
          existente.estado = 'ENCERRADA_SUMULA';
          existente.operacoesPermitidas = [];
          existente.atualizadoEm = agora();
        }
        continue;
      }
      const mandante = timesPublicosMock.find(
        (time) => String(time.id) === gerada.mandanteTimeId,
      );
      const visitante = timesPublicosMock.find(
        (time) => String(time.id) === gerada.visitanteTimeId,
      );
      this.partidas.set(gerada.partidaId, {
        partidaId: gerada.partidaId,
        campeonatoId: gerada.campeonatoId,
        faseId: gerada.faseId,
        grupoId: null,
        confrontoId: gerada.confrontoId,
        rodada: gerada.rodada,
        mandante: {
          timeCampeonatoId: `tc-${gerada.campeonatoId}-${gerada.mandanteTimeId}`,
          timeId: gerada.mandanteTimeId,
          nome: mandante?.nome ?? 'Time removido',
        },
        visitante: {
          timeCampeonatoId: `tc-${gerada.campeonatoId}-${gerada.visitanteTimeId}`,
          timeId: gerada.visitanteTimeId,
          nome: visitante?.nome ?? 'Time removido',
        },
        estado: 'PENDENTE_AGENDAMENTO',
        agendamento: {
          inicioEm: null,
          campoId: null,
          versao: 1,
          autorizacaoExternaConfirmada: false,
        },
        motivoAdministrativo: null,
        operacoesPermitidas: ['AGENDAR', 'CANCELAR', 'REGISTRAR_WO'],
        pdfOficial: { status: 'INEXISTENTE' },
        atualizadoEm: agora(),
      });
    }
  }

  async registrarSumulaPrototipo(
    partidaId: string,
    accessToken: string,
    input: SumulaCompletaPrototipo,
  ) {
    const { partida } = this.contextoAutorizado(partidaId, accessToken);
    if (partida.estado !== 'AGENDADA') {
      throw new Error('PARTIDA_NAO_AGENDADA');
    }
    if (
      input.gols.filter((gol) => gol.lado === 'MANDANTE').length !==
        input.golsMandante ||
      input.gols.filter((gol) => gol.lado === 'VISITANTE').length !==
        input.golsVisitante
    ) {
      throw new Error('SUMULA_INCONSISTENTE');
    }
    if (
      input.golsMandante === input.golsVisitante &&
      (!input.placarPenaltis ||
        !Number.isInteger(input.placarPenaltis.mandante) ||
        !Number.isInteger(input.placarPenaltis.visitante) ||
        input.placarPenaltis.mandante < 0 ||
        input.placarPenaltis.visitante < 0 ||
        input.placarPenaltis.mandante === input.placarPenaltis.visitante)
    ) {
      throw new Error('DESEMPATE_NAO_INFORMADO');
    }
    if (
      Object.values(input.arbitragem).some((nome) => !nome.trim()) ||
      input.escalacaoMandante.length === 0 ||
      input.escalacaoVisitante.length === 0
    ) {
      throw new Error('SUMULA_INCOMPLETA');
    }
    const resultado = this.partidasChaveamento.registrarSumula(
      partidaId,
      input,
    );
    partida.estado = 'ENCERRADA_SUMULA';
    partida.operacoesPermitidas = [];
    partida.atualizadoEm = agora();
    this.sincronizarPartidasDoChaveamento();
    return {
      partidaId,
      estado: 'ENCERRADA_SUMULA' as const,
      placar: {
        golsMandante: input.golsMandante,
        golsVisitante: input.golsVisitante,
      },
      ...resultado,
    };
  }

  private obter(partidaId: string) {
    this.sincronizarPartidasDoChaveamento();
    const partida =
      this.partidas.get(partidaId) ??
      this.partidasLegadasAdministrativas.get(partidaId) ??
      this.criarDetalheAdministrativoLegado(partidaId);
    if (!partida) throw new Error('RECURSO_NAO_ENCONTRADO');
    return partida;
  }

  private criarDetalheAdministrativoLegado(
    partidaId: string,
  ): DetalheAdministrativoPartida | null {
    const origem = partidasPublicasMock.find(
      (partida) => String(partida.id) === partidaId,
    );
    if (!origem) return null;
    const mandante = timesPublicosMock.find(
      (time) => time.id === origem.timeCasaId,
    );
    const visitante = timesPublicosMock.find(
      (time) => time.id === origem.timeForaId,
    );
    const estado = estadoPublicoParaApi[origem.estado];
    const inicioEm =
      origem.data && origem.hora
        ? `${origem.data}T${origem.hora}:00.000Z`
        : null;
    const detalhe: DetalheAdministrativoPartida = {
      partidaId,
      campeonatoId: String(origem.campeonatoId),
      faseId: `${origem.campeonatoId}-fase-1`,
      grupoId: origem.grupo ?? null,
      confrontoId: null,
      rodada: Number.parseInt(origem.rodada.replace(/\D/g, ''), 10) || 1,
      mandante: {
        timeCampeonatoId: `tc-${origem.campeonatoId}-${origem.timeCasaId}`,
        timeId: String(origem.timeCasaId),
        nome: mandante?.nome ?? 'Time removido',
      },
      visitante: {
        timeCampeonatoId: `tc-${origem.campeonatoId}-${origem.timeForaId}`,
        timeId: String(origem.timeForaId),
        nome: visitante?.nome ?? 'Time removido',
      },
      estado,
      agendamento: {
        inicioEm,
        campoId: origem.campoId ? String(origem.campoId) : null,
        versao: 1,
        autorizacaoExternaConfirmada: Boolean(inicioEm && origem.campoId),
      },
      motivoAdministrativo: origem.motivoPublico ?? null,
      operacoesPermitidas:
        estado === 'PENDENTE_AGENDAMENTO' || estado === 'ADIADA'
          ? ['AGENDAR', 'CANCELAR', 'REGISTRAR_WO']
          : estado === 'AGENDADA'
            ? ['REAGENDAR', 'ADIAR', 'CANCELAR', 'REGISTRAR_WO']
            : [],
      pdfOficial: { status: 'INEXISTENTE' },
      atualizadoEm: inicioEm ?? agora(),
    };
    this.partidasLegadasAdministrativas.set(partidaId, detalhe);
    return detalhe;
  }

  private contextoAutorizado(partidaId: string, accessToken: string) {
    const contaId = this.autenticar(accessToken);
    if (!contaId) throw new Error('NAO_AUTENTICADO');
    const partida = this.obter(partidaId);
    const vinculo = vinculosCampeonatoOrganizadorMock.find(
      (item) =>
        item.contaId === contaId &&
        item.campeonatoId === Number(partida.campeonatoId),
    );
    if (!vinculo) throw new Error('NAO_AUTORIZADO');
    return { contaId, partida, vinculo };
  }

  private autorizarOperacao(
    partidaId: string,
    accessToken: string,
    operacao: string,
    apenasResponsavel = false,
  ) {
    const contexto = this.contextoAutorizado(partidaId, accessToken);
    if (apenasResponsavel && contexto.vinculo.papel !== 'RESPONSAVEL') {
      throw new Error('PERMISSAO_INSUFICIENTE');
    }
    if (!contexto.partida.operacoesPermitidas.includes(operacao)) {
      throw new Error('OPERACAO_NAO_PERMITIDA');
    }
    return contexto;
  }

  private validarVersao(
    partida: DetalheAdministrativoPartida,
    versaoEsperada: number,
  ) {
    if (partida.agendamento.versao !== versaoEsperada) {
      throw new Error('VERSAO_DIVERGENTE');
    }
  }

  private atualizarOperacoes(partida: DetalheAdministrativoPartida) {
    if (
      partida.estado === 'PENDENTE_AGENDAMENTO' ||
      partida.estado === 'ADIADA'
    ) {
      partida.operacoesPermitidas = ['AGENDAR', 'CANCELAR', 'REGISTRAR_WO'];
    } else if (partida.estado === 'AGENDADA') {
      partida.operacoesPermitidas = [
        'REAGENDAR',
        'ADIAR',
        'CANCELAR',
        'REGISTRAR_WO',
      ];
    } else {
      partida.operacoesPermitidas = [];
    }
  }

  private garantirEstadoMutavel(partida: DetalheAdministrativoPartida) {
    if (
      partida.estado === 'CANCELADA' ||
      partida.estado === 'ENCERRADA_SUMULA' ||
      partida.estado === 'ENCERRADA_WO'
    ) {
      throw new Error('ESTADO_NAO_PERMITE_OPERACAO');
    }
  }

  async listarAgenda(
    {
      campeonatoId,
      faseId,
      timeId,
      campoId,
      municipioId,
      estado,
      inicioDe,
      inicioAte,
      pagina = 1,
      tamanho = 20,
    }: FiltrosAgendaPartidas,
    opcoes?: OpcoesConsulta,
  ): Promise<PaginaAgendaPartidas> {
    opcoes?.signal?.throwIfAborted();
    this.sincronizarPartidasDoChaveamento();
    const operacionais = Array.from(this.partidas.values())
      .filter(
        (partida) =>
          (!campeonatoId || partida.campeonatoId === campeonatoId) &&
          (!faseId || partida.faseId === faseId) &&
          (!timeId ||
            partida.mandante.timeId === timeId ||
            partida.visitante.timeId === timeId) &&
          (!campoId || partida.agendamento.campoId === campoId) &&
          (!municipioId ||
            municipioId === '00000000-0000-4000-8000-000000000001') &&
          (!estado || partida.estado === estado) &&
          (!inicioDe ||
            Boolean(
              partida.agendamento.inicioEm &&
              partida.agendamento.inicioEm >= inicioDe,
            )) &&
          (!inicioAte ||
            Boolean(
              partida.agendamento.inicioEm &&
              partida.agendamento.inicioEm <= inicioAte,
            )),
      )
      .map((partida) => {
        const campeonato = campeonatosPublicosMock.find(
          (item) => String(item.id) === partida.campeonatoId,
        );
        const campeonatoAdministrado = campeonatosOrganizadorMock.find(
          (item) => String(item.id) === partida.campeonatoId,
        );
        const mandante = timesPublicosMock.find(
          (item) => String(item.id) === partida.mandante.timeId,
        );
        const visitante = timesPublicosMock.find(
          (item) => String(item.id) === partida.visitante.timeId,
        );
        const campo = locaisPartidaPublicosMock.find(
          (item) => String(item.id) === partida.agendamento.campoId,
        );
        return {
          partidaId: partida.partidaId,
          campeonato: {
            id: partida.campeonatoId,
            nome:
              campeonato?.nome ?? campeonatoAdministrado?.nome ?? 'Campeonato',
          },
          faseId: partida.faseId,
          rodada: partida.rodada,
          mandante: {
            timeId: partida.mandante.timeId,
            nome: partida.mandante.nome,
            sigla: mandante?.escudo ?? 'MAN',
          },
          visitante: {
            timeId: partida.visitante.timeId,
            nome: partida.visitante.nome,
            sigla: visitante?.escudo ?? 'VIS',
          },
          inicioEm: partida.agendamento.inicioEm,
          campo: partida.agendamento.campoId
            ? {
                id: partida.agendamento.campoId,
                nome: campo?.nome ?? 'Campo cadastrado',
              }
            : null,
          estado: partida.estado,
        };
      });
    const idsOperacionais = new Set(
      operacionais.map((partida) => partida.partidaId),
    );
    const legadas = partidasPublicasMock
      .filter(
        (partida) =>
          !idsOperacionais.has(String(partida.id)) &&
          partida.estado !== 'AGUARDANDO_PUBLICACAO',
      )
      .map((partida) => {
        const campeonato = campeonatosPublicosMock.find(
          (item) => item.id === partida.campeonatoId,
        );
        const mandante = timesPublicosMock.find(
          (item) => item.id === partida.timeCasaId,
        );
        const visitante = timesPublicosMock.find(
          (item) => item.id === partida.timeForaId,
        );
        const campo = locaisPartidaPublicosMock.find(
          (item) => item.id === partida.campoId,
        );
        const inicioEm =
          partida.data && partida.hora
            ? `${partida.data}T${partida.hora}:00.000Z`
            : null;
        return {
          partidaId: String(partida.id),
          campeonato: {
            id: String(partida.campeonatoId),
            nome: campeonato?.nome ?? 'Campeonato',
          },
          faseId: `${partida.campeonatoId}-fase-1`,
          rodada: Number.parseInt(partida.rodada.replace(/\D/g, ''), 10) || 1,
          mandante: {
            timeId: String(partida.timeCasaId),
            nome: mandante?.nome ?? 'Time removido',
            sigla: mandante?.escudo ?? 'TIM',
          },
          visitante: {
            timeId: String(partida.timeForaId),
            nome: visitante?.nome ?? 'Time removido',
            sigla: visitante?.escudo ?? 'TIM',
          },
          inicioEm,
          campo: campo ? { id: String(campo.id), nome: campo.nome } : null,
          estado: estadoPublicoParaApi[partida.estado],
        };
      })
      .filter(
        (partida) =>
          (!campeonatoId || partida.campeonato.id === campeonatoId) &&
          (!faseId || partida.faseId === faseId) &&
          (!timeId ||
            partida.mandante.timeId === timeId ||
            partida.visitante.timeId === timeId) &&
          (!campoId || partida.campo?.id === campoId) &&
          (!municipioId ||
            municipioId === '00000000-0000-4000-8000-000000000001') &&
          (!estado || partida.estado === estado) &&
          (!inicioDe ||
            Boolean(partida.inicioEm && partida.inicioEm >= inicioDe)) &&
          (!inicioAte ||
            Boolean(partida.inicioEm && partida.inicioEm <= inicioAte)),
      );
    const todos = [
      ...operacionais,
      ...legadas.sort((a, b) =>
        (a.inicioEm ?? '').localeCompare(b.inicioEm ?? ''),
      ),
    ];
    const inicio = (pagina - 1) * tamanho;
    return {
      itens: todos.slice(inicio, inicio + tamanho),
      pagina,
      tamanho,
      totalItens: todos.length,
      totalPaginas: Math.ceil(todos.length / tamanho),
    };
  }

  private obterProjecaoPublicaLegada(
    partidaId: string,
  ): DetalhePublicoPartida | null {
    const partida = partidasPublicasMock.find(
      (item) => String(item.id) === partidaId,
    );
    if (!partida) return null;

    const campeonato = campeonatosPublicosMock.find(
      (item) => item.id === partida.campeonatoId,
    );
    const mandante = timesPublicosMock.find(
      (item) => item.id === partida.timeCasaId,
    );
    const visitante = timesPublicosMock.find(
      (item) => item.id === partida.timeForaId,
    );
    const campo = locaisPartidaPublicosMock.find(
      (item) => item.id === partida.campoId,
    );
    const publicacao = obterPublicacaoPartidaMock(partidaId);

    return {
      partidaId,
      campeonato: {
        id: String(partida.campeonatoId),
        nome: campeonato?.nome ?? 'Campeonato',
      },
      fase: {
        id: `${partida.campeonatoId}-fase-1`,
        nome: partida.fase,
        tipo: 'PONTOS_CORRIDOS',
      },
      grupo: partida.grupo ? { id: partida.grupo, nome: partida.grupo } : null,
      rodada: Number.parseInt(partida.rodada.replace(/\D/g, ''), 10) || 1,
      confrontoId: null,
      mandante: {
        timeId: String(partida.timeCasaId),
        nome: mandante?.nome ?? 'Mandante',
        sigla: (mandante?.nome ?? 'MAN').slice(0, 3).toLocaleUpperCase('pt-BR'),
        escudoUrl: null,
      },
      visitante: {
        timeId: String(partida.timeForaId),
        nome: visitante?.nome ?? 'Visitante',
        sigla: (visitante?.nome ?? 'VIS')
          .slice(0, 3)
          .toLocaleUpperCase('pt-BR'),
        escudoUrl: null,
      },
      agendamento: {
        inicioEm:
          partida.data && partida.hora
            ? `${partida.data}T${partida.hora}:00.000Z`
            : null,
        campo: campo ? { id: String(campo.id), nome: campo.nome } : null,
      },
      estado: estadoPublicoParaApi[partida.estado],
      motivoPublico: partida.motivoPublico
        ? motivoPublicoParaApi[partida.motivoPublico]
        : null,
      resultado:
        partida.resultadoPublicado &&
        partida.golsCasa !== undefined &&
        partida.golsFora !== undefined
          ? {
              tipo: 'SUMULA',
              placarRegulamentar: {
                mandante: partida.golsCasa,
                visitante: partida.golsFora,
              },
              placarProrrogacao: null,
              placarPenaltis: null,
            }
          : null,
      sumulaPublica:
        partida.resultadoPublicado && publicacao.sumulaPublica
          ? publicacao.sumulaPublica
          : null,
    };
  }

  async consultarPartida(
    partidaId: string,
    opcoes?: OpcoesConsulta,
  ): Promise<DetalhePublicoPartida> {
    opcoes?.signal?.throwIfAborted();
    const legada = this.partidas.has(partidaId)
      ? null
      : this.obterProjecaoPublicaLegada(partidaId);
    if (legada) return legada;
    const partida = this.obter(partidaId);
    const wo = this.resultadosWo.get(partidaId);
    const campeonato = campeonatosPublicosMock.find(
      (item) => String(item.id) === partida.campeonatoId,
    );
    const mandante = timesPublicosMock.find(
      (item) => String(item.id) === partida.mandante.timeId,
    );
    const visitante = timesPublicosMock.find(
      (item) => String(item.id) === partida.visitante.timeId,
    );
    const campo = locaisPartidaPublicosMock.find(
      (item) => String(item.id) === partida.agendamento.campoId,
    );
    return {
      partidaId,
      campeonato: {
        id: partida.campeonatoId,
        nome: campeonato?.nome ?? 'Campeonato',
      },
      fase: {
        id: partida.faseId,
        nome: 'Fase classificatória',
        tipo: 'PONTOS_CORRIDOS',
      },
      grupo: partida.grupoId
        ? { id: partida.grupoId, nome: 'Grupo simulado' }
        : null,
      rodada: partida.rodada,
      confrontoId: partida.confrontoId,
      mandante: {
        timeId: partida.mandante.timeId,
        nome: partida.mandante.nome,
        sigla: mandante?.escudo ?? 'MAN',
        escudoUrl: null,
      },
      visitante: {
        timeId: partida.visitante.timeId,
        nome: partida.visitante.nome,
        sigla: visitante?.escudo ?? 'VIS',
        escudoUrl: null,
      },
      agendamento: {
        inicioEm: partida.agendamento.inicioEm,
        campo: campo ? { id: String(campo.id), nome: campo.nome } : null,
      },
      estado: partida.estado,
      motivoPublico: null,
      resultado: wo
        ? {
            tipo: 'WO',
            placarRegulamentar: {
              mandante: wo.placar.golsMandante,
              visitante: wo.placar.golsVisitante,
            },
            placarProrrogacao: null,
            placarPenaltis: null,
          }
        : null,
      sumulaPublica: null,
    };
  }

  async consultarAdministracao(
    partidaId: string,
    accessToken: string,
    opcoes?: OpcoesConsulta,
  ): Promise<DetalheAdministrativoPartida> {
    opcoes?.signal?.throwIfAborted();
    const { partida, vinculo } = this.contextoAutorizado(
      partidaId,
      accessToken,
    );
    const detalhe = structuredClone(partida);
    const partidaGerada = this.partidasChaveamento
      .listar()
      .find((item) => item.partidaId === partidaId);
    detalhe.resultadoPrototipo = partidaGerada?.resultado
      ? {
          golsMandante: partidaGerada.resultado.golsTimeA,
          golsVisitante: partidaGerada.resultado.golsTimeB,
          vencedorTimeId: partidaGerada.resultado.vencedorTimeId,
        }
      : null;
    if (vinculo.papel !== 'RESPONSAVEL') {
      detalhe.operacoesPermitidas = detalhe.operacoesPermitidas.filter(
        (operacao) => operacao !== 'REGISTRAR_WO',
      );
    }
    return detalhe;
  }

  async salvarAgendamento(
    partidaId: string,
    accessToken: string,
    input: AgendamentoPartidaInput,
  ): Promise<AgendamentoPartidaSalvo> {
    const contexto = this.contextoAutorizado(partidaId, accessToken);
    const operacao =
      contexto.partida.estado === 'AGENDADA' ? 'REAGENDAR' : 'AGENDAR';
    if (!contexto.partida.operacoesPermitidas.includes(operacao)) {
      throw new Error('OPERACAO_NAO_PERMITIDA');
    }
    const { partida } = contexto;
    this.garantirEstadoMutavel(partida);
    this.validarVersao(partida, input.versaoEsperada);
    if (input.autorizacaoExternaConfirmada !== true) {
      throw new Error('AUTORIZACAO_EXTERNA_NAO_CONFIRMADA');
    }
    const reagendamento = partida.agendamento.inicioEm !== null;
    partida.estado = 'AGENDADA';
    partida.agendamento = {
      inicioEm: input.inicioEm,
      campoId: input.campoId,
      versao: partida.agendamento.versao + 1,
      autorizacaoExternaConfirmada: true,
    };
    partida.motivoAdministrativo = input.motivo;
    partida.atualizadoEm = agora();
    this.atualizarOperacoes(partida);
    return {
      partidaId,
      estado: 'AGENDADA',
      agendamento: {
        inicioEm: input.inicioEm,
        campo: {
          id: input.campoId,
          nome:
            locaisPartidaPublicosMock.find(
              (item) => String(item.id) === input.campoId,
            )?.nome ?? 'Campo selecionado',
        },
        versao: partida.agendamento.versao,
        autorizacaoExternaConfirmada: true,
      },
      reagendamento,
      atualizadoEm: partida.atualizadoEm,
    };
  }

  async adiarPartida(
    partidaId: string,
    accessToken: string,
    input: AdiamentoPartidaInput,
  ): Promise<PartidaAdiada> {
    const { partida } = this.autorizarOperacao(partidaId, accessToken, 'ADIAR');
    if (input.confirmacao !== true) throw new Error('CONFIRMACAO_OBRIGATORIA');
    if (partida.estado !== 'AGENDADA')
      throw new Error('ESTADO_NAO_PERMITE_OPERACAO');
    this.validarVersao(partida, input.versaoEsperada);
    partida.estado = 'ADIADA';
    partida.agendamento.versao += 1;
    partida.agendamento.inicioEm = null;
    partida.agendamento.campoId = null;
    partida.agendamento.autorizacaoExternaConfirmada = false;
    partida.motivoAdministrativo = input.motivo;
    partida.atualizadoEm = agora();
    this.atualizarOperacoes(partida);
    return {
      partidaId,
      estado: 'ADIADA',
      agendamento: {
        inicioEm: null,
        campo: null,
        versao: partida.agendamento.versao,
      },
      categoriaPublica: 'DECISAO_ADMINISTRATIVA',
      adiadaEm: partida.atualizadoEm,
    };
  }

  async cancelarPartida(
    partidaId: string,
    accessToken: string,
    input: CancelamentoPartidaInput,
  ): Promise<PartidaCancelada> {
    const { partida, contaId } = this.autorizarOperacao(
      partidaId,
      accessToken,
      'CANCELAR',
    );
    if (input.confirmacao !== true) throw new Error('CONFIRMACAO_OBRIGATORIA');
    this.garantirEstadoMutavel(partida);
    this.validarVersao(partida, input.versaoEsperada);
    partida.estado = 'CANCELADA';
    partida.agendamento.versao += 1;
    partida.motivoAdministrativo = input.motivo;
    partida.atualizadoEm = agora();
    this.atualizarOperacoes(partida);
    return {
      partidaId,
      estado: 'CANCELADA',
      categoriaPublica: input.categoriaPublica,
      canceladaEm: partida.atualizadoEm,
      canceladaPor: { usuarioId: contaId },
    };
  }

  async consultarArtilharia(
    campeonatoId: string,
    pagina = 1,
    tamanho = 20,
  ): Promise<PaginaArtilharia> {
    const todos = listarArtilhariaPublica(Number(campeonatoId)).map(
      (linha, indice) => ({
        posicao: indice + 1,
        jogador: {
          nome: linha.atleta?.nome ?? 'Jogador removido',
          nomeUsuario: null,
          fotoUrl: null,
          anonimo: !linha.atleta,
        },
        timeContextual: {
          id: String(linha.time?.id ?? linha.timeId),
          nome: linha.time?.nome ?? 'Time removido',
          sigla: (linha.time?.nome ?? 'TIM')
            .slice(0, 3)
            .toLocaleUpperCase('pt-BR'),
        },
        gols: linha.gols,
        partidasComAtuacao: 0,
      }),
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

  async consultarClassificacao(
    campeonatoId: string,
    faseId: string,
    grupoId?: string,
    opcoes?: OpcoesConsulta,
  ): Promise<ClassificacaoCampeonato> {
    opcoes?.signal?.throwIfAborted();
    const linhas = classificacaoPublicaMock
      .filter((linha) => String(linha.campeonatoId) === campeonatoId)
      .sort((a, b) => b.pontos - a.pontos || b.vitorias - a.vitorias)
      .map((linha, indice) => {
        const time = timesPublicosMock.find((item) => item.id === linha.timeId);
        return {
          posicao: indice + 1,
          timeId: String(linha.timeId),
          nome: time?.nome ?? 'Time removido',
          jogos: linha.jogos,
          vitorias: linha.vitorias,
          empates: linha.empates,
          derrotas: linha.derrotas,
          golsPro: linha.golsPro,
          golsContra: linha.golsContra,
          saldoGols: linha.golsPro - linha.golsContra,
          pontos: linha.pontos,
          classificado: indice < 4,
        };
      });
    return {
      campeonatoId,
      faseId,
      grupoId: grupoId ?? null,
      tipoProjecao: 'CLASSIFICACAO',
      estadoProjecao: linhas.length > 0 ? 'PARCIAL' : 'SEM_RESULTADOS',
      criteriosAplicados: [
        'PONTOS',
        'VITORIAS',
        'SALDO_GOLS',
        'GOLS_PRO',
        'ORDEM_INSCRICAO',
      ],
      linhas,
      confrontos: [],
      atualizadoEm: '2026-09-24T12:00:00.000Z',
    };
  }

  async registrarWo(
    partidaId: string,
    accessToken: string,
    input: RegistroWo,
    idempotencyKey: string,
  ): Promise<WoRegistrado> {
    const contexto = this.contextoAutorizado(partidaId, accessToken);
    const { contaId, partida } = contexto;
    if (input.confirmacaoDefinitiva !== true) {
      throw new Error('CONFIRMACAO_OBRIGATORIA');
    }
    const chaveContextual = [
      contaId,
      partidaId,
      'REGISTRAR_WO',
      idempotencyKey,
    ].join('|');
    const payload = JSON.stringify([
      input.confirmacaoDefinitiva,
      input.timeBeneficiadoId,
      input.fundamentoCodigo,
      input.justificativa,
      input.referenciaAdministrativa,
    ]);
    const anterior = this.respostasPorChave.get(chaveContextual);
    if (anterior) {
      if (anterior.payload !== payload) {
        throw new Error('IDEMPOTENCY_KEY_REUTILIZADA');
      }
      return anterior.resposta;
    }
    if (contexto.vinculo.papel !== 'RESPONSAVEL') {
      throw new Error('PERMISSAO_INSUFICIENTE');
    }
    if (!partida.operacoesPermitidas.includes('REGISTRAR_WO')) {
      throw new Error('OPERACAO_NAO_PERMITIDA');
    }
    this.garantirEstadoMutavel(partida);
    const times = [partida.mandante.timeId, partida.visitante.timeId];
    if (!times.includes(input.timeBeneficiadoId)) {
      throw new Error('TIME_NAO_PERTENCE_A_PARTIDA');
    }
    const beneficiadoMandante =
      input.timeBeneficiadoId === partida.mandante.timeId;
    const response: WoRegistrado = {
      partidaId,
      estadoPartida: 'ENCERRADA_WO',
      timeBeneficiadoId: input.timeBeneficiadoId,
      timeInfratorId: beneficiadoMandante
        ? partida.visitante.timeId
        : partida.mandante.timeId,
      placar: beneficiadoMandante
        ? { golsMandante: 3, golsVisitante: 0 }
        : { golsMandante: 0, golsVisitante: 3 },
      registradoEm: agora(),
    };
    partida.estado = 'ENCERRADA_WO';
    partida.agendamento.versao += 1;
    partida.motivoAdministrativo = input.justificativa;
    partida.atualizadoEm = response.registradoEm;
    this.atualizarOperacoes(partida);
    this.respostasPorChave.set(chaveContextual, {
      payload,
      resposta: response,
    });
    this.resultadosWo.set(partidaId, response);
    return response;
  }
}
