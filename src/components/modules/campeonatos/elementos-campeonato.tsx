import { CalendarDays, Clock as Relogio, MapPin } from 'lucide-react';
import type { ReactNode } from 'react';

import { Cartao } from '@/components/layout/cartao';
import { LinhaMetadados } from '@/components/layout/item-lista';

export type DadosProximoJogo = {
  casa: string;
  fora: string;
  data: string;
  hora: string;
  campo: string;
};

/** Cartão escuro de destaque do próximo jogo. */
export function CartaoProximoJogo({ jogo }: { jogo: DadosProximoJogo }) {
  return (
    <Cartao className="bg-green-dark text-white">
      <p className="font-display text-xs text-white/90">Próximo jogo</p>
      <div className="mt-2 flex items-center justify-center gap-4">
        <span className="font-display font-semibold">{jogo.casa}</span>
        <span className="text-white/90">vs</span>
        <span className="font-display font-semibold">{jogo.fora}</span>
      </div>
      <div className="mt-3 flex flex-wrap justify-center gap-4 text-xs text-white/90">
        <span className="flex items-center gap-1">
          <CalendarDays className="h-3 w-3" aria-hidden="true" /> {jogo.data}
        </span>
        <span className="flex items-center gap-1">
          <Relogio className="h-3 w-3" aria-hidden="true" /> {jogo.hora}
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="h-3 w-3" aria-hidden="true" /> {jogo.campo}
        </span>
      </div>
    </Cartao>
  );
}

/** Cartão de jogo futuro com borda lateral verde. */
export function CartaoProximaPartida({
  casa,
  fora,
  rodada,
  meta,
  right,
  separator = '×',
}: {
  casa: string;
  fora: string;
  rodada?: string;
  meta?: { icon?: typeof MapPin; label: ReactNode }[];
  right?: ReactNode;
  separator?: string;
}) {
  return (
    <Cartao className="border-l-4 border-l-green-mid">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-display font-semibold text-foreground">
            {casa} {separator} {fora}
          </p>
          {rodada ? (
            <p className="mt-1 text-xs text-muted-foreground">{rodada}</p>
          ) : null}
          {meta ? <LinhaMetadados items={meta} className="mt-2" /> : null}
        </div>
        {right}
      </div>
    </Cartao>
  );
}
