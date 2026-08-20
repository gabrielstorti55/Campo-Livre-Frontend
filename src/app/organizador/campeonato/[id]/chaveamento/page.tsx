import { Chaveamento } from '@/features/campeonatos/pages/chaveamento-page';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <Chaveamento campeonatoId={id} />;
}
