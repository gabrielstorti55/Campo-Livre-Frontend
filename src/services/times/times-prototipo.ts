import { ErroApi } from '@/services/api/problem-details';
import type { TimesApi } from '@/services/times/times-api';
import type {
  AtletaParaConvite,
  AtualizacaoTime,
  CancelamentoConviteTime,
  ConviteTimeEnviado,
  ConviteTimePendente,
  DesativacaoTime,
  EncerramentoMembroTime,
  FiltrosTimes,
  MembroElenco,
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

const timesAtivos: readonly TimeResumido[] = [
  {
    id: '2',
    nome: 'Leões FC',
    sigla: 'LEO',
    escudoUrl: null,
    municipio: { nome: 'Franca', uf: 'SP' },
  },
  {
    id: '3',
    nome: 'Tigres da Vila',
    sigla: 'TIG',
    escudoUrl: null,
    municipio: { nome: 'Franca', uf: 'SP' },
  },
];

const elencoPorTime: Readonly<Record<string, readonly MembroElenco[]>> = {
  '2': [
    {
      membroId: 'membro-1',
      nome: 'Rafael Lima',
      nomeUsuario: 'rafaellima',
      fotoUrl: null,
      funcao: 'CAPITAO',
      entrouEm: '2025-01-10T12:00:00.000Z',
      estatisticas: { ...estatisticasZeradas, partidas: 12, vitorias: 8 },
    },
  ],
};

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
        nome: 'Rafael Lima',
        nomeUsuario: 'rafaellima',
      },
      expiraEm: '2030-01-07T12:00:00.000Z',
    },
  ],
};

export class TimesPrototipo implements TimesApi {
  private readonly atualizacoes = new Map<string, RespostaAtualizacaoTime>();
  private readonly escudos = new Map<string, string | null>();
  private readonly convitesEnviados = new Map<string, ConviteTimeEnviado>();
  private readonly timesDesativados = new Set<string>();

  constructor(
    private readonly obterContaAtivaId: (accessToken: string) => string | null,
  ) {}

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
    if (timeId === '2' && contaId === 'mock-person-1') {
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
    const itens = [
      {
        membroId: 'membro-capitao',
        usuarioId: 'mock-person-1',
        nome: 'Rafael Lima',
        entrouEm: '2028-01-01T12:00:00.000Z',
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
    if (timeId !== '2' || contaId !== 'mock-person-1') {
      throw this.erroNaoAutorizado();
    }
    this.timesDesativados.delete(timeId);
    return { timeId, status: 'ATIVO', reativadoEm: new Date().toISOString() };
  }

  async buscarAtletaParaConvite(
    email: string,
    accessToken: string,
  ): Promise<AtletaParaConvite> {
    this.garantirCapitao('2', accessToken);
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
    const time = timesAtivos.find((item) => item.id === timeId);
    if (!time) throw this.erroTimeNaoEncontrado();

    const atualizacao = this.atualizacoes.get(timeId);

    return {
      ...time,
      escudoUrl: this.escudos.has(timeId)
        ? (this.escudos.get(timeId) ?? null)
        : time.escudoUrl,
      ...(atualizacao
        ? {
            nome: atualizacao.nome,
            sigla: atualizacao.sigla,
            descricao: atualizacao.descricao,
          }
        : { descricao: 'Time de futebol amador de Franca.' }),
      municipio: { id: 'municipio-franca', ...time.municipio },
      status: this.timesDesativados.has(timeId) ? 'DESATIVADO' : 'ATIVO',
      capitao: { nome: 'Rafael Lima', nomeUsuario: 'rafaellima' },
      elencoResumo: [],
      historicoPartidas: [],
      estatisticasGerais: { ...estatisticasZeradas, partidas: 12, vitorias: 8 },
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
    if (!timesAtivos.some((item) => item.id === timeId)) {
      throw this.erroTimeNaoEncontrado();
    }
    const todos = elencoPorTime[timeId] ?? [];
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
    const filtrados = timesAtivos.filter(
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
    const todos = convitesPorConta[contaId] ?? [];
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
    if (timeId !== '2' || contaId !== 'mock-person-1') {
      throw new ErroApi({
        type: 'https://campolivre.app/problemas/nao-autorizado',
        title: 'Operação não autorizada',
        status: 403,
        codigo: 'NAO_AUTORIZADO',
      });
    }
  }
}
