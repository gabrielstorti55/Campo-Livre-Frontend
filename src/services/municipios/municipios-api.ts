import type {
  FiltrosMunicipios,
  PaginaMunicipios,
} from '@/types/api/municipios';

export interface MunicipiosApi {
  listarMunicipios(filtros?: FiltrosMunicipios): Promise<PaginaMunicipios>;
}
