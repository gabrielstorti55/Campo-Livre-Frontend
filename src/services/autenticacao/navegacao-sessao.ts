import type { ContextoPessoal, SessaoPessoal } from '@/types/sessao';

export function obterInicioContexto(context: ContextoPessoal) {
  return context === 'organizador' ? '/organizador/inicio' : '/atleta/inicio';
}

export function obterInicioSessao(_session: SessaoPessoal) {
  return '/minha-area';
}

export function obterDestinoPosLogin(
  candidate: string | null | undefined,
  session: SessaoPessoal,
) {
  if (
    !candidate ||
    !candidate.startsWith('/') ||
    candidate.startsWith('//') ||
    candidate.includes('\\')
  ) {
    return obterInicioSessao(session);
  }

  return candidate;
}
