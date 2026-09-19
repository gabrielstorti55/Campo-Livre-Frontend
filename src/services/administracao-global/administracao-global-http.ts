import type { AdministracaoGlobalApi } from '@/services/administracao-global/administracao-global-api';
import type {
  EntradaBloqueio,
  EntradaCriacaoPrefeitura,
  EntradaEdicaoPrefeitura,
  FiltrosAdministradores,
  FiltrosPrefeiturasAdministrativas,
  PaginaAdministradores,
  PaginaPrefeiturasAdministrativas,
  PaginaUsuariosInstitucionais,
  PrefeituraCriadaAdministracao,
  PrefeituraEditadaAdministracao,
  RespostaBloqueio,
  RespostaConcessaoAdministrador,
  RespostaDesbloqueio,
  RespostaRevogacaoAdministrador,
} from '@/types/api/administracao-global';

type ClienteAdministracao = {
  request<T>(path: string, options?: Record<string, unknown>): Promise<T>;
};

export class AdministracaoGlobalHttp implements AdministracaoGlobalApi {
  constructor(private readonly client: ClienteAdministracao) {}

  listarAdministradores(
    accessToken: string,
    filtros: FiltrosAdministradores = {},
  ): Promise<PaginaAdministradores> {
    const query = new URLSearchParams({
      pagina: String(filtros.pagina ?? 1),
      tamanho: String(filtros.tamanho ?? 20),
    });
    const nome = filtros.nome?.trim();
    const email = filtros.email?.trim();
    if (nome) query.set('nome', nome);
    if (email) query.set('email', email);
    return this.client.request<PaginaAdministradores>(
      `/administradores?${query.toString()}`,
      { accessToken },
    );
  }

  buscarUsuarioPorEmail(
    email: string,
    accessToken: string,
  ): Promise<PaginaUsuariosInstitucionais> {
    return this.client.request<PaginaUsuariosInstitucionais>(
      `/usuarios/busca-institucional?email=${encodeURIComponent(email.trim())}`,
      { accessToken },
    );
  }

  bloquearUsuario(
    usuarioId: string,
    entrada: EntradaBloqueio,
    accessToken: string,
  ): Promise<RespostaBloqueio> {
    return this.client.request<RespostaBloqueio>(
      `/usuarios/${encodeURIComponent(usuarioId)}/bloqueio`,
      {
        method: 'POST',
        accessToken,
        body: {
          categoria: entrada.categoria,
          motivo: entrada.motivo.trim(),
          confirmacao: true,
        },
      },
    );
  }

  desbloquearUsuario(
    usuarioId: string,
    justificativa: string,
    accessToken: string,
  ): Promise<RespostaDesbloqueio> {
    return this.client.request<RespostaDesbloqueio>(
      `/usuarios/${encodeURIComponent(usuarioId)}/desbloqueio`,
      {
        method: 'POST',
        accessToken,
        body: { justificativa: justificativa.trim(), confirmacao: true },
      },
    );
  }

  concederAdministrador(
    usuarioId: string,
    accessToken: string,
  ): Promise<RespostaConcessaoAdministrador> {
    return this.client.request<RespostaConcessaoAdministrador>(
      `/usuarios/${encodeURIComponent(usuarioId)}/administrador`,
      { method: 'POST', accessToken, body: { confirmacao: true } },
    );
  }

  revogarAdministrador(
    usuarioId: string,
    justificativa: string,
    accessToken: string,
  ): Promise<RespostaRevogacaoAdministrador> {
    return this.client.request<RespostaRevogacaoAdministrador>(
      `/usuarios/${encodeURIComponent(usuarioId)}/revogacao-administrador`,
      {
        method: 'POST',
        accessToken,
        body: { justificativa: justificativa.trim(), confirmacao: true },
      },
    );
  }

  listarPrefeituras(
    accessToken: string,
    filtros: FiltrosPrefeiturasAdministrativas = {},
  ): Promise<PaginaPrefeiturasAdministrativas> {
    const query = new URLSearchParams({
      pagina: String(filtros.pagina ?? 1),
      tamanho: String(filtros.tamanho ?? 20),
    });
    if (filtros.nome?.trim()) query.set('nome', filtros.nome.trim());
    if (filtros.municipioId) query.set('municipioId', filtros.municipioId);
    if (filtros.uf?.trim()) query.set('uf', filtros.uf.trim().toUpperCase());
    return this.client.request<PaginaPrefeiturasAdministrativas>(
      `/prefeituras?${query.toString()}`,
      { accessToken },
    );
  }

  criarPrefeitura(
    entrada: EntradaCriacaoPrefeitura,
    accessToken: string,
    idempotencyKey: string,
  ): Promise<PrefeituraCriadaAdministracao> {
    return this.client.request<PrefeituraCriadaAdministracao>('/prefeituras', {
      method: 'POST',
      accessToken,
      headers: { 'Idempotency-Key': idempotencyKey },
      body: entrada,
    });
  }

  editarPrefeitura(
    prefeituraId: string,
    entrada: EntradaEdicaoPrefeitura,
    accessToken: string,
  ): Promise<PrefeituraEditadaAdministracao> {
    return this.client.request<PrefeituraEditadaAdministracao>(
      `/prefeituras/${encodeURIComponent(prefeituraId)}`,
      { method: 'PATCH', accessToken, body: entrada },
    );
  }
}
