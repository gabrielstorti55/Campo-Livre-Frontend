const nomesAtletasPublicados: Readonly<Record<number, string>> = {
  1: 'Marcos Oliveira',
  3: 'Diego Souza',
  4: 'Bruno Alves',
  5: 'Henrique Alves',
  6: 'Matheus Costa',
  7: 'André Pereira',
  8: 'Samuel Duarte',
  9: 'Eduardo Nunes',
  10: 'Leonardo Paiva',
};

export function obterNomesAtletasPublicados(ids: number[] = []): string[] {
  return ids.flatMap((id) => {
    const nome = nomesAtletasPublicados[id];
    return nome ? [nome] : [];
  });
}
