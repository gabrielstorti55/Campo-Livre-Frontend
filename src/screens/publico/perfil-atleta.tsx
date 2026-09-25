'use client';

import { MapPin, Shield, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { DestaquePagina } from '@/components/layout/destaque-pagina';
import { EstadoRecurso } from '@/components/layout/estado-recurso';
import { Button } from '@/components/ui/button';
import { atletasPublicosMock } from '@/mocks/publico/dados-publicos';

export function TelaPerfilAtleta({
  prototipo = false,
}: {
  prototipo?: boolean;
}) {
  const { id } = useParams<{ id: string }>();
  const atleta = prototipo
    ? atletasPublicosMock.find((item) => item.id === Number(id))
    : undefined;

  if (!atleta) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
        <EstadoRecurso
          kind="empty"
          title="Perfil esportivo ainda indisponível"
          description={
            prototipo
              ? 'Este atleta não existe no catálogo público da demonstração.'
              : 'A projeção pública depende do contrato completo de perfis esportivos no backend integrado.'
          }
        />
        <div className="mt-4 flex justify-center">
          <Button variant="campoOutline" asChild>
            <Link href="/atletas">Voltar para atletas</Link>
          </Button>
        </div>
      </div>
    );
  }

  const vinculoAtual = atleta.historicoTimes.find((vinculo) => !vinculo.fim);

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <DestaquePagina
        eyebrow={`${atleta.posicao} · Perfil esportivo`}
        title={atleta.nome}
        description={
          atleta.bio ??
          `Atleta de ${atleta.municipio}/${atleta.uf} com histórico esportivo publicado no CampoLivre.`
        }
      />

      <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
        <aside className="space-y-5">
          <section className="border-t-4 border-accent bg-green-dark p-5 text-white">
            <p className="text-xs font-semibold tracking-[0.14em] text-accent uppercase">
              Números publicados
            </p>
            <dl className="mt-5 grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-white/70">Partidas</dt>
                <dd className="font-display text-4xl font-bold">
                  {atleta.partidasPublicadas}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-white/70">Gols</dt>
                <dd className="font-display text-4xl font-bold">
                  {atleta.golsPublicados}
                </dd>
              </div>
            </dl>
          </section>

          <section className="border border-border/70 bg-card p-5">
            <h2 className="font-display text-2xl font-bold uppercase">
              Perfil atual
            </h2>
            <div className="mt-4 space-y-3 text-sm">
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-green-mid" aria-hidden="true" />
                {atleta.municipio}/{atleta.uf}
              </p>
              <p className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-mid" aria-hidden="true" />
                {vinculoAtual
                  ? `${vinculoAtual.time} · ${vinculoAtual.funcao}`
                  : 'Sem vínculo atual publicado'}
              </p>
            </div>
          </section>
        </aside>

        <div className="space-y-6">
          <section className="border-y border-border bg-card py-5 sm:p-6">
            <h2 className="font-display text-2xl font-bold uppercase">
              Trajetória nos times
            </h2>
            <div className="mt-5 space-y-4">
              {atleta.historicoTimes.map((vinculo) => (
                <article
                  key={`${vinculo.time}-${vinculo.inicio}`}
                  className="border-l-2 border-green-mid pl-4"
                >
                  <h3 className="font-semibold">{vinculo.time}</h3>
                  <p className="text-sm text-muted-foreground">
                    {vinculo.funcao} · {vinculo.inicio}
                    {vinculo.fim ? `–${vinculo.fim}` : '–atual'}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="border-y border-border bg-card py-5 sm:p-6">
            <h2 className="font-display text-2xl font-bold uppercase">
              Campeonatos
            </h2>
            {atleta.campeonatos.length ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {atleta.campeonatos.map((participacao) => (
                  <article
                    key={`${participacao.campeonato}-${participacao.ano}`}
                    className="border border-border/70 p-4"
                  >
                    <Trophy
                      className="h-5 w-5 text-green-mid"
                      aria-hidden="true"
                    />
                    <h3 className="mt-3 font-semibold">
                      {participacao.campeonato}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {participacao.resultado} · {participacao.ano}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                Nenhuma participação adicional publicada.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
