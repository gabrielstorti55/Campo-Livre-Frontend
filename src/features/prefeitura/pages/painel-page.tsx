import { Link } from 'react-router-dom';
import { CalendarDays, ChevronRight, MapPinned, Users } from 'lucide-react';

import { ProfileHeroHeader } from '@/shared/components/profile-shell';
import { Card, StatCard } from '@/shared/components/campo-livre-ui';
import { prefeituraStats } from '@/mocks/data';

export function Painel() {
  const acoes = [
    {
      to: '/prefeitura/campos',
      icon: MapPinned,
      titulo: 'Cadastro de campos municipais',
      hint: `${prefeituraStats.camposCadastrados} campos cadastrados`,
    },
    {
      to: '/prefeitura/calendario',
      icon: CalendarDays,
      titulo: 'Calendário de reservas',
      hint: `${prefeituraStats.jogosReservadosMes} jogos reservados neste mês`,
    },
    {
      to: '/prefeitura/organizadores',
      icon: Users,
      titulo: 'Cadastro de Organizadores',
      hint: `${prefeituraStats.organizadores} organizadores`,
    },
  ] as const;

  return (
    <>
      <ProfileHeroHeader
        name="Prefeitura de Franca"
        subtitle="Painel de controle"
        meta="Secretaria de Esportes"
        tone="navy"
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Eventos realizados"
          value={prefeituraStats.eventosRealizados}
          tone="navy"
        />
        <StatCard
          label="Eventos agendados"
          value={prefeituraStats.eventosAgendados}
          tone="navy"
        />
        <StatCard
          label="Disponíveis"
          value={prefeituraStats.disponiveis}
          tone="navy"
        />
        <StatCard
          label="Reprovados"
          value={prefeituraStats.reprovados}
          tone="navy"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Campos cadastrados"
          value={prefeituraStats.camposCadastrados}
          tone="navy"
        />
        <StatCard
          label="Jogos reservados para esse mês"
          value={prefeituraStats.jogosReservadosMes}
          tone="navy"
        />
        <StatCard
          label="Organizadores de eventos"
          value={prefeituraStats.organizadores}
          tone="navy"
        />
        <StatCard
          label="Eventos reservados"
          value={prefeituraStats.eventosReservados}
          tone="navy"
        />
      </div>

      <p className="font-display text-xs font-bold tracking-wide text-muted-foreground uppercase">
        Painel exclusivo p/ Prefeitura
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {acoes.map((a) => (
          <Link key={a.to} to={a.to}>
            <Card className="flex h-full items-center gap-3 transition-shadow hover:shadow-md">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-navy-dark/10">
                <a.icon className="h-5 w-5 text-navy-dark" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display font-semibold text-foreground">
                  {a.titulo}
                </p>
                <p className="text-xs text-muted-foreground">{a.hint}</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
