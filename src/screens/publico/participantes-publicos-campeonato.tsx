'use client';

import { useEffect, useState } from 'react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCampeonatosApi } from '@/contexts/campeonatos-api';
import type { PaginaTimesParticipantes } from '@/types/api/campeonatos';

type Participante = PaginaTimesParticipantes['itens'][number];

export function TelaParticipantesPublicosCampeonato({
  campeonatoId,
}: {
  campeonatoId: string;
}) {
  const campeonatosApi = useCampeonatosApi();
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ativo = true;
    campeonatosApi
      .listarTimesParticipantes(campeonatoId, undefined, 1, 20)
      .then((resultado) => {
        if (!ativo) return;
        setParticipantes(resultado.itens);
        setPagina(resultado.pagina);
        setTotalPaginas(resultado.totalPaginas);
      })
      .catch(() => {
        if (ativo) setErro('Não foi possível carregar os participantes.');
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [campeonatoId, campeonatosApi]);

  async function carregarMais() {
    const proximaPagina = pagina + 1;
    setCarregando(true);
    setErro('');
    try {
      const resultado = await campeonatosApi.listarTimesParticipantes(
        campeonatoId,
        undefined,
        proximaPagina,
        20,
      );
      setParticipantes((atual) => [...atual, ...resultado.itens]);
      setPagina(resultado.pagina);
      setTotalPaginas(resultado.totalPaginas);
    } catch {
      setErro('Não foi possível carregar a próxima página de participantes.');
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
        Participantes do campeonato
      </h1>

      <div className="mt-8 space-y-3">
        {carregando && participantes.length === 0 ? (
          <p role="status" className="text-sm text-muted-foreground">
            Carregando participantes...
          </p>
        ) : erro && participantes.length === 0 ? (
          <p role="alert" className="text-sm text-destructive">
            {erro}
          </p>
        ) : participantes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum time inscrito.</p>
        ) : (
          participantes.map((time) => (
            <Card key={time.timeId} className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl font-semibold">
                    {time.nome}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {time.sigla} · {time.ordemInscricao}º inscrito
                  </p>
                </div>
                <span className="text-xs font-semibold text-green-dark uppercase">
                  {time.statusParticipacao === 'ATIVO'
                    ? 'Participação ativa'
                    : 'Participação encerrada'}
                </span>
              </div>
            </Card>
          ))
        )}
      </div>

      {erro && participantes.length > 0 ? (
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
          {carregando ? 'Carregando...' : 'Carregar mais participantes'}
        </Button>
      ) : null}
    </div>
  );
}
