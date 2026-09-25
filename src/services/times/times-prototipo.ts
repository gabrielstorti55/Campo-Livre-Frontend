import {
  atletasPublicosMock,
  timesPublicosMock,
} from '@/mocks/publico/dados-publicos';
import { ErroApi } from '@/services/api/problem-details';
import type { TimesApi } from '@/services/times/times-api';
import type {
  AtletaParaConvite,
  AceiteConviteTime,
  AtualizacaoTime,
  CancelamentoConviteTime,
  ConviteTimeEnviado,
  ConviteTimePendente,
  ConviteTimePorToken,
  CriacaoTime,
  DesativacaoTime,
  EncerramentoMembroTime,
  FiltrosTimes,
  MembroElenco,
  PaginaConvitesTime,
  PaginaConvitesTimeEnviados,
  PaginaElenco,
  PaginaHistoricoElenco,
  PaginaTimes,
  PaginaTimesDaConta,
  RespostaAtualizacaoTime,
  RespostaEscudoTime,
  RecusaConviteTime,
  ReativacaoTime,
  ReenvioConviteTime,
  SaidaVoluntariaTime,
  TimeCriado,
  TimeDetalhado,
  TimeResumido,
  TransferenciaCapitania,
} from '@/types/api/times';

const estatisticasZeradas = {
  partidas: 0,
  vitorias: 0,
  derrotas: 0,
  gols: 0,
  defesas: 0,
  penaltisDefendidos: 0,
  cartoesAmarelos: 0,
  cartoesVermelhos: 0,
};

const identidadesPrototipo: Record<
  string,
  { nome: string; nomeUsuario: string }
> = {
  'mock-person-1': { nome: 'Marcos Oliveira', nomeUsuario: 'marcosoliveira' },
  'mock-person-unlinked-1': {
    nome: 'Lucas Ferreira',
    nomeUsuario: 'lucasferreira',
  },
  'mock-person-collaborator-1': {
    nome: 'Juliana Lopes',
    nomeUsuario: 'julianalopes',
  },
};

function identidadeDaConta(contaId: string) {
  return (
    identidadesPrototipo[contaId] ?? {
      nome: 'Capitão do time',
      nomeUsuario: 'capitao',
    }
  );
}

const timesAtivos: readonly TimeResumido[] = [
  {
    id: '1',
    nome: 'Vila Nova FC',
    sigla: 'VNF',
    escudoUrl: null,
    municipio: { nome: 'Franca', uf: 'SP' },
  },
  {
    id: '2',
    nome: 'Leões FC',
    sigla: 'LEO',
    escudoUrl: null,
    municipio: { nome: 'Franca', uf: 'SP' },
  },
  {
    id: '3',
    nome: 'Unidos do Vale',
    sigla: 'UNI',
    escudoUrl: null,
    municipio: { nome: 'Franca', uf: 'SP' },
  },
  {
    id: '4',
    nome: 'Estrela Azul',
    sigla: 'EST',
    escudoUrl: null,
    municipio: { nome: 'Batatais', uf: 'SP' },
  },
  {
    id: '5',
    nome: 'Bairro Sul FC',
    sigla: 'BSF',
    escudoUrl: null,
    municipio: { nome: 'Franca', uf: 'SP' },
  },
  {
    id: '6',
    nome: 'Real Aeroporto',
    sigla: 'REA',
    escudoUrl: null,
    municipio: { nome: 'Franca', uf: 'SP' },
  },
];

const estatisticasPorTime: Readonly<
  Record<string, typeof estatisticasZeradas>
> = {
  '1': { ...estatisticasZeradas, partidas: 4, vitorias: 3, gols: 12 },
  '2': { ...estatisticasZeradas, partidas: 4, vitorias: 3, gols: 10 },
  '5': { ...estatisticasZeradas, partidas: 4, vitorias: 1, gols: 5 },
  '6': { ...estatisticasZeradas, partidas: 4, vitorias: 1, gols: 4 },
};

