import {
  type SecaoCampeonato,
  TelaVisaoGeralCampeonato,
} from '@/screens/organizador/visao-geral-campeonato';

const secoesValidas: SecaoCampeonato[] = [
  'geral',
  'regulamento',
  'participantes',
  'estrutura',
  'partidas',
  'equipe',
];

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ secao?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const secaoAtiva = secoesValidas.includes(query.secao as SecaoCampeonato)
    ? (query.secao as SecaoCampeonato)
    : 'geral';

  return (
    <TelaVisaoGeralCampeonato
      key={`${id}:${secaoAtiva}`}
      campeonatoId={id}
      secaoAtiva={secaoAtiva}
    />
  );
}
