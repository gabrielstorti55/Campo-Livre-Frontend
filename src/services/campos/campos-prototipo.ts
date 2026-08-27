import type { CamposApi } from '@/services/campos/campos-api';
import type {
  CampoDetalhado,
  FiltrosCampos,
  PaginaCampos,
} from '@/types/api/campos';

const campos: CampoDetalhado[] = [
  {
    id: 'campo-prototipo-1',
    nome: 'Estádio Municipal',
    descricao: 'Campo municipal cadastrado para consulta informativa.',
    endereco: 'Avenida do Estádio, 100',
    municipio: { id: 'municipio-franca', nome: 'Franca', uf: 'SP' },
    statusOperacional: 'ATIVO',
    prefeitura: {
      nomeOficial: 'Prefeitura Municipal de Franca',
      emailInstitucional: 'esportes@franca.sp.gov.br',
    },
    aviso:
      'Cadastro informativo; não representa reserva ou autorização de uso.',
  },
];

export class CamposPrototipo implements CamposApi {
  async listarCampos({
    nome,
    municipioId,
    statusOperacional = 'ATIVO',
    pagina = 1,
    tamanho = 20,
  }: FiltrosCampos = {}): Promise<PaginaCampos> {
    const termo = nome
      ?.normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase();
    const filtrados = campos.filter((campo) => {
      const nomeNormalizado = campo.nome
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase();
      return (
        (!termo || nomeNormalizado.includes(termo)) &&
        (!municipioId || campo.municipio.id === municipioId) &&
        campo.statusOperacional === statusOperacional
      );
    });
    const inicio = (pagina - 1) * tamanho;
    return {
      itens: filtrados.slice(inicio, inicio + tamanho),
      pagina,
      tamanho,
      totalItens: filtrados.length,
      totalPaginas: Math.ceil(filtrados.length / tamanho),
    };
  }

  async consultarCampo(campoId: string): Promise<CampoDetalhado> {
    const campo = campos.find((item) => item.id === campoId);
    if (!campo) throw new Error('CAMPO_NAO_ENCONTRADO');
    return campo;
  }
}
