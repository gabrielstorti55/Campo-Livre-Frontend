'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { useCampeonatosApi } from '@/contexts/campeonatos-api';
import { useSessao } from '@/hooks/use-sessao';
import type { CampeonatoAdministrado } from '@/types/api/campeonatos';
import { CabecalhoPagina } from '@/components/layout/cabecalho-pagina';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const rotuloEstado: Record<CampeonatoAdministrado['status'], string> = {
  EM_INSCRICOES: 'Em inscrições',
  AGUARDANDO_SORTEIO: 'Aguardando sorteio',
  EM_ANDAMENTO: 'Em andamento',
  ENCERRADO: 'Encerrado',
  CANCELADO: 'Cancelado',
};

export function TelaCampeonatosOrganizador() {
  const { hydrated, executarAutenticado } = useSessao();
  const campeonatosApi = useCampeonatosApi();
  const [campeonatos, setCampeonatos] = useState<CampeonatoAdministrado[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!hydrated) return;
    let ativo = true;
    executarAutenticado((accessToken) =>
      campeonatosApi.listarCampeonatosAdministrados(accessToken, 1, 20),
    )
      .then((pagina) => {
        if (ativo) setCampeonatos(pagina.itens);
      })
      .catch(() => {
        if (ativo)
          setErro('Não foi possível carregar os Campeonatos administrados.');
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [campeonatosApi, executarAutenticado, hydrated]);

  return (
    <>
      <CabecalhoPagina
        title="Campeonatos administrados"
        subtitle="Somente vínculos ativos da conta"
        actions={
          <Button asChild variant="campo">
            <Link href="/organizador/novo">Novo campeonato</Link>
          </Button>
        }
      />
      {carregando ? <p role="status">Carregando Campeonatos...</p> : null}
      {erro ? (
        <Card role="alert" className="border-destructive p-5 text-sm">
          {erro}
        </Card>
      ) : null}
      {!carregando && !erro && campeonatos.length === 0 ? (
        <Card className="p-5">
          <h2 className="font-display text-lg font-semibold">
            Nenhum vínculo ativo
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Crie um Campeonato ou aguarde sua inclusão na equipe organizadora.
          </p>
        </Card>
      ) : null}
      <div className="space-y-4">
        {campeonatos.map((campeonato) => (
          <Card key={campeonato.campeonatoId} className="p-5">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-display text-lg font-semibold">
                  {campeonato.nome}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {campeonato.vinculo.funcao === 'RESPONSAVEL'
                    ? 'Responsável'
                    : 'Organizador'}{' '}
                  · {campeonato.prefeitura?.nome ?? 'Contexto pessoal'} ·{' '}
                  {rotuloEstado[campeonato.status]}
                </p>
              </div>
              <Button asChild variant="campoOutline">
                <Link
                  href={`/organizador/campeonato/${campeonato.campeonatoId}`}
                >
                  Administrar
                </Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
