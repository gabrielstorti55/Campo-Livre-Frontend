import { GerenciarTimes } from '@/features/times/pages/gerenciar-times-page';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <GerenciarTimes campeonatoId={id} />;
}
