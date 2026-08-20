import type {
  AtletaPublico,
  CampeonatoPublico,
  FiltrosCampeonatoPublico,
  TimePublico,
} from '@/features/publico/model/public-models';
import {
  artilhariaPublicaMock,
  atletasPublicosMock,
  campeonatosPublicosMock,
  classificacaoPublicaMock,
  partidasPublicasMock,
  locaisPartidaPublicosMock,
  timesPublicosMock,
} from '@/features/publico/mocks/public-fixtures';
import type { PublicCatalogPort } from '@/features/publico/services/public-catalog';

function sortCampeonatos(
  lista: CampeonatoPublico[],
  ordenacao: FiltrosCampeonatoPublico['ordenacao'],
) {
  return [...lista].sort((a, b) => {
    if (ordenacao === 'NOME') return a.nome.localeCompare(b.nome, 'pt-BR');
    if (ordenacao === 'RECENTES') return b.id - a.id;
    return a.inicio.localeCompare(b.inicio);
  });
}

export const publicCatalogMock: PublicCatalogPort = {
  listarCampeonatos(filtros = {}) {
    const busca = filtros.busca?.trim().toLocaleLowerCase('pt-BR') ?? '';
    const lista = campeonatosPublicosMock.filter((item) => {
      if (!item.publicado) return false;
      if (busca && !item.nome.toLocaleLowerCase('pt-BR').includes(busca))
        return false;
      if (
        filtros.estado &&
        filtros.estado !== 'TODOS' &&
        item.estado !== filtros.estado
      )
        return false;
      if (filtros.municipio && item.municipio !== filtros.municipio)
        return false;
      if (filtros.uf && item.uf !== filtros.uf) return false;
      if (
        filtros.formato &&
        filtros.formato !== 'TODOS' &&
        item.formato !== filtros.formato
      )
        return false;
      if (filtros.periodo === '2026' && !item.inicio.startsWith('2026'))
        return false;
      if (filtros.periodo === '2025' && !item.inicio.startsWith('2025'))
        return false;
      if (filtros.periodo === 'PROXIMOS' && item.inicio < '2026-08-19')
        return false;
      return true;
    });
    return sortCampeonatos(lista, filtros.ordenacao ?? 'INICIO_ASC');
  },

  obterCampeonato(id) {
    const campeonato = campeonatosPublicosMock.find(
      (item) => item.id === Number(id) && item.publicado,
    );
    if (!campeonato) return undefined;
    const times = campeonato.timeIds
      .map((timeId) => timesPublicosMock.find((time) => time.id === timeId))
      .filter((time): time is TimePublico => Boolean(time?.publicado));
    const partidas = partidasPublicasMock.filter(
      (partida) => partida.campeonatoId === campeonato.id,
    );
    const classificacao = classificacaoPublicaMock
      .filter((linha) => linha.campeonatoId === campeonato.id)
      .map((linha) => ({
        ...linha,
        time: timesPublicosMock.find((time) => time.id === linha.timeId)!,
      }))
      .filter((linha) => Boolean(linha.time))
      .sort((a, b) => b.pontos - a.pontos);
    return { campeonato, times, partidas, classificacao };
  },

  listarTimes(busca = '') {
    const termo = busca.trim().toLocaleLowerCase('pt-BR');
    return timesPublicosMock.filter(
      (time) =>
        time.publicado && time.nome.toLocaleLowerCase('pt-BR').includes(termo),
    );
  },

  obterTime(id) {
    const time = timesPublicosMock.find(
      (item) => item.id === Number(id) && item.publicado,
    );
    if (!time) return undefined;
    const elenco = time.atletaIds
      .map((atletaId) =>
        atletasPublicosMock.find((atleta) => atleta.id === atletaId),
      )
      .filter((atleta): atleta is AtletaPublico =>
        Boolean(atleta?.perfilPublico),
      );
    const campeonatos = time.campeonatoIds
      .map((campeonatoId) =>
        campeonatosPublicosMock.find(
          (campeonato) => campeonato.id === campeonatoId,
        ),
      )
      .filter((campeonato): campeonato is CampeonatoPublico =>
        Boolean(campeonato?.publicado),
      );
    return { time, elenco, campeonatos };
  },

  listarPartidas() {
    return partidasPublicasMock.filter((partida) =>
      campeonatosPublicosMock.some(
        (campeonato) =>
          campeonato.id === partida.campeonatoId && campeonato.publicado,
      ),
    );
  },

  obterPartida(id) {
    const partida = partidasPublicasMock.find((item) => item.id === Number(id));
    if (!partida) return undefined;
    const campeonatoPublico = campeonatosPublicosMock.some(
      (campeonato) =>
        campeonato.id === partida.campeonatoId && campeonato.publicado,
    );
    return campeonatoPublico ? partida : undefined;
  },

  listarAtletas(busca = '') {
    const termo = busca.trim().toLocaleLowerCase('pt-BR');
    return atletasPublicosMock.filter(
      (atleta) =>
        atleta.perfilPublico &&
        atleta.nome.toLocaleLowerCase('pt-BR').includes(termo),
    );
  },

  obterAtleta(id) {
    return atletasPublicosMock.find((item) => item.id === Number(id));
  },
};

export function getPublicTeamName(id: number) {
  return (
    timesPublicosMock.find((time) => time.id === id)?.nome ??
    'Time não informado'
  );
}

export function getMatchVenueName(id?: number) {
  if (!id) return 'A definir';
  return (
    locaisPartidaPublicosMock.find((campo) => campo.id === id)?.nome ??
    'Campo não informado'
  );
}

export function getPublicChampionshipName(id: number) {
  return (
    campeonatosPublicosMock.find((campeonato) => campeonato.id === id)?.nome ??
    'Campeonato não informado'
  );
}

export function listarArtilhariaPublica(campeonatoId: number) {
  return artilhariaPublicaMock
    .filter((linha) => linha.campeonatoId === campeonatoId)
    .map((linha) => ({
      ...linha,
      atleta: atletasPublicosMock.find(
        (atleta) => atleta.id === linha.atletaId,
      ),
      time: timesPublicosMock.find((time) => time.id === linha.timeId),
    }))
    .filter(
      (linha) =>
        Boolean(linha.atleta?.perfilPublico) && Boolean(linha.time?.publicado),
    )
    .sort((a, b) => b.gols - a.gols);
}
