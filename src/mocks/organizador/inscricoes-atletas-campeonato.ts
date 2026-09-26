import {
  atletasPublicosMock,
  timesPublicosMock,
} from '@/mocks/publico/dados-publicos';

const atletasNaoInscritosPorCampeonatoTime: Readonly<
  Record<string, Readonly<Record<string, readonly number[]>>>
> = {
  '8': {
    '1': [43],
    '2': [44],
    '5': [45],
    '6': [46],
  },
};

export function obterAtletasDoTimeNoCampeonatoPrototipo(
  campeonatoId: string,
  timeId: string,
) {
  const time = timesPublicosMock.find((item) => String(item.id) === timeId);
  const excluidos = new Set(
    atletasNaoInscritosPorCampeonatoTime[campeonatoId]?.[timeId] ?? [],
  );
  const elenco = (time?.atletaIds ?? []).flatMap((atletaId) => {
    const atleta = atletasPublicosMock.find((item) => item.id === atletaId);
    return atleta ? [atleta] : [];
  });
  return {
    inscritos: elenco.filter((atleta) => !excluidos.has(atleta.id)),
    naoInscritos: elenco.filter((atleta) => excluidos.has(atleta.id)),
  };
}
