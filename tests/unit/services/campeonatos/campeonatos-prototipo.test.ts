import { describe, expect, it } from 'vitest';

import { CampeonatosPrototipo } from '@/services/campeonatos/campeonatos-prototipo';

import type { ConfiguracaoFase } from '@/types/api/campeonatos';

const inputCampeonato = (nome: string) => ({
  nome,
  municipioId: '00000000-0000-4000-8000-000000000001',
  contexto: 'PESSOAL' as const,
  prefeituraId: null,
  formato: 'PONTOS_CORRIDOS' as const,
  inicioPrevistoEm: '2026-10-01',
});

const fasePontos = (
  nome: string,
  tipo: 'PONTOS_CORRIDOS' | 'GRUPOS',
  ordem: number,
): ConfiguracaoFase => ({
  nome,
  tipo,
  ordem,
  turnos: 'TURNO_UNICO',
  pontosVitoria: 3,
  pontosEmpate: 1,
  pontosDerrota: 0,
  quantidadeGrupos: tipo === 'GRUPOS' ? 1 : null,
  classificadosPorGrupo: tipo === 'GRUPOS' ? 2 : null,
  numeroPartidasConfronto: null,
  permiteProrrogacao: null,
  permitePenaltis: null,
  golDeOuro: null,
});

const faseMataMata = (nome: string, ordem: number): ConfiguracaoFase => ({
  nome,
  tipo: 'MATA_MATA',
  ordem,
  turnos: null,
  pontosVitoria: null,
  pontosEmpate: null,
  pontosDerrota: null,
  quantidadeGrupos: null,
  classificadosPorGrupo: null,
  numeroPartidasConfronto: 1,
  permiteProrrogacao: true,
  permitePenaltis: true,
  golDeOuro: false,
});

const posicoesDeTimes = (campeonatoId: string, timeIds: string[]) =>
  timeIds.map((timeId, indice) => ({
    timeId,
    faseId: `${campeonatoId}-fase-1`,
    grupoId: null,
    posicao: indice + 1,
    semente: indice + 1,
  }));

