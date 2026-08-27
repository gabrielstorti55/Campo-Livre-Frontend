import type { PapelOrganizador } from '@/types/organizador';

export function podeRegistrarWo(papel: PapelOrganizador): boolean {
  return papel === 'RESPONSAVEL';
}
