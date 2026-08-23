import type {
  EntradaCadastro,
  EntradaLogin,
  EntradaRedefinicaoSenha,
  MinhaConta,
  RespostaCadastro,
  RespostaConfirmacaoEmail,
  RespostaLogin,
  RespostaRedefinicaoSenha,
  RespostaRenovacao,
  RespostaSolicitacaoRecuperacao,
} from '@/types/api/autenticacao';

export interface AutenticacaoApi {
  login(input: EntradaLogin): Promise<RespostaLogin>;
  renovar(): Promise<RespostaRenovacao>;
  logout(): Promise<void>;
  consultarMinhaConta(accessToken: string): Promise<MinhaConta>;
  solicitarRecuperacao(email: string): Promise<RespostaSolicitacaoRecuperacao>;
  redefinirSenha(
    input: EntradaRedefinicaoSenha,
  ): Promise<RespostaRedefinicaoSenha>;
  cadastrar(input: EntradaCadastro): Promise<RespostaCadastro>;
  confirmarEmail(token: string): Promise<RespostaConfirmacaoEmail>;
}
