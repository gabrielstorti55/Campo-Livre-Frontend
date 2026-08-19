'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

import { StatusBadge } from '@/shared/components/status-badge';
import { Card, Initials, PageHeader } from '@/shared/components/campo-livre-ui';
import { Badge } from '@/shared/components/ui/badge';
import { elenco, times } from '@/mocks/data';

export function GerenciarTimes() {
  return (
    <>
      <PageHeader
        title="Gerenciar times"
        subtitle="Times inscritos no campeonato"
        actions={
          <Button variant="campoOutline" className="py-2.5">
            <Plus className="h-4 w-4" /> Adicionar time
          </Button>
        }
      />

      <div className="space-y-4">
        {times.map((t) => (
          <Card key={t.id} className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
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
              <Button variant="campoOutline" className="py-2">
                Gerenciar
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 border-t border-border pt-3">
              {elenco.slice(0, 5).map((j) => (
                <Badge key={j.id} variant="secondary" className="rounded-full">
                  {j.nome} · {j.posicao}
                </Badge>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