const elencoPorTime: Record<string, readonly MembroElenco[]> = {
  '1': [
    {
      membroId: 'membro-marcos',
      nome: 'Marcos Oliveira',
      nomeUsuario: 'marcosoliveira',
      fotoUrl: null,
      funcao: 'CAPITAO',
      entrouEm: '2024-01-15T12:00:00.000Z',
      estatisticas: {
        ...estatisticasZeradas,
        partidas: 14,
        vitorias: 9,
        gols: 7,
      },
    },
    {
      membroId: 'membro-rafael',
      nome: 'Rafael Lima',
      nomeUsuario: 'rafaellima',
      fotoUrl: null,
      funcao: 'ATLETA',
      entrouEm: '2024-02-01T12:00:00.000Z',
      estatisticas: {
        ...estatisticasZeradas,
        partidas: 12,
        vitorias: 8,
        defesas: 31,
      },
    },
    {
      membroId: 'membro-diego',
      nome: 'Diego Souza',
      nomeUsuario: 'diegosouza',
      fotoUrl: null,
      funcao: 'ATLETA',
      entrouEm: '2025-01-10T12:00:00.000Z',
      estatisticas: {
        ...estatisticasZeradas,
        partidas: 11,
        vitorias: 7,
        gols: 1,
      },
    },
    {
      membroId: 'membro-bruno',
      nome: 'Bruno Alves',
      nomeUsuario: 'brunoalves',
      fotoUrl: null,
      funcao: 'ATLETA',
      entrouEm: '2025-01-10T12:00:00.000Z',
      estatisticas: {
        ...estatisticasZeradas,
        partidas: 10,
        vitorias: 6,
        gols: 2,
      },
    },
  ],
  '2': [
    {
      membroId: 'membro-henrique',
      nome: 'Henrique Alves',
      nomeUsuario: 'henriquealves',
      fotoUrl: null,
      funcao: 'CAPITAO',
      entrouEm: '2023-01-10T12:00:00.000Z',
      estatisticas: {
        ...estatisticasZeradas,
        partidas: 13,
        vitorias: 8,
        gols: 5,
      },
    },
    {
      membroId: 'membro-matheus',
      nome: 'Matheus Costa',
      nomeUsuario: 'matheuscosta',
      fotoUrl: null,
      funcao: 'ATLETA',
      entrouEm: '2024-01-10T12:00:00.000Z',
      estatisticas: {
        ...estatisticasZeradas,
        partidas: 12,
        vitorias: 7,
        gols: 3,
      },
    },
  ],
  '5': [
    {
      membroId: 'membro-eduardo',
      nome: 'Eduardo Nunes',
      nomeUsuario: 'eduardonunes',
      fotoUrl: null,
      funcao: 'CAPITAO',
      entrouEm: '2024-03-10T12:00:00.000Z',
      estatisticas: {
        ...estatisticasZeradas,
        partidas: 7,
        vitorias: 3,
        gols: 2,
      },
    },
  ],
  '6': [
    {
      membroId: 'membro-leonardo',
      nome: 'Leonardo Paiva',
      nomeUsuario: 'leonardopaiva',
      fotoUrl: null,
      funcao: 'CAPITAO',
      entrouEm: '2022-03-10T12:00:00.000Z',
      estatisticas: {
        ...estatisticasZeradas,
        partidas: 9,
        vitorias: 4,
        defesas: 28,
      },
    },
  ],
};

const atletasPublicosPorId = new Map(
  atletasPublicosMock.map((atleta) => [atleta.id, atleta]),
);

for (const time of timesPublicosMock) {
  const existentes = elencoPorTime[String(time.id)] ?? [];
  const nomesExistentes = new Set(existentes.map((membro) => membro.nome));
  const complementares = time.atletaIds.flatMap((atletaId) => {
    const atleta = atletasPublicosPorId.get(atletaId);
    if (!atleta || nomesExistentes.has(atleta.nome)) return [];
    const vinculo = atleta.historicoTimes.find(
      (item) => item.time === time.nome && !item.fim,
    );
    return [
      {
        membroId: `membro-${atleta.id}`,
        nome: atleta.nome,
        nomeUsuario: atleta.nome
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLocaleLowerCase('pt-BR')
          .replace(/\s+/g, ''),
        fotoUrl: null,
        funcao: vinculo?.funcao.toLocaleLowerCase('pt-BR').includes('capitão')
          ? ('CAPITAO' as const)
          : ('ATLETA' as const),
        entrouEm: `${vinculo?.inicio ?? '2026'}-01-10T12:00:00.000Z`,
        estatisticas: {
          ...estatisticasZeradas,
          partidas: atleta.partidasPublicadas,
          vitorias: Math.floor(atleta.partidasPublicadas * 0.6),
          gols: atleta.golsPublicados,
          defesas:
            atleta.posicao === 'Goleiro' ? atleta.partidasPublicadas * 2 : 0,
        },
      },
    ];
  });
  elencoPorTime[String(time.id)] = [...existentes, ...complementares];
}

const convitesPorConta: Readonly<
  Record<string, readonly ConviteTimePendente[]>
