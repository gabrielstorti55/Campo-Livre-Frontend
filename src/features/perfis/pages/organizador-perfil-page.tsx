import { Settings } from 'lucide-react';
import { useState } from 'react';

import { ContextSwitcher } from '@/features/auth/components/context-switcher';
import { useSession } from '@/features/auth/session/session-context';
import { campeonatos, organizadorLogado } from '@/mocks/data';
import { Section, StatGrid } from '@/shared/components/campo-livre-ui';
import { ListRow } from '@/shared/components/list-row';
import { ProfileHeroHeader } from '@/shared/components/profile-shell';
import { StatusBadge } from '@/shared/components/status-badge';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';

export function OrganizadorPerfil() {
  const { session } = useSession();
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <ProfileHeroHeader
        name={session?.account.name ?? organizadorLogado.nome}
        subtitle={organizadorLogado.cidade}
        meta={`Score ${organizadorLogado.score}`}
      />

      <StatGrid
        columns={3}
        items={[
          { label: 'Eventos realizados', value: organizadorLogado.eventos },
          { label: 'Times', value: organizadorLogado.times },
          { label: 'Partidas', value: organizadorLogado.partidasOrganizadas },
        ]}
      />

      <Section title="Campeonatos organizados">
        {campeonatos.map((c) => (
          <ListRow
            key={c.id}
            title={c.nome}
            subtitle={`${c.modalidade} · ${c.times} times`}
            right={<StatusBadge status={c.status} />}
          />
        ))}
      </Section>

      <Button variant="campoOutline" onClick={() => setAberto(true)}>
        <Settings className="h-4 w-4" /> Configurações
      </Button>

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Configurações</DialogTitle>
            <DialogDescription>
              Alterne o contexto da mesma conta sem fazer um novo login.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <ContextSwitcher />
            <Button
              variant="campoOutline"
              className="w-full"
              onClick={() => setAberto(false)}
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
