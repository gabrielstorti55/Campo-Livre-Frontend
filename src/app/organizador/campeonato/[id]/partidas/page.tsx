import { TelaGerenciarPartidas } from '@/screens/organizador/gerenciar-partidas';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TelaGerenciarPartidas campeonatoId={id} />;
}
