import { Sumula } from '@/features/partidas/pages/sumula-page';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <Sumula campeonatoId={id} />;
}
