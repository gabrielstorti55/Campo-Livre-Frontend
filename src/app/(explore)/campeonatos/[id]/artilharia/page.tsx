import { TelaArtilhariaPublicaCampeonato } from '@/screens/publico/artilharia-publica-campeonato';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TelaArtilhariaPublicaCampeonato campeonatoId={id} />;
}