> = {
  'mock-person-unlinked-1': [
    {
      id: 'convite-time-leoes-1',
      time: {
        id: '2',
        nome: 'Leões FC',
        sigla: 'LEO',
        escudoUrl: null,
      },
      remetente: {
        nome: 'Henrique Alves',
        nomeUsuario: 'henriquealves',
      },
      expiraEm: '2030-01-07T12:00:00.000Z',
    },
  ],
};

export class TimesPrototipo implements TimesApi {
  private readonly estadosConvite = new Map<
    string,
    'PENDENTE' | 'ACEITO' | 'RECUSADO'
  >();
  private readonly vinculosAceitos = new Map<string, Set<string>>();
  private readonly respostasAceite = new Map<string, AceiteConviteTime>();
  private readonly timesCriados = new Map<
    string,
    { contaId: string; criadoEm: string; time: TimeCriado }
  >();
  private readonly criacoesPorChave = new Map<
    string,
    { payload: string; resposta: TimeCriado }
  >();
  private readonly atualizacoes = new Map<string, RespostaAtualizacaoTime>();
  private readonly escudos = new Map<string, string | null>();
  private readonly convitesEnviados = new Map<string, ConviteTimeEnviado>();
  private readonly timesDesativados = new Set<string>();

  constructor(
    private readonly obterContaAtivaId: (accessToken: string) => string | null,
  ) {}

  private validarDestinatarioConvite(
    token: string,
    accessToken: string,
  ): string {
    const contaId = this.obterContaAtivaId(accessToken);
    if (!contaId) throw this.erroNaoAutenticado();
    if (token !== 'convite-time-leoes-1') throw this.erroConviteNaoEncontrado();
    if (contaId !== 'mock-person-unlinked-1') throw this.erroNaoAutorizado();
    return contaId;
  }

  async consultarConvitePorToken(
    token: string,
    accessToken: string,
  ): Promise<ConviteTimePorToken> {
    this.validarDestinatarioConvite(token, accessToken);
    if ((this.estadosConvite.get(token) ?? 'PENDENTE') !== 'PENDENTE') {
      throw this.erroConviteEncerrado();
    }
    return {
      conviteId: 'convite-time-leoes-1',
      time: { id: '2', nome: 'Leões FC', sigla: 'LEO', escudoUrl: null },
      destinatario: { emailMascarado: 'a***@campolivre.test' },
      status: 'PENDENTE',
      expiraEm: '2030-01-07T12:00:00.000Z',
      acoesPermitidas: ['ACEITAR', 'RECUSAR'],
    };
  }

  async aceitarConvitePorToken(
    token: string,
    accessToken: string,
  ): Promise<AceiteConviteTime> {
    const contaId = this.validarDestinatarioConvite(token, accessToken);
    const anterior = this.respostasAceite.get(token);
    if (anterior) return structuredClone(anterior);
    if ((this.estadosConvite.get(token) ?? 'PENDENTE') !== 'PENDENTE') {
      throw this.erroConviteEncerrado();
    }
    const resposta: AceiteConviteTime = {
      conviteId: 'convite-time-leoes-1',
      status: 'ACEITO',
      timeId: '2',
      membroTimeId: 'membro-aceito-leoes',
      entrouEm: new Date().toISOString(),
    };
    this.estadosConvite.set(token, 'ACEITO');
    const vinculos = this.vinculosAceitos.get(contaId) ?? new Set<string>();
    vinculos.add('2');
    this.vinculosAceitos.set(contaId, vinculos);
    this.respostasAceite.set(token, resposta);
    return structuredClone(resposta);
  }

  async recusarConvitePorToken(
    token: string,
    accessToken: string,
  ): Promise<RecusaConviteTime> {
    this.validarDestinatarioConvite(token, accessToken);
    if ((this.estadosConvite.get(token) ?? 'PENDENTE') !== 'PENDENTE') {
      throw this.erroConviteEncerrado();
    }
    this.estadosConvite.set(token, 'RECUSADO');
    return {
      conviteId: 'convite-time-leoes-1',
      status: 'RECUSADO',
      respondidoEm: new Date().toISOString(),
    };
  }

