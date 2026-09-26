'use client';

import Link from 'next/link';
import { type FormEvent, useCallback, useEffect, useState } from 'react';

import { CabecalhoPagina } from '@/components/layout/cabecalho-pagina';
import { Secao } from '@/components/layout/secao';
import { Button } from '@/components/ui/button';
import { useCampeonatosApi } from '@/contexts/campeonatos-api';
import { useTimesApi } from '@/contexts/times-api';
import { useSessao } from '@/hooks/use-sessao';
import { ConteudoMeusTimes } from '@/screens/atleta/meus-times';
import type { ConviteCampeonatoRecebidoPrototipo } from '@/types/api/campeonatos';
import type { PaginaConvitesTime, PaginaTimes } from '@/types/api/times';

function formatarValidade(valor: string): string {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(
    new Date(valor),
  );
}

export function ConteudoConvitesTime({
  carregar,
}: {
  carregar: (pagina: number) => Promise<PaginaConvitesTime>;
}) {
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [resultado, setResultado] = useState<{
    origem: typeof carregar;
    paginaSolicitada: number;
    pagina: PaginaConvitesTime | null;
    falhou: boolean;
  }>({
    origem: carregar,
    paginaSolicitada: paginaAtual,
    pagina: null,
    falhou: false,
  });

  useEffect(() => {
    let ativo = true;
    void carregar(paginaAtual).then(
      (resultado) => {
        if (ativo) {
          setResultado({
            origem: carregar,
            paginaSolicitada: paginaAtual,
            pagina: resultado,
            falhou: false,
          });
        }
      },
      () => {
        if (ativo) {
          setResultado({
            origem: carregar,
            paginaSolicitada: paginaAtual,
            pagina: null,
            falhou: true,
          });
        }
      },
    );
    return () => {
      ativo = false;
    };
  }, [carregar, paginaAtual]);

  const resultadoAtual =
    resultado.origem === carregar && resultado.paginaSolicitada === paginaAtual;
  const pagina = resultadoAtual ? resultado.pagina : null;
  const falhou = resultadoAtual && resultado.falhou;

  if (falhou) {
    return (
      <p
        className="border-l-2 border-danger bg-danger/5 px-4 py-3 text-sm text-danger"
        role="alert"
      >
        Não foi possível carregar seus convites. Tente novamente.
      </p>
    );
  }
  if (!pagina) return <p role="status">Carregando convites...</p>;
  if (pagina.itens.length === 0) {
    return (
      <p className="rounded-md border border-border bg-card p-5 text-sm text-muted-foreground">
        Você não possui convites pendentes.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {pagina.itens.map((convite) => (
          <article
            key={convite.id}
            className="rounded-md border border-border bg-card p-5 shadow-none"
          >
            <h2 className="font-display text-lg font-semibold">
              {convite.time.nome}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Convite enviado por {convite.remetente.nome} · válido até{' '}
              {formatarValidade(convite.expiraEm)}
            </p>
            <p className="mt-3 border-l-2 border-accent pl-3 text-sm text-muted-foreground">
              Abra o link único recebido na notificação ou no e-mail para
              responder a este convite.
            </p>
          </article>
        ))}
      </div>
      {pagina.totalPaginas > 1 ? (
        <nav
          aria-label="Paginação dos convites"
          className="flex items-center justify-between gap-4 border-t border-border pt-4"
        >
          <Button
            variant="campoOutline"
            disabled={paginaAtual <= 1}
            onClick={() => setPaginaAtual((atual) => atual - 1)}
          >
            Página anterior
          </Button>
          <p className="text-sm text-muted-foreground">
            Página {pagina.pagina} de {pagina.totalPaginas}
          </p>
          <Button
            variant="campoOutline"
            disabled={paginaAtual >= pagina.totalPaginas}
            onClick={() => setPaginaAtual((atual) => atual + 1)}
          >
            Próxima página
          </Button>
        </nav>
      ) : null}
    </div>
  );
}

function ConvitesCampeonatoPrototipo() {
  const api = useCampeonatosApi();
  const { executarAutenticado } = useSessao();
  const [convites, setConvites] = useState<
    ConviteCampeonatoRecebidoPrototipo[] | null
  >(null);
  const [erro, setErro] = useState('');
  const [feedback, setFeedback] = useState('');
  const [processando, setProcessando] = useState<string | null>(null);

  useEffect(() => {
    if (!api.listarConvitesRecebidosComoCapitao) return;
    let ativo = true;
    executarAutenticado((accessToken) =>
      api.listarConvitesRecebidosComoCapitao!(accessToken, 1, 20),
    ).then(
      (pagina) => {
        if (ativo) setConvites(pagina.itens);
      },
      () => {
        if (ativo) setErro('Não foi possível carregar os convites de campeonatos.');
      },
    );
    return () => {
      ativo = false;
    };
  }, [api, executarAutenticado]);

  async function responder(
    convite: ConviteCampeonatoRecebidoPrototipo,
    acao: 'ACEITAR' | 'RECUSAR',
  ) {
    if (!api.responderConviteCampeonato || processando) return;
    setProcessando(convite.conviteId);
    setErro('');
    setFeedback('');
    try {
      const resposta = await executarAutenticado((accessToken) =>
        api.responderConviteCampeonato!(convite.conviteId, acao, accessToken),
      );
      setConvites((atuais) =>
        atuais?.map((item) =>
          item.conviteId === convite.conviteId
            ? {
                ...item,
                status: resposta.status,
                encerradoEm: resposta.encerradoEm,
                acoesPermitidas: [],
              }
            : item,
        ) ?? [],
      );
      setFeedback(
        acao === 'ACEITAR'
          ? 'Participação confirmada no campeonato.'
          : 'Convite para campeonato recusado.',
      );
    } catch {
      setErro('Não foi possível responder ao convite de campeonato.');
    } finally {
      setProcessando(null);
    }
  }

  return (
    <Secao title="Convites para campeonatos" className="mt-10">
      {feedback ? (
        <p className="border-l-2 border-green-mid bg-green-pale px-4 py-3 text-sm text-green-dark">
          {feedback}
        </p>
      ) : null}
      {erro ? (
        <p role="alert" className="text-sm text-danger">
          {erro}
        </p>
      ) : null}
      {!convites && !erro ? <p role="status">Carregando convites...</p> : null}
      {convites?.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhum convite de campeonato recebido.
        </p>
      ) : null}
      {convites?.map((convite) => (
        <article
          key={convite.conviteId}
          className="border-l-2 border-green-mid bg-card py-3 pl-4"
        >
          <h3 className="font-display text-lg font-semibold">
            {convite.campeonato.nome}
          </h3>
          <p className="text-sm text-muted-foreground">
            {convite.time.nome} · convite para disputar o campeonato
          </p>
          {convite.status === 'PENDENTE' ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                variant="campo"
                disabled={Boolean(processando)}
                onClick={() => void responder(convite, 'ACEITAR')}
              >
                Aceitar convite
              </Button>
              <Button
                variant="campoOutline"
                disabled={Boolean(processando)}
                onClick={() => void responder(convite, 'RECUSAR')}
              >
                Recusar
              </Button>
            </div>
          ) : (
            <p className="mt-2 text-sm font-semibold text-green-dark">
              {convite.status === 'ACEITO' ? 'Participação aceita' : 'Convite recusado'}
            </p>
          )}
        </article>
      ))}
    </Secao>
  );
}

