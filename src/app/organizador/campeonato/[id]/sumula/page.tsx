import { obterModoAplicacao } from '@/config/modo-aplicacao';
import { EntradaSumulaSemPartida } from '@/screens/organizador/entrada-sumula-sem-partida';
import { TelaSumulaChaveamento } from '@/screens/organizador/sumula-chaveamento';

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ partida?: string }>;
}) {
  const [{ id }, busca] = await Promise.all([params, searchParams]);
  return busca.partida ? (
    <TelaSumulaChaveamento campeonatoId={id} partidaId={busca.partida} />
  ) : (
    <EntradaSumulaSemPartida modo={obterModoAplicacao()} campeonatoId={id} />
  );
}