  async criarTime(
    accessToken: string,
    input: CriacaoTime,
    idempotencyKey: string,
  ): Promise<TimeCriado> {
    const contaId = this.obterContaAtivaId(accessToken);
    if (!contaId) throw this.erroNaoAutenticado();
    const normalizado: CriacaoTime = {
      nome: input.nome.trim().replace(/\s+/g, ' '),
      sigla: input.sigla.trim().toUpperCase(),
      municipioId: input.municipioId,
      descricao: input.descricao?.trim() || null,
    };
    if (normalizado.nome.length < 3 || normalizado.nome.length > 120) {
      throw this.erroDadosInvalidos('Nome inválido');
    }
    if (!/^[A-Z]{3}$/.test(normalizado.sigla)) {
      throw this.erroDadosInvalidos('Sigla inválida');
    }
    if (!normalizado.municipioId) {
      throw this.erroDadosInvalidos('Município obrigatório');
    }
    if ((normalizado.descricao?.length ?? 0) > 500) {
      throw this.erroDadosInvalidos('Descrição inválida');
    }
    const chave = `${contaId}|CRIAR_TIME|${idempotencyKey}`;
    const payload = JSON.stringify(normalizado);
    const anterior = this.criacoesPorChave.get(chave);
    if (anterior) {
      if (anterior.payload !== payload) {
        throw new Error('IDEMPOTENCY_KEY_REUTILIZADA');
      }
      return structuredClone(anterior.resposta);
    }
    const id = globalThis.crypto?.randomUUID?.() ?? `time-${Date.now()}`;
    const resposta: TimeCriado = {
      id,
      ...normalizado,
      escudoUrl: null,
      status: 'ATIVO',
      capitaoMembroId: `${id}-capitao`,
    };
    this.timesCriados.set(id, {
      contaId,
      criadoEm: new Date().toISOString(),
      time: resposta,
    });
    this.criacoesPorChave.set(chave, { payload, resposta });
    return structuredClone(resposta);
  }

  async listarMeusTimes(
    accessToken: string,
    pagina = 1,
    tamanho = 20,
  ): Promise<PaginaTimesDaConta> {
    const contaId = this.obterContaAtivaId(accessToken);
    if (!contaId) throw this.erroNaoAutenticado();

    const existentes =
      contaId === 'mock-person-1'
        ? [
            {
              membroId: 'membro-1',
              funcao: 'CAPITAO' as const,
              entrouEm: '2025-01-10T12:00:00.000Z',
              time: {
                id: '1',
                nome: 'Vila Nova FC',
                sigla: 'VNF',
                escudoUrl: this.escudos.get('1') ?? null,
                status: this.timesDesativados.has('1')
                  ? ('DESATIVADO' as const)
                  : ('ATIVO' as const),
              },
            },
          ]
        : contaId === 'mock-person-athlete-1'
          ? [
              {
                membroId: 'membro-diego',
                funcao: 'ATLETA' as const,
                entrouEm: '2025-01-20T12:00:00.000Z',
                time: {
                  id: '1',
                  nome: 'Vila Nova FC',
                  sigla: 'VNF',
                  escudoUrl: this.escudos.get('1') ?? null,
                  status: this.timesDesativados.has('1')
                    ? ('DESATIVADO' as const)
                    : ('ATIVO' as const),
                },
              },
            ]
          : [];
    const criados = Array.from(this.timesCriados.values())
      .filter((item) => item.contaId === contaId)
      .map(({ time }) => ({
        membroId: time.capitaoMembroId,
        funcao: 'CAPITAO' as const,
        entrouEm: new Date().toISOString(),
        time: {
          id: time.id,
          nome: time.nome,
          sigla: time.sigla,
          escudoUrl: this.escudos.get(time.id) ?? time.escudoUrl,
          status: this.timesDesativados.has(time.id)
            ? ('DESATIVADO' as const)
            : ('ATIVO' as const),
        },
      }));
    const aceitos = Array.from(this.vinculosAceitos.get(contaId) ?? []).flatMap(
      (timeId) => {
        const time = timesAtivos.find((item) => item.id === timeId);
        return time
          ? [
              {
                membroId: `membro-aceito-${timeId}`,
                funcao: 'ATLETA' as const,
                entrouEm: new Date().toISOString(),
                time: {
                  id: time.id,
                  nome: time.nome,
                  sigla: time.sigla,
                  escudoUrl: time.escudoUrl,
                  status: 'ATIVO' as const,
                },
              },
            ]
          : [];
      },
    );
    const todos = [...existentes, ...aceitos, ...criados];
    const inicio = (pagina - 1) * tamanho;

    return {
      itens: todos.slice(inicio, inicio + tamanho),
      pagina,
      tamanho,
      totalItens: todos.length,
      totalPaginas: Math.ceil(todos.length / tamanho),
    };
  }

