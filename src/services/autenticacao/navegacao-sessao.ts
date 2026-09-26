import type { ContextoPessoal, SessaoPessoal } from '@/types/sessao';

export function obterInicioContexto(context: ContextoPessoal) {
  return context === 'organizador'
    ? '/organizador/campeonatos'
    : '/atleta/time/buscar';
}

export function obterInicioSessao(_session: SessaoPessoal) {
  return '/minha-area';
}

export function obterDestinoPosLogin(
  _candidate: string | null | undefined,
  session: SessaoPessoal,
) {
  return obterInicioSessao(session);
}
