'use client';

import { ArrowUpRight, MapPin, Trophy, Users } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import type {
  CampeonatoEstadoPublico,
  CampeonatoFormato,
} from '@/types/publico';
import { catalogoPublicoMock } from '@/services/publico/catalogo-publico.mock';
import { BarraBusca } from '@/components/layout/barra-busca';
import { DestaquePagina } from '@/components/layout/destaque-pagina';
import { EstadoRecurso } from '@/components/layout/estado-recurso';
import { cn } from '@/utils/classes';

const cardFocus =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';
const selectClass =
  'h-11 rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

const estadoLabel: Record<CampeonatoEstadoPublico, string> = {
  EM_CONFIGURACAO: 'Em configuração',
  EM_ANDAMENTO: 'Em andamento',
  ENCERRADO: 'Encerrado',
  CANCELADO: 'Cancelado',
};

const formatoLabel: Record<CampeonatoFormato, string> = {
  PONTOS_CORRIDOS: 'Pontos corridos',
  MATA_MATA: 'Mata-mata',
  GRUPOS_MATA_MATA: 'Grupos + mata-mata',
};

export function TelaCampeonatos() {
  const [busca, setBusca] = useState('');
  const [estado, setEstado] = useState<CampeonatoEstadoPublico | 'TODOS'>(
    'TODOS',
  );
  const [municipio, setMunicipio] = useState('');
  const [uf, setUf] = useState('');
  const [formato, setFormato] = useState<CampeonatoFormato | 'TODOS'>('TODOS');
  const [periodo, setPeriodo] = useState<
    'TODOS' | 'PROXIMOS' | '2026' | '2025'
  >('TODOS');
  const [ordenacao, setOrdenacao] = useState<
    'INICIO_ASC' | 'RECENTES' | 'NOME'
  >('INICIO_ASC');

  const lista = catalogoPublicoMock.listarCampeonatos({
    busca,
    estado,
    ...(municipio ? { municipio } : {}),
    ...(uf ? { uf } : {}),
    formato,
    periodo,
    ordenacao,
  });

  return (
    <div className="mx-auto w-full max-w-[1380px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <DestaquePagina
        eyebrow="Competições públicas"
        title="Campeonatos"
        description="Acompanhe competições publicadas, seus participantes, estrutura, classificação e resultados."
      />

      <section
        aria-label="Filtros de campeonatos"
        className="mb-7 rounded-2xl border border-border/70 bg-card p-4 shadow-sm sm:p-5"
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="md:col-span-2">
            <BarraBusca
              placeholder="Buscar campeonatos..."
              value={busca}
              onChange={setBusca}
            />
          </div>
          <label className="grid gap-1 text-xs font-semibold">
            Estado do campeonato
            <select
              className={selectClass}
              value={estado}
              onChange={(event) =>
                setEstado(
                  event.target.value as CampeonatoEstadoPublico | 'TODOS',
                )
              }
            >
              <option value="TODOS">Todos</option>
              {Object.entries(estadoLabel).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-xs font-semibold">
            Município
            <select
              className={selectClass}
              value={municipio}
              onChange={(event) => setMunicipio(event.target.value)}
            >
              <option value="">Todos</option>
              <option value="Franca">Franca</option>
              <option value="Batatais">Batatais</option>
            </select>
          </label>
          <label className="grid gap-1 text-xs font-semibold">
            UF
            <select
              className={selectClass}
              value={uf}
              onChange={(event) => setUf(event.target.value)}
            >
              <option value="">Todas</option>
              <option value="SP">SP</option>
            </select>
          </label>
          <label className="grid gap-1 text-xs font-semibold">
            Formato
            <select
              className={selectClass}
              value={formato}
              onChange={(event) =>
                setFormato(event.target.value as CampeonatoFormato | 'TODOS')
              }
            >
              <option value="TODOS">Todos</option>
              {Object.entries(formatoLabel).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-xs font-semibold">
            Período de início
            <select
              className={selectClass}
              value={periodo}
              onChange={(event) =>
                setPeriodo(event.target.value as typeof periodo)
              }
            >
              <option value="TODOS">Todos</option>
              <option value="PROXIMOS">Próximos</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </label>
          <label className="grid gap-1 text-xs font-semibold">
            Ordenar campeonatos
            <select
              className={selectClass}
              value={ordenacao}
              onChange={(event) =>
                setOrdenacao(event.target.value as typeof ordenacao)
              }
            >
              <option value="INICIO_ASC">Início mais próximo</option>
              <option value="RECENTES">Criação recente</option>
              <option value="NOME">Nome</option>
            </select>
          </label>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          <strong className="text-foreground">{lista.length}</strong>{' '}
          competições visíveis · página mock 1 de 1
        </p>
      </section>

      {lista.length === 0 ? (
        <EstadoRecurso
          kind="empty"
          title="Nenhum campeonato encontrado"
          description="Tente outros filtros. Rascunhos e competições não publicadas nunca aparecem nesta consulta."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {lista.map((campeonato, index) => (
            <Link
              key={campeonato.id}
              href={`/campeonatos/${campeonato.id}`}
              className={cn(
                'group relative overflow-hidden rounded-[24px] border border-border/70 bg-card p-5 shadow-sm transition hover:border-green-light hover:shadow-md sm:p-6',
                cardFocus,
              )}
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-green-mid/70" />
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-green-pale text-green-dark">
                    <Trophy className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <p className="text-xs font-semibold tracking-[0.15em] text-muted-foreground uppercase">
                    {index === 0 ? 'Em destaque' : campeonato.modalidade}
                  </p>
                  <h2 className="mt-1.5 font-display text-xl font-semibold sm:text-2xl">
                    {campeonato.nome}
                  </h2>
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                    {campeonato.municipio}, {campeonato.uf}
                  </p>
                </div>
                <span className="rounded-full bg-green-pale px-3 py-1 text-xs font-semibold text-green-dark">
                  {campeonato.inscricoesAbertas
                    ? 'Inscrições abertas'
                    : estadoLabel[campeonato.estado]}
                </span>
              </div>
              <div className="mt-6 flex flex-wrap gap-2 border-t border-border/70 pt-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5">
                  <Users className="h-3.5 w-3.5" aria-hidden="true" />
                  {campeonato.timeIds.length} times
                </span>
                <span className="rounded-full bg-muted px-3 py-1.5">
                  {formatoLabel[campeonato.formato]}
                </span>
              </div>
              <div className="mt-6 flex min-h-11 items-center justify-between text-sm font-semibold text-green-dark">
                Ver campeonato
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