  async removerAtleta(
    timeId: string,
    membroId: string,
    accessToken: string,
    motivo: string,
  ): Promise<EncerramentoMembroTime> {
    this.garantirCapitao(timeId, accessToken);
    if (!motivo.trim()) throw this.erroDadosInvalidos('Motivo obrigatório');
    if (membroId === 'membro-capitao') {
      throw new ErroApi({
        type: 'https://campolivre.app/problemas/capitao-nao-pode-ser-removido',
        title: 'O capitão não pode ser removido',
        status: 409,
        codigo: 'CAPITAO_NAO_PODE_SER_REMOVIDO',
      });
    }
    return {
      membroId,
      status: 'ENCERRADO',
      saiuEm: new Date().toISOString(),
      participacoesCampeonatoInativadas: 0,
    };
  }

  async sairDoTime(
    timeId: string,
    accessToken: string,
  ): Promise<SaidaVoluntariaTime> {
    const contaId = this.obterContaAtivaId(accessToken);
    if (!contaId) throw this.erroNaoAutenticado();
    if (timeId === '1' && contaId === 'mock-person-1') {
      throw new ErroApi({
        type: 'https://campolivre.app/problemas/capitao-deve-transferir-funcao',
        title: 'Transfira a capitania antes de sair',
        status: 409,
        codigo: 'CAPITAO_DEVE_TRANSFERIR_FUNCAO',
      });
    }
    return {
      membroId: 'membro-atleta',
      status: 'ENCERRADO',
      motivo: 'SAIDA_VOLUNTARIA',
      saiuEm: new Date().toISOString(),
      participacoesCampeonatoInativadas: 0,
    };
  }

  async transferirCapitania(
    timeId: string,
    sucessorMembroId: string,
    accessToken: string,
  ): Promise<TransferenciaCapitania> {
    this.garantirCapitao(timeId, accessToken);
    return {
      timeId,
      capitaoMembroId: sucessorMembroId,
      capitaoAnteriorFuncao: 'ATLETA',
      transferidoEm: new Date().toISOString(),
    };
  }

  async listarHistoricoElenco(
    timeId: string,
    accessToken: string,
    pagina = 1,
    tamanho = 20,
  ): Promise<PaginaHistoricoElenco> {
    this.garantirCapitao(timeId, accessToken);
    const timeCriado = this.timesCriados.get(timeId);
    const identidade = timeCriado
      ? identidadeDaConta(timeCriado.contaId)
      : null;
    const itens = timeCriado
      ? [
          {
            membroId: timeCriado.time.capitaoMembroId,
            usuarioId: timeCriado.contaId,
            nome: identidade!.nome,
            entrouEm: timeCriado.criadoEm,
            saiuEm: null,
            funcaoAtual: 'CAPITAO' as const,
            eventosFuncao: [],
            origem: 'FUNDADOR' as const,
            motivoSaida: null,
          },
        ]
      : [
          {
            membroId: 'membro-capitao',
            usuarioId: 'mock-person-1',
            nome: 'Marcos Oliveira',
            entrouEm: '2024-01-15T12:00:00.000Z',
            saiuEm: null,
            funcaoAtual: 'CAPITAO' as const,
            eventosFuncao: [],
            origem: 'FUNDADOR' as const,
            motivoSaida: null,
          },
        ];
    return {
      itens: itens.slice((pagina - 1) * tamanho, pagina * tamanho),
      pagina,
      tamanho,
      totalItens: itens.length,
      totalPaginas: 1,
    };
  }

  async desativarTime(
    timeId: string,
    accessToken: string,
    motivo: string,
  ): Promise<DesativacaoTime> {
    this.garantirCapitao(timeId, accessToken);
    if (!motivo.trim()) throw this.erroDadosInvalidos('Motivo obrigatório');
    this.timesDesativados.add(timeId);
    return {
      timeId,
      status: 'DESATIVADO',
      desativadoEm: new Date().toISOString(),
      convitesAtletasCancelados: this.convitesEnviados.size,
      convitesCampeonatosCancelados: 0,
    };
  }

  async reativarTime(
    timeId: string,
    accessToken: string,
  ): Promise<ReativacaoTime> {
    const contaId = this.obterContaAtivaId(accessToken);
    if (!contaId) throw this.erroNaoAutenticado();
    if (timeId !== '1' || contaId !== 'mock-person-1') {
      throw this.erroNaoAutorizado();
    }
    this.timesDesativados.delete(timeId);
    return { timeId, status: 'ATIVO', reativadoEm: new Date().toISOString() };
  }

