import { atletasPublicosMock } from '@/mocks/publico/dados-publicos';
import type { AtletaPublico } from '@/types/publico';

const atletaPublicoIdPorConta: Readonly<Record<string, number>> = {
  'mock-person-1': 1,
  'mock-person-athlete-1': 3,
  'mock-person-captain-2': 5,
};

export function obterAtletaPublicoDaContaPrototipo(
  contaId: string,
): AtletaPublico | undefined {
  const atletaId = atletaPublicoIdPorConta[contaId];
  return atletaId
    ? atletasPublicosMock.find((atleta) => atleta.id === atletaId)
    : undefined;
}
