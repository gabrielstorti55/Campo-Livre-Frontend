export type PeriodoEvento = 'primeiro-tempo' | 'segundo-tempo' | 'prorrogacao';

export type TempoEvento = {
  periodo: PeriodoEvento;
  minutoRegulamentar: number;
  acrescimo: number | null;
};

const rotulosPeriodo: Record<PeriodoEvento, string> = {
  'primeiro-tempo': 'Primeiro tempo',
  'segundo-tempo': 'Segundo tempo',
  prorrogacao: 'Prorrogação',
};

export function criarTempoEvento(
  periodo: PeriodoEvento,
  minutoRegulamentar: string,
  acrescimo: string,
): TempoEvento {
  const minuto = Number(minutoRegulamentar);
  const adicional = acrescimo === '' ? null : Number(acrescimo);

  if (!Number.isInteger(minuto) || minuto < 0) {
    throw new Error('Minuto regulamentar inválido.');
  }
  if (adicional !== null && (!Number.isInteger(adicional) || adicional <= 0)) {
    throw new Error('Acréscimo inválido.');
  }

  return { periodo, minutoRegulamentar: minuto, acrescimo: adicional };
}

export function formatarTempoEvento(tempo: TempoEvento): string {
  const acrescimo = tempo.acrescimo === null ? '' : `+${tempo.acrescimo}`;
  return `${rotulosPeriodo[tempo.periodo]} · ${tempo.minutoRegulamentar}${acrescimo}'`;
}
