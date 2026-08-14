import { CalendarDays, Clock, MapPin } from 'lucide-react';
import type { ReactNode } from 'react';

import { MetaRow } from '@/shared/components/list-row';
import { Card, Initials } from '@/shared/components/campo-livre-ui';
import { StatusBadge } from '@/shared/components/status-badge';
import { Badge } from '@/shared/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { classificacao, partidas, proximoJogo, times } from '@/mocks/data';
import { cn } from '@/shared/lib/utils';

/** Chip verde de placar / número em destaque. */
export function ScoreChip({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        'shrink-0 rounded-lg bg-green-pale font-display text-sm font-bold text-green-dark hover:bg-green-pale',
        className,
      )}
    >
      {children}
    </Badge>
  );
}

/** Card escuro de destaque do próximo jogo. */
export function ProximoJogoCard() {
  return (
    <Card className="bg-green-dark text-white">
      <p className="font-display text-xs text-white/70">Próximo jogo</p>
      <div className="mt-2 flex items-center justify-center gap-4">
        <span className="font-display font-semibold">{proximoJogo.casa}</span>
        <span className="text-white/60">vs</span>
        <span className="font-display font-semibold">{proximoJogo.fora}</span>
      </div>
      <div className="mt-3 flex flex-wrap justify-center gap-4 text-xs text-white/70">
        <span className="flex items-center gap-1">
          <CalendarDays className="h-3 w-3" /> {proximoJogo.data}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" /> {proximoJogo.hora}
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="h-3 w-3" /> {proximoJogo.campo}
        </span>
      </div>
    </Card>
  );
}

/** Card de jogo futuro com borda lateral verde. */
export function ProximaPartidaCard({
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
    <Card className="border-l-4 border-l-green-mid">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-display font-semibold text-foreground">
            {casa} {separator} {fora}
          </p>
          {rodada ? (
            <p className="mt-1 text-xs text-muted-foreground">{rodada}</p>
          ) : null}
          {meta ? <MetaRow items={meta} className="mt-2" /> : null}
        </div>
        {right}
      </div>
    </Card>
  );
}

/** Linha compacta de resultado: "A vs B" + placar. */
export function ResultadoRow({
  casa,
  fora,
  placar,
  subtitle,
}: {
  casa: string;
  fora: string;
  placar: ReactNode;
  subtitle?: ReactNode;
}) {
  return (
    <Card className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <span className="block truncate font-display text-sm font-semibold">
          {casa} vs {fora}
        </span>
        {subtitle ? (
          <span className="block text-xs text-muted-foreground">
            {subtitle}
          </span>
        ) : null}
      </div>
      <ScoreChip>{placar}</ScoreChip>
    </Card>
  );
}

export function TabelaClassificacao({ destaque }: { destaque?: string }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-white">
      <Table className="min-w-[640px]">
        <TableHeader>
          <TableRow className="bg-surface hover:bg-surface">
            <TableHead>#</TableHead>
            <TableHead>Time</TableHead>
            {['P', 'J', 'V', 'E', 'D', 'GP', 'GC', 'SG'].map((h) => (
              <TableHead key={h} className="text-center">
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {classificacao.map((l, i) => (
            <TableRow
              key={l.time}
              className={cn(
                destaque === l.time &&
                  'bg-green-pale font-semibold text-green-dark',
              )}
            >
              <TableCell>{i + 1}</TableCell>
              <TableCell>{l.time}</TableCell>
              {[l.p, l.j, l.v, l.e, l.d, l.gp, l.gc, l.sg].map((v, idx) => (
                <TableCell key={idx} className="text-center">
                  {v}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function ListaJogos() {
  const rodadas = [...new Set(partidas.map((p) => p.rodada))];
  return (
    <div className="space-y-5">
      {rodadas.map((r) => (
        <div key={r}>
          <h3 className="mb-2 font-display text-sm font-semibold text-muted-foreground">
            {r}
          </h3>
          <div className="space-y-2">
            {partidas
              .filter((p) => p.rodada === r)
              .map((p) => (
                <Card key={p.id} className="flex flex-wrap items-center gap-3">
                  <div className="min-w-0 flex-1 font-display text-sm font-semibold text-foreground">
                    {p.casa} <span className="text-muted-foreground">vs</span>{' '}
                    {p.fora}
                  </div>
                  {p.concluida ? (
                    <ScoreChip>
                      {p.golsCasa} x {p.golsFora}
                    </ScoreChip>
                  ) : null}
                  <p className="text-xs text-muted-foreground">
                    {p.data} · {p.hora} · {p.campo}
                  </p>
                </Card>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ListaTimes() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {times.map((t) => (
        <Card key={t.id} className="flex items-center gap-3">
          <Initials name={t.nome} className="h-11 w-11" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-display font-semibold text-foreground">
              {t.nome}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {t.cidade} · {t.jogadores} jogadores
            </p>
          </div>
          <StatusBadge status={t.status} />
        </Card>
      ))}
    </div>
  );
}