  async buscarAtletaParaConvite(
    email: string,
    accessToken: string,
  ): Promise<AtletaParaConvite> {
    this.garantirCapitao('1', accessToken);
    if (email.trim().toLowerCase() !== 'atleta@campolivre.test') {
      throw new ErroApi({
        type: 'https://campolivre.app/problemas/usuario-nao-encontrado',
        title: 'Usuário não encontrado',
        status: 404,
        codigo: 'USUARIO_NAO_ENCONTRADO',
      });
    }
    return {
      usuarioId: 'mock-athlete-2',
      nome: 'Marina Souza',
      nomeUsuario: 'marinasouza',
      fotoUrl: null,
      municipio: { nome: 'Franca', uf: 'SP' },
      emailMascarado: 'a***@campolivre.test',
    };
  }

  async enviarConvite(
    timeId: string,
    accessToken: string,
    usuarioDestinatarioId: string,
    _idempotencyKey: string,
  ): Promise<ConviteTimeEnviado> {
    this.garantirCapitao(timeId, accessToken);
    if (usuarioDestinatarioId !== 'mock-athlete-2') {
      throw new ErroApi({
        type: 'https://campolivre.app/problemas/usuario-nao-encontrado',
        title: 'Usuário não encontrado',
        status: 404,
        codigo: 'USUARIO_NAO_ENCONTRADO',
      });
    }
    const id = `convite-enviado-${this.convitesEnviados.size + 1}`;
    const convite: ConviteTimeEnviado = {
      id,
      timeId,
      usuarioDestinatarioId,
      status: 'PENDENTE',
      linkCompartilhavel: `/convites-time/mock-token-${id}`,
      expiraEm: '2030-01-07T12:00:00.000Z',
      emailEnvioAceito: true,
    };
    this.convitesEnviados.set(id, convite);
    return convite;
  }

  async listarConvitesEnviados(
    timeId: string,
    accessToken: string,
    pagina = 1,
    tamanho = 20,
  ): Promise<PaginaConvitesTimeEnviados> {
    this.garantirCapitao(timeId, accessToken);
    const itens = [...this.convitesEnviados.values()]
      .filter((convite) => convite.timeId === timeId)
      .map((convite) => ({
        conviteId: convite.id,
        destinatario: {
          usuarioId: convite.usuarioDestinatarioId,
          nome: 'Marina Souza',
          nomeUsuario: 'marinasouza',
          fotoUrl: null,
          emailMascarado: 'a***@campolivre.test',
        },
        status: 'PENDENTE' as const,
        enviadoEm: '2030-01-01T12:00:00.000Z',
        reenviadoEm: null,
        expiraEm: convite.expiraEm,
        acoesPermitidas: ['REENVIAR', 'CANCELAR'] as Array<
          'REENVIAR' | 'CANCELAR'
        >,
      }));
    const inicio = (pagina - 1) * tamanho;
    return {
      itens: itens.slice(inicio, inicio + tamanho),
      pagina,
      tamanho,
      totalItens: itens.length,
      totalPaginas: Math.ceil(itens.length / tamanho),
    };
  }

  async reenviarConvite(
    timeId: string,
    conviteId: string,
    accessToken: string,
    _idempotencyKey: string,
  ): Promise<ReenvioConviteTime> {
    this.garantirCapitao(timeId, accessToken);
    const convite = this.convitesEnviados.get(conviteId);
    if (!convite || convite.timeId !== timeId) {
      throw this.erroConviteNaoEncontrado();
    }
    const resposta: ReenvioConviteTime = {
      conviteId,
      status: 'PENDENTE',
      linkCompartilhavel: `${convite.linkCompartilhavel}-reenviado`,
      expiraEm: '2030-01-14T12:00:00.000Z',
      emailEnvioAceito: true,
    };
    this.convitesEnviados.set(conviteId, {
      ...convite,
      linkCompartilhavel: resposta.linkCompartilhavel,
      expiraEm: resposta.expiraEm,
    });
    return resposta;
  }

  async cancelarConvite(
    timeId: string,
    conviteId: string,
    accessToken: string,
  ): Promise<CancelamentoConviteTime> {
    this.garantirCapitao(timeId, accessToken);
    const convite = this.convitesEnviados.get(conviteId);
    if (!convite || convite.timeId !== timeId) {
      throw this.erroConviteNaoEncontrado();
    }
    this.convitesEnviados.delete(conviteId);
    return {
      conviteId,
      status: 'CANCELADO',
      canceladoEm: new Date().toISOString(),
      canceladoPorUsuarioId: 'mock-person-1',
    };
  }

