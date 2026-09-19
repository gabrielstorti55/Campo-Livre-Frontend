'use client';

import { useEffect, useState } from 'react';

import { ArtilhariaCampeonato } from '@/components/modules/campeonatos/artilharia-campeonato';
import { Button } from '@/components/ui/button';
import { usePartidasApi } from '@/contexts/partidas-api';
import type { ItemArtilharia } from '@/types/api/partidas';

export function TelaArtilhariaPublicaCampeonato({
  campeonatoId,
}: {
  campeonatoId: string;
}) {
  const partidasApi = usePartidasApi();
  const [ranking, setRanking] = useState<ItemArtilharia[]>([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ativo = true;
    partidasApi
      .consultarArtilharia(campeonatoId, 1, 20)
      .then((resultado) => {
        if (!ativo) return;
        setRanking(resultado.itens);
        setPagina(resultado.pagina);
        setTotalPaginas(resultado.totalPaginas);
      })
      .catch(() => {
        if (ativo) setErro('Não foi possível carregar a artilharia.');
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [campeonatoId, partidasApi]);

  async function carregarMais() {
    const proximaPagina = pagina + 1;
    setCarregando(true);
    setErro('');
    try {
      const resultado = await partidasApi.consultarArtilharia(
        campeonatoId,
        proximaPagina,
        20,
      );
      setRanking((atual) => [...atual, ...resultado.itens]);
      setPagina(resultado.pagina);
      setTotalPaginas(resultado.totalPaginas);
    } catch {
      setErro('Não foi possível carregar a próxima página da artilharia.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-8 sm:px-6 lg:px-8">
      <p className="text-xs font-semibold tracking-[0.18em] text-green-dark uppercase">
        Projeção pública
      </p>
      <h1 className="mt-2 font-display text-4xl font-extrabold uppercase">
        Artilharia do campeonato
      </h1>

      <div className="mt-8">
        {carregando && ranking.length === 0 ? (
          <p role="status" className="text-sm text-muted-foreground">
            Carregando artilharia...
          </p>
        ) : erro && ranking.length === 0 ? (
          <p role="alert" className="text-sm text-destructive">
            {erro}
          </p>
        ) : (
          <ArtilhariaCampeonato ranking={ranking} />
        )}
      </div>

      {erro && ranking.length > 0 ? (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {erro}
        </p>
      ) : null}
      {pagina < totalPaginas ? (
        <Button
          className="mt-6"
          variant="campoOutline"
          disabled={carregando}
          onClick={carregarMais}
        >
          {carregando ? 'Carregando...' : 'Carregar mais artilheiros'}
        </Button>
      ) : null}
    </div>
  );
}
