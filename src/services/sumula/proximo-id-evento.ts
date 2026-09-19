export function criarGeradorIdEvento(): () => number {
  let ultimoId = 0;

  return () => {
    ultimoId = Math.max(Date.now(), ultimoId + 1);
    return ultimoId;
  };
}
