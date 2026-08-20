'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

import { catalogoPublicoMock } from '@/services/publico/catalogo-publico.mock';
import { Iniciais } from '@/components/layout/iniciais';
import { DestaquePagina } from '@/components/layout/destaque-pagina';
import { EstadoRecurso } from '@/components/layout/estado-recurso';

export function TelaDetalhesTime() {
  const { id } = useParams<{ id: string }>();
  const detalhe = catalogoPublicoMock.obterTime(id);
  if (!detalhe)
    return (
      <div className="mx-auto w-full max-w-[1100px] px-4 py-10">
        <EstadoRecurso
          kind="error"
          title="Time não encontrado"
          description="O link pode estar incorreto ou este time não está disponível publicamente."
        />
      </div>
    );
  const { time, elenco, campeonatos } = detalhe;
  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <DestaquePagina
        eyebrow={`${time.municipio}, ${time.uf} · fundado em ${time.fundadoEm}`}
        title={time.nome}
        description="Projeção esportiva pública do time, sem contatos ou dados pessoais de seus integrantes."
      />
      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <section
          role="region"
          aria-label="Elenco público"
          className="rounded-3xl border border-border/70 bg-card p-5 sm:p-6"
        >
          <h2 className="font-display text-xl font-semibold">Elenco público</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Somente vínculos com exposição autorizada.
          </p>
          <div className="mt-5 grid gap-3">
            {elenco.map((atleta) => (
              <Link
                key={atleta.id}
                href={`/atletas/${atleta.id}`}
                className="flex items-center gap-3 rounded-2xl border border-border/70 p-3"
              >
                <div role="img" aria-label={`Foto de ${atleta.nome}`}>
                  <Iniciais name={atleta.nome} className="h-10 w-10" />
                </div>
                <span className="text-sm">
                  <strong>{atleta.nome}</strong> ·{' '}
                  {atleta.historicoTimes.find((item) => item.time === time.nome)
                    ?.funcao ?? atleta.posicao}{' '}
                  · {atleta.golsPublicados} gols · desde{' '}
                  {atleta.historicoTimes.find((item) => item.time === time.nome)
                    ?.inicio ?? 'período não informado'}
                </span>
              </Link>
            ))}
            {elenco.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum atleta autorizou a exposição do perfil.
              </p>
            ) : null}
          </div>
        </section>
        <section className="rounded-3xl border border-border/70 bg-card p-5 sm:p-6">
          <h2 className="font-display text-xl font-semibold">
            Histórico competitivo
          </h2>
          <div className="mt-4 space-y-3">
            {campeonatos.map((campeonato) => (
              <Link
                key={campeonato.id}
                href={`/campeonatos/${campeonato.id}`}
                className="block rounded-2xl bg-muted p-4"
              >
                <strong>{campeonato.nome}</strong>
                <p className="mt-1 text-xs text-muted-foreground">
                  {campeonato.estado
                    .replaceAll('_', ' ')
                    .toLocaleLowerCase('pt-BR')}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>
      <div className="mt-6 rounded-2xl border border-green-light/30 bg-green-pale px-5 py-4 text-sm text-foreground/75">
        Dados pessoais, contatos e informações administrativas não fazem parte
        desta projeção.
      </div>
    </div>
  );
}
