import { AgendarPartidas } from '@/features/partidas/pages/agendar-partidas-page';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AgendarPartidas campeonatoId={id} />;
}
