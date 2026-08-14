import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { useState } from 'react';

import { ProfileHeroHeader } from '@/shared/components/profile-shell';
import { StatusBadge } from '@/shared/components/status-badge';
import { ListRow } from '@/shared/components/list-row';
import {
  OutlineButton,
  PrimaryButton,
  Section,
  StatGrid,
} from '@/shared/components/campo-livre-ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { campeonatos, organizadorLogado } from '@/mocks/data';

export function OrganizadorPerfil() {
  const navigate = useNavigate();
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <ProfileHeroHeader
        name={organizadorLogado.nome}
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

      <OutlineButton onClick={() => setAberto(true)}>
        <Settings className="h-4 w-4" /> Configurações
      </OutlineButton>

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Configurações</DialogTitle>
            <DialogDescription>
              Você pode alternar entre seus perfis a qualquer momento.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <PrimaryButton
              className="w-full"
              onClick={() => navigate('/atleta/inicio')}
            >
              Trocar para perfil Atleta
            </PrimaryButton>
            <OutlineButton className="w-full" onClick={() => setAberto(false)}>
              Fechar
            </OutlineButton>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
