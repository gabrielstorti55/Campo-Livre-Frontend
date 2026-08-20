import { TelaVisaoGeralCampeonato } from '@/screens/organizador/visao-geral-campeonato';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TelaVisaoGeralCampeonato key={id} campeonatoId={id} />;
}
