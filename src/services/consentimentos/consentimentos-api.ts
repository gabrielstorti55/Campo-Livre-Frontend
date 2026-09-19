import type {
  ConsultaRevogacao,
  EntradaInicioConsentimento,
  EstadoConsentimentoParental,
  RespostaEnvioDocumento,
  RespostaInicioConsentimento,
  RespostaRevogacao,
} from '@/types/api/consentimentos';

export interface ConsentimentosApi {
  iniciar(
    input: EntradaInicioConsentimento,
  ): Promise<RespostaInicioConsentimento>;
  consultarParental(token: string): Promise<EstadoConsentimentoParental>;
  enviarDocumento(
    token: string,
    documento: File,
  ): Promise<RespostaEnvioDocumento>;
  consultarRevogacao(tokenRevogacao: string): Promise<ConsultaRevogacao>;
  revogar(
    tokenRevogacao: string,
    senhaRevogacao: string,
  ): Promise<RespostaRevogacao>;
}
