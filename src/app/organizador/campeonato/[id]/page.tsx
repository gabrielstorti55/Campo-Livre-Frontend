import { VisaoGeral } from '@/features/campeonatos/pages/visao-geral-page';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <VisaoGeral key={id} campeonatoId={id} />;
}
