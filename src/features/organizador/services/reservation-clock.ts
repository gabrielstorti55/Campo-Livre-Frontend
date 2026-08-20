export type Clock = {
  now(): Date;
};

export const systemClock: Clock = {
  now: () => new Date(),
};

export function respeitaAntecedenciaMinima(
  inicioIsoLocal: string,
  clock: Clock = systemClock,
  horas = 24,
) {
  return (
    new Date(inicioIsoLocal).getTime() - clock.now().getTime() >=
    horas * 60 * 60 * 1000
  );
}
