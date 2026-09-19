import type { ClienteApi } from '@/services/api/cliente-api';
import type { AutenticacaoApi } from '@/services/autenticacao/autenticacao-api';
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

type TransporteApi = Pick<ClienteApi, 'request'>;

function validarRenovacaoWeb(value: unknown): RespostaRenovacao {
  if (
    !value ||
    typeof value !== 'object' ||
    typeof (value as RespostaRenovacao).accessToken !== 'string' ||
    (value as RespostaRenovacao).tokenTipo !== 'Bearer' ||
    typeof (value as RespostaRenovacao).accessTokenExpiraEm !== 'string' ||
    (value as RespostaRenovacao).refreshToken !== null ||
    typeof (value as RespostaRenovacao).refreshTokenExpiraEm !== 'string'
  ) {
    throw new Error(
      'Resposta de autenticação web incompatível com o contrato.',
    );
  }
  return value as RespostaRenovacao;
}

function validarLoginWeb(value: unknown): RespostaLogin {
  const renewal = validarRenovacaoWeb(value);
  const usuario = (value as Partial<RespostaLogin>).usuario;
  const textoNullable = (campo: unknown) =>
    typeof campo === 'string' || campo === null;
  if (
    !usuario ||
    typeof usuario.id !== 'string' ||
    !textoNullable(usuario.nome) ||
    !textoNullable(usuario.nomeUsuario) ||
    typeof usuario.administrador !== 'boolean' ||
    typeof usuario.organizadorHabilitado !== 'boolean'
  ) {
    throw new Error('Resposta de login incompatível com o contrato.');
  }
  return { ...renewal, usuario };
}

export class AutenticacaoHttp implements AutenticacaoApi {
  constructor(private readonly client: TransporteApi) {}

  ativarOrganizador(accessToken: string): Promise<RespostaAtivacaoOrganizador> {
    return this.client.request('/minha-conta/organizador', {
      method: 'POST',
      accessToken,
      body: { confirmacao: true },
    });
  }

  desativarConta(accessToken: string): Promise<RespostaDesativacaoConta> {
    return this.client.request('/minha-conta/desativacao', {
      method: 'POST',
      accessToken,
      body: { confirmacao: true },
    });
  }

  async login(input: EntradaLogin): Promise<RespostaLogin> {
    const response = await this.client.request<unknown>('/login', {
      method: 'POST',
      credentials: 'include',
      body: { ...input, email: input.email.trim().toLowerCase() },
    });
    return validarLoginWeb(response);
  }

  async renovar(): Promise<RespostaRenovacao> {
    const response = await this.client.request<unknown>('/login/renovacoes', {
      method: 'POST',
      credentials: 'include',
      body: {},
    });
    return validarRenovacaoWeb(response);
  }

  logout(accessToken?: string): Promise<void> {
    return this.client.request('/logout', {
      method: 'POST',
      ...(accessToken ? { accessToken } : {}),
      credentials: 'include',
    });
  }

  consultarMinhaConta(accessToken: string): Promise<MinhaConta> {
    return this.client.request('/minha-conta', { accessToken });
  }

  atualizarMinhaConta(
    accessToken: string,
    input: EntradaAtualizacaoMinhaConta,
  ): Promise<MinhaConta> {
    return this.client.request('/minha-conta', {
      method: 'PATCH',
      accessToken,
      body: input,
    });
  }

  enviarFotoMinhaConta(
    accessToken: string,
    arquivo: File,
  ): Promise<RespostaFotoMinhaConta> {
    const body = new FormData();
    body.set('arquivo', arquivo);
    return this.client.request('/minha-conta/foto', {
      method: 'PUT',
      accessToken,
      body,
    });
  }

  removerFotoMinhaConta(accessToken: string): Promise<void> {
    return this.client.request('/minha-conta/foto', {
      method: 'DELETE',
      accessToken,
    });
  }

  alterarSenha(
    accessToken: string,
    input: EntradaAlteracaoSenha,
  ): Promise<RespostaAlteracaoSenha> {
    return this.client.request('/minha-conta/senha', {
      method: 'PUT',
      accessToken,
      body: input,
    });
  }

  solicitarAlteracaoEmail(
    accessToken: string,
    novoEmail: string,
  ): Promise<RespostaSolicitacaoAlteracaoEmail> {
    return this.client.request('/minha-conta/alteracao-email', {
      method: 'POST',
      accessToken,
      body: { novoEmail: novoEmail.trim().toLowerCase() },
    });
  }

  confirmarAlteracaoEmail(
    token: string,
  ): Promise<RespostaConfirmacaoAlteracaoEmail> {
    return this.client.request('/alteracoes-email/confirmacoes', {
      method: 'POST',
      body: { token },
    });
  }

  reativarConta(
    input: EntradaReativacaoConta,
  ): Promise<RespostaReativacaoConta> {
    return this.client.request('/reativacao-conta', {
      method: 'POST',
      body: { ...input, email: input.email.trim().toLowerCase() },
    });
  }

  solicitarReativacaoConta(
    email: string,
  ): Promise<RespostaSolicitacaoReativacaoConta> {
    return this.client.request('/reativacao-conta/solicitacoes', {
      method: 'POST',
      body: { email: email.trim().toLowerCase() },
    });
  }

  confirmarReativacaoConta(token: string): Promise<RespostaReativacaoConta> {
    return this.client.request('/reativacao-conta/confirmacoes', {
      method: 'POST',
      body: { token, confirmacao: true },
    });
  }

  solicitarRecuperacao(email: string): Promise<RespostaSolicitacaoRecuperacao> {
    return this.client.request('/recuperacao-senha', {
      method: 'POST',
      body: { email: email.trim().toLowerCase() },
    });
  }

  redefinirSenha(
    input: EntradaRedefinicaoSenha,
  ): Promise<RespostaRedefinicaoSenha> {
    return this.client.request('/recuperacao-senha/confirmacoes', {
      method: 'POST',
      body: input,
    });
  }

  cadastrar(input: EntradaCadastro): Promise<RespostaCadastro> {
    return this.client.request('/cadastros', { method: 'POST', body: input });
  }

  confirmarEmail(token: string): Promise<RespostaConfirmacaoEmail> {
    return this.client.request('/confirmacoes-email', {
      method: 'POST',
      credentials: 'include',
      body: { token },
    });
  }

  reenviarConfirmacaoEmail(
    email: string,
  ): Promise<RespostaReenvioConfirmacaoEmail> {
    return this.client.request('/confirmacoes-email/reenvios', {
      method: 'POST',
      body: { email: email.trim().toLowerCase() },
    });
  }
}