  async enviarEscudo(
    timeId: string,
    accessToken: string,
    arquivo: File,
  ): Promise<RespostaEscudoTime> {
    this.garantirCapitao(timeId, accessToken);
    if (
      !['image/png', 'image/jpeg', 'image/webp'].includes(arquivo.type) ||
      arquivo.size > 2 * 1024 * 1024
    ) {
      throw new ErroApi({
        type: 'https://campolivre.app/problemas/arquivo-invalido',
        title: 'Arquivo inválido',
        status: arquivo.size > 2 * 1024 * 1024 ? 413 : 400,
        codigo:
          arquivo.size > 2 * 1024 * 1024
            ? 'ARQUIVO_MUITO_GRANDE'
            : 'ARQUIVO_INVALIDO',
      });
    }
    const resposta = {
      timeId,
      escudoUrl: `/prototipo/escudos/${encodeURIComponent(arquivo.name)}`,
      atualizadoEm: new Date().toISOString(),
    };
    this.escudos.set(timeId, resposta.escudoUrl);
    return resposta;
  }

  async removerEscudo(timeId: string, accessToken: string): Promise<void> {
    this.garantirCapitao(timeId, accessToken);
    this.escudos.set(timeId, null);
  }

  async atualizarTime(
    timeId: string,
    accessToken: string,
    input: AtualizacaoTime,
  ): Promise<RespostaAtualizacaoTime> {
    this.garantirCapitao(timeId, accessToken);
    const resposta = {
      id: timeId,
      ...input,
      atualizadoEm: new Date().toISOString(),
    };
    this.atualizacoes.set(timeId, resposta);
    return resposta;
  }

  async consultarTime(timeId: string): Promise<TimeDetalhado> {
    const criado = this.timesCriados.get(timeId)?.time;
    const time = timesAtivos.find((item) => item.id === timeId);
    if (!time && !criado) throw this.erroTimeNaoEncontrado();

    const atualizacao = this.atualizacoes.get(timeId);
    const resumo: TimeResumido = time ?? {
      id: criado!.id,
      nome: criado!.nome,
      sigla: criado!.sigla,
      escudoUrl: criado!.escudoUrl,
      municipio: { nome: 'Franca', uf: 'SP' },
    };

    return {
      ...resumo,
      escudoUrl: this.escudos.has(timeId)
        ? (this.escudos.get(timeId) ?? null)
        : resumo.escudoUrl,
      ...(atualizacao
        ? {
            nome: atualizacao.nome,
            sigla: atualizacao.sigla,
            descricao: atualizacao.descricao,
          }
        : {
            descricao: criado?.descricao ?? 'Time de futebol amador de Franca.',
          }),
      municipio: {
        id: criado?.municipioId ?? 'municipio-franca',
        ...resumo.municipio,
      },
      status: this.timesDesativados.has(timeId) ? 'DESATIVADO' : 'ATIVO',
      capitao: (() => {
        const timeCriado = this.timesCriados.get(timeId);
        if (timeCriado) return identidadeDaConta(timeCriado.contaId);
        const capitao = (elencoPorTime[timeId] ?? []).find(
          (membro) => membro.funcao === 'CAPITAO',
        );
        return {
          nome: capitao?.nome ?? 'Capitão do time',
          nomeUsuario: capitao?.nomeUsuario ?? 'capitao',
        };
      })(),
      elencoResumo: [],
      historicoPartidas: [],
      estatisticasGerais: estatisticasPorTime[timeId] ?? estatisticasZeradas,
      estatisticasPorCampeonato: [],
      posicoesLeaderboards: [],
      titulosEColocacoes: [],
    };
  }

  async listarElenco(
    timeId: string,
    pagina = 1,
    tamanho = 20,
  ): Promise<PaginaElenco> {
    if (
      !timesAtivos.some((item) => item.id === timeId) &&
      !this.timesCriados.has(timeId)
    ) {
      throw this.erroTimeNaoEncontrado();
    }
    const timeCriado = this.timesCriados.get(timeId);
    const todos = timeCriado
      ? [
          {
            membroId: timeCriado.time.capitaoMembroId,
            ...identidadeDaConta(timeCriado.contaId),
            fotoUrl: null,
            funcao: 'CAPITAO' as const,
            entrouEm: timeCriado.criadoEm,
            estatisticas: { ...estatisticasZeradas },
          },
        ]
      : (elencoPorTime[timeId] ?? []);
    const inicio = (pagina - 1) * tamanho;
    return {
      itens: todos.slice(inicio, inicio + tamanho),
      pagina,
      tamanho,
      totalItens: todos.length,
      totalPaginas: Math.ceil(todos.length / tamanho),
    };
  }

