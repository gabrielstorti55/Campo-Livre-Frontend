import { TelaChaveamento } from '@/screens/organizador/chaveamento';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TelaChaveamento campeonatoId={id} />;
}
