'use client';

import { useCampeonatosAdministrados } from '@/hooks/use-campeonatos-administrados';
import { useSessao } from '@/hooks/use-sessao';
import type { EstadoCampeonato } from '@/types/api/campeonatos';
import { CabecalhoPagina } from '@/components/layout/cabecalho-pagina';
import { Card } from '@/components/ui/card';

const estadoLabel: Record<EstadoCampeonato, string> = {
  EM_INSCRICOES: 'Em inscrições',
  AGUARDANDO_SORTEIO: 'Aguardando sorteio',
  EM_ANDAMENTO: 'Em andamento',
  ENCERRADO: 'Encerrado',
  CANCELADO: 'Cancelado',
};

export function TelaPerfilOrganizador() {
  const { session } = useSessao();
  const { campeonatos, carregando, erro } = useCampeonatosAdministrados();

  return (
    <>
      <CabecalhoPagina
        title="Histórico do organizador"
        subtitle={session?.account.name ?? 'Conta pessoal'}
      />
      <section aria-label="Participações como organizador">
        <h2 className="font-display text-xl font-semibold">
          Participações como organizador
        </h2>
        {carregando ? (
          <p role="status" className="mt-4">
            Carregando participações...
          </p>
        ) : null}
        {erro ? (
          <Card role="alert" className="mt-4 p-5 text-sm">
            {erro}
          </Card>
        ) : null}
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {campeonatos.map((campeonato) => (
            <Card key={campeonato.campeonatoId} className="p-5">
              <h3 className="font-display text-lg font-semibold">
                {campeonato.nome}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {campeonato.prefeitura?.nome ?? 'Contexto pessoal'}
              </p>
              <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold">
                <span>
                  {campeonato.vinculo.funcao === 'RESPONSAVEL'
                    ? 'Responsável'
                    : 'Organizador'}
                </span>
                <span>{estadoLabel[campeonato.status]}</span>
              </div>
            </Card>
          ))}
        </div>
        {!carregando && !erro && campeonatos.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Nenhuma participação ativa.
          </p>
        ) : null}
      </section>
      <Card className="mt-8 p-5">
        <h2 className="font-display text-xl font-semibold">
          Histórico comercial
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A API administrativa ainda não publica uma projeção recuperável de
          pagamentos. Cada Campeonato pessoal adicional exige pagamento próprio,
          vinculado à competição; nenhum registro local é apresentado como
          histórico real.
        </p>
      </Card>
    </>
  );
}
