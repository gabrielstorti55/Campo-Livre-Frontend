import { TelaParticipantesPublicosCampeonato } from '@/screens/publico/participantes-publicos-campeonato';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TelaParticipantesPublicosCampeonato campeonatoId={id} />;
}
