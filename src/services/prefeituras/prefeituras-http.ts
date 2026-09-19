import type { PrefeiturasApi } from '@/services/prefeituras/prefeituras-api';
import type { GestaoPrefeiturasApi } from '@/services/prefeituras/gestao-prefeituras-api';
import type {
  AceiteConvitePrefeitura,
  ConvitePrefeituraCriado,
  ConvitePrefeituraPorToken,
  PaginaConvitesPrefeituraEnviados,
  PaginaConvitesPrefeituraRecebidos,
  PaginaFuncionariosPrefeitura,
  PaginaPrefeiturasDaConta,
  PaginaUsuariosInstitucionais,
  ReenvioConvitePrefeitura,
  RemocaoFuncionarioPrefeitura,
  StatusFuncionarioPrefeitura,
  TransferenciaResponsabilidadePrefeitura,
} from '@/types/api/prefeituras';

type ClientePrefeituras = {
  request<T>(path: string, options?: Record<string, unknown>): Promise<T>;
};

export class PrefeiturasHttp implements PrefeiturasApi, GestaoPrefeiturasApi {
  constructor(private readonly client: ClientePrefeituras) {}

  listarMinhasPrefeituras(
    accessToken: string,
    pagina = 1,
    tamanho = 20,
  ): Promise<PaginaPrefeiturasDaConta> {
    return this.client.request<PaginaPrefeiturasDaConta>(
      `/minha-conta/prefeituras?pagina=${pagina}&tamanho=${tamanho}`,
      { accessToken },
    );
  }

  listarFuncionarios(
    prefeituraId: string,
    accessToken: string,
    status: StatusFuncionarioPrefeitura = 'ATIVO',
    pagina = 1,
    tamanho = 20,
  ): Promise<PaginaFuncionariosPrefeitura> {
    const query = new URLSearchParams({
      status,
      pagina: String(pagina),
      tamanho: String(tamanho),
    });
    return this.client.request<PaginaFuncionariosPrefeitura>(
      `/prefeituras/${encodeURIComponent(prefeituraId)}/funcionarios?${query.toString()}`,
      { accessToken },
    );
  }

  listarConvitesEnviados(
    prefeituraId: string,
    accessToken: string,
    pagina = 1,
    tamanho = 20,
  ): Promise<PaginaConvitesPrefeituraEnviados> {
    return this.client.request<PaginaConvitesPrefeituraEnviados>(
      `/prefeituras/${encodeURIComponent(prefeituraId)}/convites?pagina=${pagina}&tamanho=${tamanho}`,
      { accessToken },
    );
  }

  buscarUsuarioInstitucional(
    email: string,
    accessToken: string,
  ): Promise<PaginaUsuariosInstitucionais> {
    return this.client.request<PaginaUsuariosInstitucionais>(
      `/usuarios/busca-institucional?email=${encodeURIComponent(email)}`,
      { accessToken },
    );
  }

  convidarFuncionario(
    prefeituraId: string,
    usuarioId: string,
    accessToken: string,
    idempotencyKey: string,
  ): Promise<ConvitePrefeituraCriado> {
    return this.client.request<ConvitePrefeituraCriado>(
      `/prefeituras/${encodeURIComponent(prefeituraId)}/convites`,
      {
        method: 'POST',
        accessToken,
        headers: { 'Idempotency-Key': idempotencyKey },
        body: { usuarioId },
      },
    );
  }

  reenviarConvite(
    prefeituraId: string,
    conviteId: string,
    accessToken: string,
    idempotencyKey: string,
  ): Promise<ReenvioConvitePrefeitura> {
    return this.client.request<ReenvioConvitePrefeitura>(
      `/prefeituras/${encodeURIComponent(prefeituraId)}/convites/${encodeURIComponent(conviteId)}/reenvio`,
      {
        method: 'POST',
        accessToken,
        headers: { 'Idempotency-Key': idempotencyKey },
      },
    );
  }

  removerFuncionario(
    prefeituraId: string,
    membroId: string,
    accessToken: string,
    motivo: string,
  ): Promise<RemocaoFuncionarioPrefeitura> {
    return this.client.request<RemocaoFuncionarioPrefeitura>(
      `/prefeituras/${encodeURIComponent(prefeituraId)}/funcionarios/${encodeURIComponent(membroId)}/remocao`,
      {
        method: 'POST',
        accessToken,
        body: { motivo: motivo.trim(), confirmacao: true },
      },
    );
  }

  transferirResponsabilidade(
    prefeituraId: string,
    sucessorMembroId: string,
    accessToken: string,
  ): Promise<TransferenciaResponsabilidadePrefeitura> {
    return this.client.request<TransferenciaResponsabilidadePrefeitura>(
      `/prefeituras/${encodeURIComponent(prefeituraId)}/transferencia-responsabilidade`,
      {
        method: 'POST',
        accessToken,
        body: { sucessorMembroId, confirmacao: true },
      },
    );
  }

  listarConvitesRecebidos(
    accessToken: string,
    pagina = 1,
    tamanho = 20,
  ): Promise<PaginaConvitesPrefeituraRecebidos> {
    return this.client.request<PaginaConvitesPrefeituraRecebidos>(
      `/minha-conta/convites-prefeitura?pagina=${pagina}&tamanho=${tamanho}`,
      { accessToken },
    );
  }

  aceitarConviteRecebido(
    conviteId: string,
    accessToken: string,
  ): Promise<AceiteConvitePrefeitura> {
    return this.client.request<AceiteConvitePrefeitura>(
      `/minha-conta/convites-prefeitura/${encodeURIComponent(conviteId)}/aceite`,
      { method: 'POST', accessToken, body: { confirmacao: true } },
    );
  }

  recusarConviteRecebido(
    conviteId: string,
    accessToken: string,
  ): Promise<void> {
    return this.client.request(
      `/minha-conta/convites-prefeitura/${encodeURIComponent(conviteId)}/recusa`,
      { method: 'POST', accessToken },
    );
  }

  consultarConvitePorToken(token: string): Promise<ConvitePrefeituraPorToken> {
    return this.client.request<ConvitePrefeituraPorToken>(
      `/convites-prefeitura/${encodeURIComponent(token)}`,
    );
  }

  aceitarConvitePorToken(
    token: string,
    accessToken: string,
  ): Promise<AceiteConvitePrefeitura> {
    return this.client.request<AceiteConvitePrefeitura>(
      `/convites-prefeitura/${encodeURIComponent(token)}/aceite`,
      { method: 'POST', accessToken, body: { confirmacao: true } },
    );
  }

  recusarConvitePorToken(token: string, accessToken: string): Promise<void> {
    return this.client.request(
      `/convites-prefeitura/${encodeURIComponent(token)}/recusa`,
      { method: 'POST', accessToken },
    );
  }
}
