import type { ModoAplicacao } from '@/config/modo-aplicacao';

export function IndicadorModoPrototipo({ modo }: { modo: ModoAplicacao }) {
  if (modo === 'integrado') return null;

  const hibrido = modo === 'hibrido';

  return (
    <div
      role="status"
      className="pointer-events-none fixed right-3 bottom-3 z-[100] max-w-xs border border-accent/60 bg-navy-dark px-3 py-2 text-xs leading-5 text-white shadow-lg"
    >
      <strong className="font-display tracking-wide uppercase">
        {hibrido ? 'Experiência de revisão' : 'Modo de demonstração'}
      </strong>
      <span className="block text-white/80">
        {hibrido
          ? 'Dados demonstrativos permitem revisar todas as telas sem depender da API. Use dev:integrated para validar o backend.'
          : 'Dados simulados e não persistidos. Sem integração com o backend.'}
      </span>
    </div>
  );
}
