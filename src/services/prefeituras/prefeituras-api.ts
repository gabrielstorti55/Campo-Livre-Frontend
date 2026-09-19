import type { PaginaPrefeiturasDaConta } from '@/types/api/prefeituras';

export interface PrefeiturasApi {
  listarMinhasPrefeituras(
    accessToken: string,
    pagina?: number,
    tamanho?: number,
  ): Promise<PaginaPrefeiturasDaConta>;
}
