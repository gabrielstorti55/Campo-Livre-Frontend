export function proximoIdLocalReserva(
  idsLocais: number[],
  idsCompartilhados: Array<number | undefined>,
): number {
  return (
    Math.max(
      0,
      ...idsLocais,
      ...idsCompartilhados.filter((id): id is number => id !== undefined),
    ) + 1
  );
}
