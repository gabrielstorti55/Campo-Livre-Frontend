import type { ModoAplicacao } from '@/config/modo-aplicacao';

export function IndicadorModoPrototipo({ modo }: { modo: ModoAplicacao }) {
  if (modo !== 'prototipo') return null;

  return (
    <div
      role="status"
      className="pointer-events-none fixed right-3 bottom-3 z-[100] max-w-xs border border-accent/60 bg-navy-dark px-3 py-2 text-xs leading-5 text-white shadow-lg"
    >
      <strong className="font-display tracking-wide uppercase">
        Modo de demonstração
      </strong>
      <span className="block text-white/80">
        Dados simulados e não persistidos. Sem integração com o backend.
      </span>
    </div>
  );
}
