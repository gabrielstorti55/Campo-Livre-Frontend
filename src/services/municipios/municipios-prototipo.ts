import type { MunicipiosApi } from '@/services/municipios/municipios-api';
import type {
  FiltrosMunicipios,
  Municipio,
  PaginaMunicipios,
} from '@/types/api/municipios';

const municipios: Municipio[] = [
  {
    id: '00000000-0000-4000-8000-000000000001',
    nome: 'Franca',
    uf: 'SP',
    codigoIbge: '3516200',
  },
  {
    id: '00000000-0000-4000-8000-000000000002',
    nome: 'Batatais',
    uf: 'SP',
    codigoIbge: '3505906',
  },
];

export class MunicipiosPrototipo implements MunicipiosApi {
  async listarMunicipios({
    nome,
    uf,
    pagina = 1,
    tamanho = 20,
  }: FiltrosMunicipios = {}): Promise<PaginaMunicipios> {
    const termo = nome?.trim().toLocaleLowerCase('pt-BR') ?? '';
    const ufNormalizada = uf?.trim().toUpperCase() ?? '';
    const filtrados = municipios.filter(
      (municipio) =>
        (!termo || municipio.nome.toLocaleLowerCase('pt-BR').includes(termo)) &&
        (!ufNormalizada || municipio.uf === ufNormalizada),
    );
    const inicio = (pagina - 1) * tamanho;

    return {
      itens: filtrados.slice(inicio, inicio + tamanho),
      pagina,
      tamanho,
      totalItens: filtrados.length,
      totalPaginas: Math.ceil(filtrados.length / tamanho),
    };
  }
}