export function TelaBuscarTimes() {
  const api = useTimesApi();
  const { session, executarAutenticado } = useSessao();
  const [nome, setNome] = useState('');
  const [busca, setBusca] = useState<{
    carregando: boolean;
    resultado: PaginaTimes | null;
    falhou: boolean;
  }>({ carregando: false, resultado: null, falhou: false });
  const carregar = useCallback(
    (pagina: number) =>
      executarAutenticado((accessToken) =>
        api.listarMeusConvites(accessToken, pagina, 20),
      ),
    [api, executarAutenticado],
  );

  async function buscarTimes(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusca({ carregando: true, resultado: null, falhou: false });
    try {
      const termo = nome.trim();
      const resultado = await api.listarTimes({
        ...(termo ? { nome: termo } : {}),
        pagina: 1,
        tamanho: 20,
      });
      setBusca({ carregando: false, resultado, falhou: false });
    } catch {
      setBusca({ carregando: false, resultado: null, falhou: true });
    }
  }

  return (
    <>
      <CabecalhoPagina
        title="Times e convites"
        subtitle="Consulte seus vínculos, acompanhe convites e encontre outras equipes"
        actions={
          <Button variant="campoOutline" asChild>
            <Link href="/atleta/time/criar">Criar meu próprio time</Link>
          </Button>
        }
      />

      <ConteudoMeusTimes />

      <Secao title="Convites recebidos" className="mt-10">
        <ConteudoConvitesTime carregar={carregar} />
      </Secao>

      {session?.prototipo ? <ConvitesCampeonatoPrototipo /> : null}

      <Secao title="Encontrar times" className="mt-10">
        <form
          className="flex flex-col gap-3 sm:flex-row"
          onSubmit={buscarTimes}
        >
          <label className="flex-1 text-sm font-medium">
            Nome do time
            <input
              className="mt-1 min-h-11 w-full rounded-md border border-input bg-background px-3 text-base"
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              placeholder="Ex.: Leões FC"
            />
          </label>
          <Button className="sm:self-end" type="submit">
            Buscar times
          </Button>
        </form>

        {busca.carregando ? <p role="status">Buscando times...</p> : null}
        {busca.falhou ? (
          <p role="alert" className="text-sm text-danger">
            Não foi possível buscar os times. Tente novamente.
          </p>
        ) : null}
        {busca.resultado?.itens.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum time ativo encontrado.
          </p>
        ) : null}
        {busca.resultado?.itens.map((time) => (
          <article key={time.id} className="border-l-2 border-green-mid pl-4">
            <h2 className="font-display text-lg font-semibold">{time.nome}</h2>
            <p className="text-sm text-muted-foreground">
              {time.sigla} · {time.municipio.nome}/{time.municipio.uf}
            </p>
            <Link
              className="mt-2 inline-block text-sm font-semibold text-green-dark underline-offset-4 hover:underline"
              href={`/times/${time.id}`}
            >
              Consultar time
            </Link>
          </article>
        ))}

        <p className="text-sm text-muted-foreground">
          Para participar, peça ao capitão que localize sua conta e envie um
          convite nominal.
        </p>
      </Secao>
    </>
  );
}