describe('CampeonatosPrototipo', () => {
  it('projeta a identidade humana do responsável sem expor IDs mockados', async () => {
    const api = new CampeonatosPrototipo(() => 'mock-person-unlinked-1');
    const criado = await api.criarCampeonato(
      'token',
      inputCampeonato('Copa do Lucas'),
      'criar-copa-lucas',
    );

    await expect(
      api.listarOrganizadores(criado.id, 'token', 1, 20, 'ATIVO'),
    ).resolves.toMatchObject({
      itens: [
        expect.objectContaining({
          usuario: {
            id: 'mock-person-unlinked-1',
            nome: 'Lucas Ferreira',
            nomeUsuario: 'lucasferreira',
          },
          funcao: 'RESPONSAVEL',
        }),
      ],
    });
  });

  it('nega administração para conta autenticada sem vínculo no campeonato', async () => {
    const api = new CampeonatosPrototipo((token) =>
      token === 'dono' ? 'mock-person-1' : 'conta-sem-vinculo',
    );
    const criado = await api.criarCampeonato(
      'dono',
      inputCampeonato('Copa autorização contextual'),
      'criar-autorizacao-contextual',
    );

    await expect(
      api.consultarAdministracao(criado.id, 'intruso'),
    ).rejects.toThrow('NAO_AUTORIZADO');
    await expect(
      api.atualizarCampeonato(criado.id, 'intruso', {
        nome: 'Nome adulterado',
        descricao: null,
        inicioPrevistoEm: '2026-10-02',
        fimPrevistoEm: null,
      }),
    ).rejects.toThrow('NAO_AUTORIZADO');
  });

  it('nega gestão da equipe a organizador sem essa permissão', async () => {
    const api = new CampeonatosPrototipo(() => 'mock-person-collaborator-1');

    await expect(
      api.adicionarOrganizador('4', 'usuario-novo', 'token'),
    ).rejects.toThrow('PERMISSAO_INSUFICIENTE');
  });

  it('projeta o encerramento das inscrições nas consultas subsequentes', async () => {
    const api = new CampeonatosPrototipo(() => 'mock-person-1');
    const criado = await api.criarCampeonato(
      'token',
      inputCampeonato('Copa inscrições'),
      'criar-inscricoes',
    );

    const antes = await api.consultarAdministracao(criado.id, 'token');
    expect(antes.autoridade.permissoes).toEqual(
      expect.arrayContaining([
        'GERENCIAR_EQUIPE',
        'GERENCIAR_CONVITES',
        'CONFIGURAR_ESTRUTURA',
      ]),
    );
    expect(antes.operacoesPermitidas).toEqual(
      expect.arrayContaining([
        'CONVIDAR_TIME',
        'CONFIGURAR_ESTRUTURA',
        'FINALIZAR_INSCRICOES',
      ]),
    );

    await api.finalizarInscricoes(criado.id, 'token', 'finalizar-inscricoes');

    await expect(api.consultarCampeonato(criado.id)).resolves.toMatchObject({
      status: 'AGUARDANDO_SORTEIO',
    });
    const depois = await api.consultarAdministracao(criado.id, 'token');
    expect(depois.status).toBe('AGUARDANDO_SORTEIO');
    expect(depois.operacoesPermitidas).toContain('GERAR_ESTRUTURA');
    expect(depois.operacoesPermitidas).not.toContain('FINALIZAR_INSCRICOES');
  });

  it('projeta organizadores adicionados e removidos com filtros de status', async () => {
    const api = new CampeonatosPrototipo((token) =>
      token === 'colaborador' ? 'usuario-colaborador' : 'mock-person-1',
    );
    const criado = await api.criarCampeonato(
      'token',
      inputCampeonato('Copa equipe'),
      'criar-equipe',
    );
    const adicionado = await api.adicionarOrganizador(
      criado.id,
      'usuario-colaborador',
      'token',
    );

    const ativos = await api.listarOrganizadores(
      criado.id,
      'token',
      1,
      20,
      'ATIVO',
    );
    expect(ativos.itens).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          organizadorId: adicionado.organizadorId,
          status: 'ATIVO',
          funcao: 'ORGANIZADOR',
        }),
      ]),
    );
    await expect(
      api.consultarAdministracao(criado.id, 'colaborador'),
    ).resolves.toMatchObject({ autoridade: { funcao: 'ORGANIZADOR' } });

    await api.removerOrganizador(
      criado.id,
      adicionado.organizadorId,
      'token',
      'Alteração da equipe',
    );

    const encerrados = await api.listarOrganizadores(
      criado.id,
      'token',
      1,
      20,
      'ENCERRADO',
    );
    expect(encerrados.itens).toEqual([
      expect.objectContaining({
        organizadorId: adicionado.organizadorId,
        status: 'ENCERRADO',
        podeSerRemovido: false,
      }),
    ]);
    await expect(
      api.consultarAdministracao(criado.id, 'colaborador'),
    ).rejects.toThrow('NAO_AUTORIZADO');
  });

  it('projeta o cancelamento de convite enviado', async () => {
    const api = new CampeonatosPrototipo(() => 'mock-person-1');
    const criado = await api.criarCampeonato(
      'token',
      inputCampeonato('Copa convites'),
      'criar-convites',
    );
    const convite = await api.convidarTime(criado.id, '42', 'token');

    await api.cancelarConviteTime(criado.id, convite.conviteId, 'token');

    const pagina = await api.listarConvitesEnviados(
      criado.id,
      'token',
      1,
      20,
      'CANCELADO',
    );
    expect(pagina.itens).toEqual([
      expect.objectContaining({
        conviteId: convite.conviteId,
        status: 'CANCELADO',
        podeCancelar: false,
        encerradoEm: expect.any(String),
      }),
    ]);
  });

  it('isola a idempotência de criação por conta autenticada', async () => {
    const api = new CampeonatosPrototipo((token) => token);

    const primeira = await api.criarCampeonato(
      'conta-a',
      inputCampeonato('Copa da conta A'),
      'mesma-chave',
    );
    const repetida = await api.criarCampeonato(
      'conta-a',
      inputCampeonato('Copa da conta A'),
      'mesma-chave',
    );
    const outraConta = await api.criarCampeonato(
      'conta-b',
      inputCampeonato('Copa da conta B'),
      'mesma-chave',
    );

    expect(repetida).toEqual(primeira);
    await expect(
      api.criarCampeonato(
        'conta-a',
        inputCampeonato('Payload divergente'),
        'mesma-chave',
      ),
    ).rejects.toThrow('IDEMPOTENCY_KEY_REUTILIZADA');
    expect(outraConta.id).not.toBe(primeira.id);
    expect(outraConta.responsavelUsuarioId).toBe('conta-b');
  });

  it('impede organizador de cancelar campeonato ou gerenciar a equipe', async () => {
    const api = new CampeonatosPrototipo(() => 'mock-person-collaborator-1');

    await expect(
      api.cancelarCampeonato('4', 'token', 'Sem autorização'),
    ).rejects.toThrow('PERMISSAO_INSUFICIENTE');
    await expect(
      api.buscarOrganizadorElegivel('4', 'pessoa@teste.com', 'token'),
    ).rejects.toThrow('PERMISSAO_INSUFICIENTE');
    await expect(
      api.removerOrganizador('4', 'qualquer', 'token', 'Sem autorização'),
    ).rejects.toThrow('PERMISSAO_INSUFICIENTE');
  });

  it('rejeita mutações que não estão publicadas para o estado atual', async () => {
    const api = new CampeonatosPrototipo(() => 'mock-person-1');

    await expect(
      api.atualizarCampeonato('5', 'token', {
        nome: 'Campeonato encerrado adulterado',
        descricao: null,
        inicioPrevistoEm: '2026-10-02',
        fimPrevistoEm: null,
      }),
    ).rejects.toThrow('OPERACAO_NAO_PERMITIDA');
    await expect(api.iniciarCampeonato('4', 'token')).rejects.toThrow(
      'OPERACAO_NAO_PERMITIDA',
    );
    await expect(
      api.materializarPontosCorridos('4', 'token', 'AUTOMATICA', [], 'cedo'),
    ).rejects.toThrow('OPERACAO_NAO_PERMITIDA');
    await expect(
      api.adicionarOrganizador('7', 'usuario-tardio', 'token'),
    ).rejects.toThrow('OPERACAO_NAO_PERMITIDA');
  });

  it('só finaliza inscrições válidas, em EM_INSCRICOES, e de forma idempotente', async () => {
    const api = new CampeonatosPrototipo(() => 'mock-person-1');

    await expect(
      api.finalizarInscricoes('4', 'token', 'finalizar-pendente'),
    ).rejects.toThrow('CONFIGURACAO_INVALIDA');

    const criado = await api.criarCampeonato(
      'token',
      inputCampeonato('Copa válida'),
      'criar-valida',
    );
    const primeira = await api.finalizarInscricoes(
      criado.id,
      'token',
      'finalizar-valida',
    );
    const repetida = await api.finalizarInscricoes(
      criado.id,
      'token',
      'finalizar-valida',
    );

    expect(repetida).toEqual(primeira);
    await expect(
      api.finalizarInscricoes(criado.id, 'token', 'outra-chave'),
    ).rejects.toThrow('OPERACAO_NAO_PERMITIDA');
  });

  it('preserva fases e coleções ao materializar na ordem e repete respostas idempotentes', async () => {
    const api = new CampeonatosPrototipo(() => 'mock-person-1');
    const criado = await api.criarCampeonato(
      'token',
      { ...inputCampeonato('Copa híbrida'), formato: 'GRUPOS_E_MATA_MATA' },
      'criar-hibrida',
    );
    await api.selecionarEstruturaFases(criado.id, 'token', {
      formato: 'GRUPOS_E_MATA_MATA',
      fases: [
        fasePontos('Grupos', 'GRUPOS', 1),
        faseMataMata('Eliminatórias', 2),
      ],
    });
    await expect(
      api.consultarAdministracao(criado.id, 'token'),
    ).resolves.toMatchObject({ formato: 'GRUPOS_E_MATA_MATA' });
    await api.finalizarInscricoes(criado.id, 'token', 'finalizar-hibrida');
    const posicoes = posicoesDeTimes(criado.id, ['1', '2', '3', '4']);

    await expect(
      api.materializarMataMata(
        criado.id,
        'token',
        'AUTOMATICA',
        [],
        'mata-sem-distribuir',
      ),
    ).rejects.toThrow('ORDEM_MATERIALIZACAO_INVALIDA');

    const distribuida = await api.distribuirTimes(
      criado.id,
      'token',
      'MANUAL',
      posicoes,
      'distribuir-hibrida',
    );
    const distribuidaNovamente = await api.distribuirTimes(
      criado.id,
      'token',
      'MANUAL',
      posicoes,
      'distribuir-hibrida',
    );
    expect(distribuidaNovamente).toEqual(distribuida);
    await expect(
      api.distribuirTimes(
        criado.id,
        'token',
        'AUTOMATICA',
        [],
        'distribuir-hibrida',
      ),
    ).rejects.toThrow('IDEMPOTENCY_KEY_REUTILIZADA');

    const mata = await api.materializarMataMata(
      criado.id,
      'token',
      'AUTOMATICA',
      [],
      'mata-fora-de-ordem',
    );

    const pontos = await api.materializarPontosCorridos(
      criado.id,
      'token',
      'AUTOMATICA',
      [],
      'pontos-hibrida',
    );
    expect(
      await api.materializarPontosCorridos(
        criado.id,
        'token',
        'AUTOMATICA',
        [],
        'pontos-hibrida',
      ),
    ).toEqual(pontos);
    await expect(
      api.materializarPontosCorridos(
        criado.id,
        'token',
        'MANUAL',
        [],
        'pontos-hibrida',
      ),
    ).rejects.toThrow('IDEMPOTENCY_KEY_REUTILIZADA');
    expect(
      await api.materializarMataMata(
        criado.id,
        'token',
        'AUTOMATICA',
        [],
        'mata-fora-de-ordem',
      ),
    ).toEqual(mata);
    await expect(
      api.materializarMataMata(
        criado.id,
        'token',
        'MANUAL',
        [],
        'mata-fora-de-ordem',
      ),
    ).rejects.toThrow('IDEMPOTENCY_KEY_REUTILIZADA');

    const estrutura = await api.consultarEstrutura(criado.id, 'token');
    expect(estrutura.pontosCorridos).not.toHaveLength(0);
    expect(estrutura.mataMata).not.toHaveLength(0);
    expect(
      estrutura.mataMata.every(
        (confronto) => confronto.timeAId === null && confronto.timeBId === null,
      ),
    ).toBe(true);
    const fases = await api.consultarFases(criado.id, 'token');
    expect(fases.fases.map((fase) => fase.statusMaterializacao)).toEqual([
      'GERADA',
      'GERADA',
    ]);
  });

  it.each([
    ['TURNO_UNICO' as const, 6, 3],
    ['TURNO_E_RETORNO' as const, 12, 6],
  ])(
    'gera round-robin %s com cardinalidade e rodadas corretas',
    async (turnos, quantidadePartidas, quantidadeRodadas) => {
      const api = new CampeonatosPrototipo(() => 'mock-person-1');
      const criado = await api.criarCampeonato(
        'token',
        inputCampeonato(`Liga ${turnos}`),
        `criar-${turnos}`,
      );
      await api.selecionarEstruturaFases(criado.id, 'token', {
        formato: 'PONTOS_CORRIDOS',
        fases: [{ ...fasePontos('Liga', 'PONTOS_CORRIDOS', 1), turnos }],
      });
      await api.finalizarInscricoes(criado.id, 'token', `finalizar-${turnos}`);
      await api.distribuirTimes(
        criado.id,
        'token',
        'MANUAL',
        posicoesDeTimes(criado.id, ['1', '2', '3', '4']),
        `distribuir-${turnos}`,
      );

      const resultado = await api.materializarPontosCorridos(
        criado.id,
        'token',
        'AUTOMATICA',
        [],
        `materializar-${turnos}`,
      );
      const estrutura = await api.consultarEstrutura(criado.id, 'token');
      const rodadas = estrutura.pontosCorridos[0]?.rodadas ?? [];

      expect(resultado.partidasCriadas).toBe(quantidadePartidas);
      expect(rodadas).toHaveLength(quantidadeRodadas);
      expect(rodadas.every((rodada) => rodada.partidaIds.length === 2)).toBe(
        true,
      );
    },
  );

  it('gera chave mata-mata coerente em rodadas, sem confrontos em estrela', async () => {
    const api = new CampeonatosPrototipo(() => 'mock-person-1');
    const criado = await api.criarCampeonato(
      'token',
      { ...inputCampeonato('Copa eliminatória'), formato: 'MATA_MATA' },
      'criar-eliminatoria',
    );
    await api.selecionarEstruturaFases(criado.id, 'token', {
      formato: 'MATA_MATA',
      fases: [faseMataMata('Eliminatórias', 1)],
    });
    await api.finalizarInscricoes(criado.id, 'token', 'finalizar-eliminatoria');
    await api.distribuirTimes(
      criado.id,
      'token',
      'MANUAL',
      posicoesDeTimes(criado.id, ['1', '2', '3', '4']),
      'distribuir-eliminatoria',
    );
    await api.materializarMataMata(
      criado.id,
      'token',
      'AUTOMATICA',
      [],
      'mata-eliminatoria',
    );

    const confrontos = (await api.consultarEstrutura(criado.id, 'token'))
      .mataMata;
    const primeiraRodada = confrontos.filter((item) => item.rodada === 1);
    const final = confrontos.find((item) => item.rodada === 2);
    expect(confrontos).toHaveLength(3);
    expect(primeiraRodada).toHaveLength(2);
    expect(
      new Set(primeiraRodada.flatMap((item) => [item.timeAId, item.timeBId])),
    ).toEqual(new Set(['1', '2', '3', '4']));
    expect(primeiraRodada.map((item) => item.confrontoDestinoId)).toEqual([
      final?.confrontoId,
      final?.confrontoId,
    ]);
    expect(primeiraRodada.map((item) => item.posicaoDestino)).toEqual([
      'A',
      'B',
    ]);
    expect(final).toMatchObject({ timeAId: null, timeBId: null });
  });
});
