import Link from 'next/link';

import { Card } from '@/components/ui/card';
import type { ModoAplicacao } from '@/config/modo-aplicacao';
import { TelaSumula } from '@/screens/organizador/sumula';

export function EntradaSumulaSemPartida({
  modo,
  campeonatoId,
}: {
  modo: ModoAplicacao;
  campeonatoId: string;
}) {
  if (modo !== 'integrado') {
    return <TelaSumula campeonatoId={campeonatoId} />;
  }

  return (
    <Card className="p-6">
      <h1 className="font-display text-2xl font-semibold">
        Selecione uma partida
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Abra a área de Partidas e escolha uma partida autorizada para preencher
        a Súmula.
      </p>
      <Link
        className="mt-5 inline-flex font-semibold text-green-dark underline-offset-4 hover:underline"
        href={`/organizador/campeonato/${campeonatoId}/partidas`}
      >
        Ir para Partidas
      </Link>
    </Card>
  );
}
