import { CalendarDays, MapPin, Users } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { useSession } from '@/features/auth/session/session-context';
import { ProximaPartidaCard } from '@/features/campeonatos/components/campeonato-widgets';
import { atletaLogado, campeonatos, partidas, times } from '@/mocks/data';
import {
  FilterPills,
  GroupLabel,
  SearchBar,
  Section,
} from '@/shared/components/campo-livre-ui';
import {
  Chevron,
  ListRow,
  MetaRow,
  RowAvatar,
} from '@/shared/components/list-row';
import { ProfileHeroHeader } from '@/shared/components/profile-shell';
import { StatusBadge } from '@/shared/components/status-badge';
import { Button } from '@/shared/components/ui/button';

const filtros = [
  'Todos os tipos',
  'Futebol Society',
  'Futebol de Campo',
  'Mais',
];
const abas = ['Todos', 'Ativos', 'Encerrados'];

export function AtletaInicio() {
  const { session } = useSession();
  const [filtro, setFiltro] = useState('Todos os tipos');
  const [aba, setAba] = useState('Todos');
  const [busca, setBusca] = useState('');

  const meusTimes = times.slice(0, 2);
  const proximosJogos = partidas
    .filter((p) => p.agendada && !p.concluida)
    .slice(0, 2);

  const lista = campeonatos.filter((c) => {
    const porBusca = c.nome.toLowerCase().includes(busca.toLowerCase());
    const porTipo =
      filtro === 'Futebol Society'
        ? c.modalidade.includes('Society')
        : filtro === 'Futebol de Campo'
          ? c.modalidade.includes('Campo')
          : true;
    const porAba =
      aba === 'Ativos'
        ? c.status !== 'Encerrado'
        : aba === 'Encerrados'
          ? c.status === 'Encerrado'
          : true;
    return porBusca && porTipo && porAba;
  });

  const grupos = [
    {
      titulo: 'Ativos',
      itens: lista.filter(
        (c) => c.status === 'Em andamento' || c.status === 'Fase Final',
      ),
    },
    {
      titulo: 'Inscrições abertas',
      itens: lista.filter((c) => c.status === 'Inscrições abertas'),
    },
    {
      titulo: 'Encerrados',
      itens: lista.filter((c) => c.status === 'Encerrado'),
    },
  ].filter((g) => g.itens.length > 0);

  return (
    <>
      <ProfileHeroHeader
        name={session?.account.name ?? atletaLogado.nome}
        subtitle={session?.account.city ?? atletaLogado.cidade}
        meta="Minha área · conta pessoal"
      />

      <Section title="Meus Times">
        <div className="grid gap-4 md:grid-cols-2">
          {meusTimes.map((t) => (
            <Link key={t.id} to={`/atleta/time/${t.id}`}>
              <ListRow
                interactive
                avatar={<RowAvatar name={t.nome} />}
                title={t.nome}
                subtitle={t.campeonato ?? 'Sem campeonato'}
                right={<StatusBadge status={t.status} />}
              />
            </Link>
          ))}
        </div>
      </Section>

      <Section title="Meus próximos jogos">
        <div className="grid gap-3 md:grid-cols-2">
          {proximosJogos.map((p) => (
            <ProximaPartidaCard
              key={p.id}
              casa={p.casa}
              fora={p.fora}
              rodada={p.rodada}
              meta={[
                { icon: CalendarDays, label: `${p.data} · ${p.hora}` },
                { icon: MapPin, label: p.campo },
              ]}
            />
          ))}
        </div>
      </Section>

      <Section title="Campeonatos na Região">
        <SearchBar
          placeholder="Buscar campeonato..."
          value={busca}
          onChange={setBusca}
        />
        <FilterPills
          options={abas}
          value={aba}
          onChange={setAba}
          variant="solid"
        />
        <FilterPills options={filtros} value={filtro} onChange={setFiltro} />

        <div className="space-y-6 pt-2">
          {grupos.map((g) => (
            <div key={g.titulo}>
              <GroupLabel className="mb-2">{g.titulo}</GroupLabel>
              <div className="space-y-3">
                {g.itens.map((c) => (
                  <div
                    key={c.id}
                    className="flex flex-wrap items-center gap-3 border-b border-border py-4"
                  >
                    <RowAvatar name={c.nome} />
                    <Link
                      to={`/campeonatos/${c.id}`}
                      className="min-w-0 flex-1"
                    >
                      <p className="truncate font-display font-semibold text-foreground">
                        {c.nome}
                      </p>
                      <MetaRow
                        className="mt-0.5"
                        items={[
                          { icon: MapPin, label: c.cidade },
                          {
                            icon: Users,
                            label: `${c.times} times · ${c.modalidade}`,
                          },
                        ]}
                      />
                    </Link>
                    <StatusBadge status={c.status} />
                    {c.status === 'Inscrições abertas' ? (
                      <Button variant="campo" className="py-2.5">
                        Solicitar inscrição
                      </Button>
                    ) : (
                      <Link
                        to={`/campeonatos/${c.id}`}
                        aria-label={`Abrir ${c.nome}`}
                      >
                        <Chevron />
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
