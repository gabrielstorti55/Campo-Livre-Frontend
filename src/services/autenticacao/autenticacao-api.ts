import type {
  EntradaAlteracaoSenha,
  EntradaAtualizacaoMinhaConta,
  EntradaCadastro,
  EntradaLogin,
  EntradaRedefinicaoSenha,
  EntradaReativacaoConta,
  MinhaConta,
  RespostaAlteracaoSenha,
  RespostaAtivacaoOrganizador,
  RespostaCadastro,
  RespostaDesativacaoConta,
  RespostaFotoMinhaConta,
  RespostaConfirmacaoAlteracaoEmail,
  RespostaConfirmacaoEmail,
  RespostaLogin,
  RespostaRedefinicaoSenha,
  RespostaReenvioConfirmacaoEmail,
  RespostaRenovacao,
  RespostaReativacaoConta,
  RespostaSolicitacaoRecuperacao,
  RespostaSolicitacaoAlteracaoEmail,
  RespostaSolicitacaoReativacaoConta,
} from '@/types/api/autenticacao';

export interface AutenticacaoApi {
  ativarOrganizador(accessToken: string): Promise<RespostaAtivacaoOrganizador>;
  desativarConta(accessToken: string): Promise<RespostaDesativacaoConta>;
  login(input: EntradaLogin): Promise<RespostaLogin>;
  renovar(): Promise<RespostaRenovacao>;
  logout(accessToken?: string): Promise<void>;
  consultarMinhaConta(accessToken: string): Promise<MinhaConta>;
  atualizarMinhaConta(
    accessToken: string,
    input: EntradaAtualizacaoMinhaConta,
  ): Promise<MinhaConta>;
  enviarFotoMinhaConta(
    accessToken: string,
    arquivo: File,
  ): Promise<RespostaFotoMinhaConta>;
  removerFotoMinhaConta(accessToken: string): Promise<void>;
  alterarSenha(
    accessToken: string,
    input: EntradaAlteracaoSenha,
  ): Promise<RespostaAlteracaoSenha>;
  solicitarAlteracaoEmail(
    accessToken: string,
    novoEmail: string,
  ): Promise<RespostaSolicitacaoAlteracaoEmail>;
  confirmarAlteracaoEmail(
    token: string,
  ): Promise<RespostaConfirmacaoAlteracaoEmail>;
  reativarConta(
    input: EntradaReativacaoConta,
  ): Promise<RespostaReativacaoConta>;
  solicitarReativacaoConta(
    email: string,
  ): Promise<RespostaSolicitacaoReativacaoConta>;
  confirmarReativacaoConta(token: string): Promise<RespostaReativacaoConta>;
  solicitarRecuperacao(email: string): Promise<RespostaSolicitacaoRecuperacao>;
  redefinirSenha(
    input: EntradaRedefinicaoSenha,
  ): Promise<RespostaRedefinicaoSenha>;
  cadastrar(input: EntradaCadastro): Promise<RespostaCadastro>;
  confirmarEmail(token: string): Promise<RespostaConfirmacaoEmail>;
  reenviarConfirmacaoEmail(
    email: string,
  ): Promise<RespostaReenvioConfirmacaoEmail>;
}
