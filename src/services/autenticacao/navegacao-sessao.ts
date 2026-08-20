import type { ContextoPessoal, SessaoPessoal } from '@/types/sessao';

export function obterInicioContexto(context: ContextoPessoal) {
  return context === 'organizador' ? '/organizador/inicio' : '/atleta/inicio';
}

export function obterInicioSessao(session: SessaoPessoal) {
  return session.activeContext
    ? obterInicioContexto(session.activeContext)
    : '/minha-area';
}
