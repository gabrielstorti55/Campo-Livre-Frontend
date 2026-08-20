import type { LinhaArtilhariaExibicao } from '@/types/publico';

export function ArtilhariaCampeonato({
  ranking,
}: {
  ranking: LinhaArtilhariaExibicao[];
}) {
  return (
    <section className="space-y-5" aria-labelledby="titulo-artilharia">
      <div>
        <h2
          id="titulo-artilharia"
          className="font-display text-2xl font-semibold"
        >
          Artilharia
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Gols válidos derivados somente de resultados definitivos deste
          campeonato.
        </p>
      </div>

      {ranking.length > 0 ? (
        <>
          <div className="overflow-x-auto rounded-3xl border border-border/70 bg-card p-4">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-3">Posição</th>
                  <th className="p-3">Atleta</th>
                  <th className="p-3">Time no campeonato</th>
                  <th className="p-3 text-center">Gols</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((linha, index) => (
                  <tr
                    key={`${linha.campeonatoId}-${linha.atletaId}`}
                    className="border-b last:border-0"
                  >
                    <td className="p-3">{index + 1}º</td>
                    <td className="p-3 font-semibold">{linha.atleta?.nome}</td>
                    <td className="p-3">{linha.time?.nome}</td>
                    <td className="p-3 text-center font-semibold">
                      {linha.gols}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-3xl border border-green-light/40 bg-green-pale p-5">
            <h3 className="font-display text-xl font-semibold">
              Destaque da artilharia
            </h3>
            <p className="mt-3 text-sm">
              <strong>{ranking[0]?.atleta?.nome}</strong> · {ranking[0]?.gols}{' '}
              gols
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              O destaque repete o líder da artilharia e não representa uma
              avaliação manual.
            </p>
          </div>
        </>
      ) : (
        <p className="rounded-3xl border border-border/70 bg-card p-5 text-sm text-muted-foreground">
          Ainda não há gols publicados neste campeonato.
        </p>
      )}
    </section>
  );
}
