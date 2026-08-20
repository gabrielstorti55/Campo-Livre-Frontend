'use client';

import {
  CalendarDays,
  CheckSquare,
  ChevronRight,
  MapPinned,
  Users,
} from 'lucide-react';
import Link from 'next/link';

import { useEstadoOperacionalPrefeitura } from '@/stores/estado-operacional-prefeitura';
import { CabecalhoPagina } from '@/components/layout/cabecalho-pagina';
import { Secao } from '@/components/layout/secao';
import { CartaoEstatistica } from '@/components/layout/cartao-estatistica';

export function TelaPainelPrefeitura() {
  const { state } = useEstadoOperacionalPrefeitura();
  const pending = state.reservations.filter(
    (item) => item.status === 'PENDING',
  ).length;
  const approved = state.reservations.filter(
    (item) => item.status === 'APPROVED',
  ).length;
  const rejected = state.reservations.filter(
    (item) => item.status === 'REJECTED',
  ).length;
  const available = state.fields.filter(
    (item) => item.status === 'AVAILABLE',
  ).length;
  const activeOrganizers = state.organizers.filter(
    (item) => item.status === 'ACTIVE',
  ).length;
  const actions = [
    {
      to: '/prefeitura/campos',
      icon: MapPinned,
      title: 'Campos municipais',
      hint: `${state.fields.length} equipamentos cadastrados`,
    },
    {
      to: '/prefeitura/calendario',
      icon: CalendarDays,
      title: 'Agenda de reservas',
      hint: `${approved} reservas aprovadas`,
    },
    {
      to: '/prefeitura/organizadores',
      icon: Users,
      title: 'Organizadores credenciados',
      hint: `${activeOrganizers} cadastros ativos`,
    },
    {
      to: '/prefeitura/aprovacoes',
      icon: CheckSquare,
      title: 'Aprovações',
      hint: `${pending} solicitações aguardando análise`,
    },
  ] as const;

  return (
    <>
      <CabecalhoPagina
        title="Prefeitura de Franca"
        subtitle="Gestão municipal do esporte amador · dados demonstrativos"
      />

      <Secao title="Situação operacional">
        <div className="grid grid-cols-2 gap-x-6 gap-y-5 lg:grid-cols-4">
          <CartaoEstatistica label="Pendentes" value={pending} tone="navy" />
          <CartaoEstatistica label="Aprovados" value={approved} tone="navy" />
          <CartaoEstatistica
            label="Disponíveis"
            value={available}
            tone="navy"
          />
          <CartaoEstatistica label="Reprovados" value={rejected} tone="navy" />
        </div>
      </Secao>

      <Secao title="Gestão municipal">
        <div className="border-t border-border">
          {actions.map((action) => (
            <Link
              key={action.to}
              href={action.to}
              className="group flex items-center gap-4 border-b border-border py-5"
            >
              <action.icon className="h-5 w-5 shrink-0 text-navy-mid" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground group-hover:text-navy-mid">
                  {action.title}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {action.hint}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </Secao>
    </>
  );
}