  async listarTimes({
    nome,
    uf,
    pagina = 1,
    tamanho = 20,
  }: FiltrosTimes = {}): Promise<PaginaTimes> {
    const termo = nome?.trim().toLocaleLowerCase('pt-BR');
    const todos = [
      ...timesAtivos,
      ...Array.from(this.timesCriados.values(), ({ time }) => ({
        id: time.id,
        nome: time.nome,
        sigla: time.sigla,
        escudoUrl: this.escudos.get(time.id) ?? time.escudoUrl,
        municipio: { nome: 'Franca', uf: 'SP' },
      })),
    ];
    const filtrados = todos.filter(
      (time) =>
        (!termo || time.nome.toLocaleLowerCase('pt-BR').includes(termo)) &&
        (!uf || time.municipio.uf === uf),
    );
    const inicio = (pagina - 1) * tamanho;

    return {
      itens: filtrados.slice(inicio, inicio + tamanho),
      pagina,
      tamanho,
      totalItens: filtrados.length,
      totalPaginas: Math.ceil(filtrados.length / tamanho),
    };
  }

  async listarMeusConvites(
    accessToken: string,
    pagina = 1,
    tamanho = 20,
  ): Promise<PaginaConvitesTime> {
    const contaId = this.obterContaAtivaId(accessToken);
    if (!contaId) {
      throw new ErroApi({
        type: 'https://campolivre.app/problemas/access-token-invalido',
        title: 'Access token inválido',
        status: 401,
        codigo: 'ACCESS_TOKEN_INVALIDO',
      });
    }
    const todos = (convitesPorConta[contaId] ?? []).filter(
      (convite) =>
        (this.estadosConvite.get(convite.id) ?? 'PENDENTE') === 'PENDENTE',
    );
    const inicio = (pagina - 1) * tamanho;
    const itens = todos.slice(inicio, inicio + tamanho);

    return {
      itens: [...itens],
      pagina,
      tamanho,
      totalItens: todos.length,
      totalPaginas: Math.ceil(todos.length / tamanho),
    };
  }

  private erroTimeNaoEncontrado(): ErroApi {
    return new ErroApi({
      type: 'https://campolivre.app/problemas/time-nao-encontrado',
      title: 'Time não encontrado',
      status: 404,
      codigo: 'TIME_NAO_ENCONTRADO',
    });
  }

  private erroConviteNaoEncontrado(): ErroApi {
    return new ErroApi({
      type: 'https://campolivre.app/problemas/convite-nao-encontrado',
      title: 'Convite não encontrado',
      status: 404,
      codigo: 'CONVITE_NAO_ENCONTRADO',
    });
  }

  private erroConviteEncerrado(): ErroApi {
    return new ErroApi({
      type: 'https://campolivre.app/problemas/convite-nao-pendente',
      title: 'O convite já foi encerrado',
      status: 409,
      codigo: 'CONVITE_NAO_PENDENTE',
    });
  }

  private erroNaoAutenticado(): ErroApi {
    return new ErroApi({
      type: 'https://campolivre.app/problemas/access-token-invalido',
      title: 'Access token inválido',
      status: 401,
      codigo: 'ACCESS_TOKEN_INVALIDO',
    });
  }

  private erroNaoAutorizado(): ErroApi {
    return new ErroApi({
      type: 'https://campolivre.app/problemas/nao-autorizado',
      title: 'Operação não autorizada',
      status: 403,
      codigo: 'NAO_AUTORIZADO',
    });
  }

  private erroDadosInvalidos(title: string): ErroApi {
    return new ErroApi({
      type: 'https://campolivre.app/problemas/dados-invalidos',
      title,
      status: 400,
      codigo: 'DADOS_INVALIDOS',
    });
  }

  private garantirCapitao(timeId: string, accessToken: string): void {
    const contaId = this.obterContaAtivaId(accessToken);
    if (!contaId) {
      throw new ErroApi({
        type: 'https://campolivre.app/problemas/access-token-invalido',
        title: 'Access token inválido',
        status: 401,
        codigo: 'ACCESS_TOKEN_INVALIDO',
      });
    }
    const criado = this.timesCriados.get(timeId);
    const capitaoDoCriado = criado?.contaId === contaId;
    if (!capitaoDoCriado && (timeId !== '1' || contaId !== 'mock-person-1')) {
      throw new ErroApi({
        type: 'https://campolivre.app/problemas/nao-autorizado',
        title: 'Operação não autorizada',
        status: 403,
        codigo: 'NAO_AUTORIZADO',
      });
    }
  }
}
