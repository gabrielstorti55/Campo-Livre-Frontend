import { Link } from 'react-router-dom';
import { CalendarDays, ChevronRight, MapPinned, Users } from 'lucide-react';

import { ProfileHeroHeader } from '@/shared/components/profile-shell';
import { Section, StatCard } from '@/shared/components/campo-livre-ui';
import { prefeituraStats } from '@/mocks/data';

export function Painel() {
  const acoes = [
    {
      to: '/prefeitura/campos',
      icon: MapPinned,
      titulo: 'Campos municipais',
      hint: `${prefeituraStats.camposCadastrados} equipamentos cadastrados`,
    },
    {
      to: '/prefeitura/calendario',
      icon: CalendarDays,
      titulo: 'Agenda de reservas',
      hint: `${prefeituraStats.jogosReservadosMes} jogos previstos neste mês`,
    },
    {
      to: '/prefeitura/organizadores',
      icon: Users,
      titulo: 'Organizadores credenciados',
      hint: `${prefeituraStats.organizadores} cadastros ativos`,
    },
  ] as const;

  return (
    <>
      <ProfileHeroHeader
        name="Prefeitura de Franca"
        subtitle="Operação municipal do esporte amador"
        meta="Secretaria de Esportes · dados demonstrativos"
        tone="navy"
      />

      <Section title="Situação dos eventos">
        <div className="grid grid-cols-2 gap-x-6 gap-y-5 lg:grid-cols-4">
          <StatCard
            label="Realizados"
            value={prefeituraStats.eventosRealizados}
            tone="navy"
          />
          <StatCard
            label="Agendados"
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
      </Section>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
        <Section title="Gestão municipal">
          <div className="border-t border-border">
            {acoes.map((acao) => (
              <Link
                key={acao.to}
                to={acao.to}
                className="group flex items-center gap-4 border-b border-border py-5"
              >
                <acao.icon className="h-5 w-5 shrink-0 text-navy-mid" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground group-hover:text-navy-mid">
                    {acao.titulo}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {acao.hint}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </Section>

        <Section title="Resumo operacional">
          <dl className="border-t border-border text-sm">
            <div className="flex items-center justify-between border-b border-border py-4">
              <dt className="text-muted-foreground">Campos cadastrados</dt>
              <dd className="font-semibold text-foreground">
                {prefeituraStats.camposCadastrados}
              </dd>
            </div>
            <div className="flex items-center justify-between border-b border-border py-4">
              <dt className="text-muted-foreground">Reservas no mês</dt>
              <dd className="font-semibold text-foreground">
                {prefeituraStats.jogosReservadosMes}
              </dd>
            </div>
            <div className="flex items-center justify-between border-b border-border py-4">
              <dt className="text-muted-foreground">Organizadores</dt>
              <dd className="font-semibold text-foreground">
                {prefeituraStats.organizadores}
              </dd>
            </div>
            <div className="flex items-center justify-between border-b border-border py-4">
              <dt className="text-muted-foreground">Eventos reservados</dt>
              <dd className="font-semibold text-foreground">
                {prefeituraStats.eventosReservados}
              </dd>
            </div>
          </dl>
        </Section>
      </div>
    </>
  );
}
