'use client';

import { useParams } from 'next/navigation';

import { publicCatalogMock } from '@/features/publico/services/public-catalog.mock';
import { Initials } from '@/shared/components/campo-livre-ui';
import { PageHero } from '@/shared/components/page-hero';
import { ResourceState } from '@/shared/components/resource-state';

export function AtletaPublicoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const atleta = publicCatalogMock.obterAtleta(id);
  if (!atleta)
    return (
      <div className="mx-auto max-w-[1100px] px-4 py-10">
        <ResourceState
          kind="error"
          title="Atleta não encontrado"
          description="Não existe uma referência esportiva pública para este endereço."
        />
      </div>
    );
  if (!atleta.perfilPublico)
    return (
      <div className="mx-auto max-w-[1100px] px-4 py-10">
        <ResourceState
          kind="empty"
          title="Perfil esportivo privado"
          description="A pessoa não autorizou a exposição do perfil. Nenhum dado opcional ou esportivo é revelado."
        />
      </div>
    );
  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="mb-6 flex items-center gap-4">
        <Initials name={atleta.nome} className="h-16 w-16 text-lg" />
        <PageHero
          eyebrow={`${atleta.posicao} · ${atleta.municipio}, ${atleta.uf}`}
          title={atleta.nome}
          description={atleta.bio ?? 'Perfil esportivo público'}
        />
      </div>
      <section
        aria-label="Estatísticas publicadas"
        className="grid gap-3 sm:grid-cols-3"
      >
        {[
          [`${atleta.golsPublicados} gols`, 'Gols publicados'],
          [String(atleta.partidasPublicadas), 'Partidas publicadas'],
          [String(atleta.assistenciasPublicadas), 'Assistências publicadas'],
        ].map(([value, label]) => (
          <div
            key={label}
            className="rounded-2xl border border-border/70 bg-card p-5"
          >
            <strong className="font-display text-2xl text-green-dark">
              {value}
            </strong>
            <p className="mt-1 text-sm text-muted-foreground">{label}</p>
          </div>
        ))}
      </section>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="rounded-3xl border border-border/70 bg-card p-5">
          <h2 className="font-display text-xl font-semibold">
            Histórico de times
          </h2>
          <div className="mt-4 space-y-3">
            {atleta.historicoTimes.map((item) => (
              <article key={`${item.time}-${item.inicio}`}>
                <strong>{item.time}</strong>
                <p className="text-sm text-muted-foreground">
                  {item.funcao} · {item.inicio}
                  {item.fim ? `–${item.fim}` : '–atual'}
                </p>
              </article>
            ))}
            {atleta.historicoTimes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Sem vínculos publicados.
              </p>
            ) : null}
          </div>
        </section>
        <section className="rounded-3xl border border-border/70 bg-card p-5">
          <h2 className="font-display text-xl font-semibold">Campeonatos</h2>
          <div className="mt-4 space-y-3">
            {atleta.campeonatos.map((item) => (
              <article key={`${item.campeonato}-${item.ano}`}>
                <strong>{item.campeonato}</strong>
                <p className="text-sm text-muted-foreground">
                  {item.resultado} · {item.ano}
                </p>
              </article>
            ))}
            {atleta.campeonatos.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Sem participações publicadas.
              </p>
            ) : null}
          </div>
        </section>
        <section className="rounded-3xl border border-border/70 bg-card p-5">
          <h2 className="font-display text-xl font-semibold">Conquistas</h2>
          <div className="mt-4 space-y-3">
            {atleta.conquistas.map((item) => (
              <article key={`${item.titulo}-${item.ano}`}>
                <strong>{item.titulo}</strong>
                <p className="text-sm text-muted-foreground">
                  {item.descricao} · {item.ano}
                </p>
              </article>
            ))}
            {atleta.conquistas.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma conquista publicada.
              </p>
            ) : null}
          </div>
        </section>
      </div>
      <p className="mt-6 rounded-2xl bg-green-pale px-5 py-4 text-sm">
        Somente fatos esportivos publicados compõem este perfil. Dados pessoais,
        contatos e auditoria permanecem privados.
      </p>
    </div>
  );
}
