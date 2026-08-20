import { TelaReservasCampeonato } from '@/screens/organizador/reservas';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TelaReservasCampeonato campeonatoId={id} />;
}
