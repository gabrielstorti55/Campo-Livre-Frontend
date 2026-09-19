import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    eliminacaoPrevistaEm?: string;
    prazoDias?: string;
  }>;
}) {
  const query = await searchParams;
  const data = query.eliminacaoPrevistaEm
    ? new Date(query.eliminacaoPrevistaEm)
    : null;
  const dataValida = data && !Number.isNaN(data.getTime()) ? data : null;

  return (
    <div className="mx-auto w-full max-w-[760px] px-4 py-12 sm:px-6">
      <section className="border-t-4 border-green-dark bg-card p-6 sm:p-8">
        <p className="text-xs font-semibold tracking-[0.16em] text-green-dark uppercase">
          Conta desativada
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold uppercase">
          Suas sessões foram encerradas
        </h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          A eliminação ou anonimização está prevista para{' '}
          <strong>
            {dataValida
              ? dataValida.toLocaleDateString('pt-BR')
              : `após ${query.prazoDias ?? '90'} dias`}
          </strong>
          . Durante o prazo, você pode solicitar reativação se a eliminação
          ainda não tiver começado.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild variant="campo">
            <Link href="/solicitar-reativacao">Solicitar reativação</Link>
          </Button>
          <Button asChild variant="campoOutline">
            <Link href="/">Voltar ao início</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
