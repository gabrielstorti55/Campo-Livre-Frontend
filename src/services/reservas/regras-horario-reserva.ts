export type Relogio = {
  now(): Date;
};

export const relogioSistema: Relogio = {
  now: () => new Date(),
};

export function respeitaAntecedenciaMinima(
  inicioIsoLocal: string,
  clock: Relogio = relogioSistema,
  horas = 24,
) {
  return (
    new Date(inicioIsoLocal).getTime() - clock.now().getTime() >=
    horas * 60 * 60 * 1000
  );
}
