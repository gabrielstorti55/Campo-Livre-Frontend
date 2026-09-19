import type { ClienteApi } from '@/services/api/cliente-api';
import type { ConsentimentosApi } from '@/services/consentimentos/consentimentos-api';
import type {
  ConsultaRevogacao,
  EntradaInicioConsentimento,
  EstadoConsentimentoParental,
  RespostaEnvioDocumento,
  RespostaInicioConsentimento,
  RespostaRevogacao,
} from '@/types/api/consentimentos';

type TransporteApi = Pick<ClienteApi, 'request'>;

export class ConsentimentosHttp implements ConsentimentosApi {
  constructor(private readonly client: TransporteApi) {}

  iniciar(
    input: EntradaInicioConsentimento,
  ): Promise<RespostaInicioConsentimento> {
    return this.client.request('/consentimentos-responsavel', {
      method: 'POST',
      credentials: 'include',
      body: {
        ...input,
        responsavel: {
          ...input.responsavel,
          email: input.responsavel.email.trim().toLowerCase(),
        },
      },
    });
  }

  consultarParental(token: string): Promise<EstadoConsentimentoParental> {
    return this.client.request(
      `/consentimentos-responsavel/parental/${encodeURIComponent(token)}`,
    );
  }

  enviarDocumento(
    token: string,
    documento: File,
  ): Promise<RespostaEnvioDocumento> {
    const body = new FormData();
    body.set('documento', documento);
    return this.client.request(
      `/consentimentos-responsavel/parental/${encodeURIComponent(token)}/documentos`,
      { method: 'POST', body },
    );
  }

  consultarRevogacao(tokenRevogacao: string): Promise<ConsultaRevogacao> {
    return this.client.request('/revogacoes-consentimento/consultas', {
      method: 'POST',
      body: { tokenRevogacao },
    });
  }

  revogar(
    tokenRevogacao: string,
    senhaRevogacao: string,
  ): Promise<RespostaRevogacao> {
    return this.client.request('/revogacoes-consentimento', {
      method: 'POST',
      body: { tokenRevogacao, senhaRevogacao, confirmacao: true },
    });
  }
}
