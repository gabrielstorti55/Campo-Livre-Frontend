'use client';

import { useEffect, useState } from 'react';

import { useCampeonatosApi } from '@/contexts/campeonatos-api';
import { useSessao } from '@/hooks/use-sessao';
import type { CampeonatoAdministrado } from '@/types/api/campeonatos';

const TAMANHO_PAGINA = 20;

export function useCampeonatosAdministrados() {
  const { hydrated, session, executarAutenticado } = useSessao();
  const api = useCampeonatosApi();
  const [campeonatos, setCampeonatos] = useState<CampeonatoAdministrado[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!hydrated) return;
    let ativo = true;
    void Promise.resolve().then(() => {
      if (!ativo) return;
      setCampeonatos([]);
      setErro('');
      setCarregando(true);
    });
    executarAutenticado(async (token) => {
      const primeira = await api.listarCampeonatosAdministrados(
        token,
        1,
        TAMANHO_PAGINA,
      );
      const itens = [...primeira.itens];
      for (let pagina = 2; pagina <= primeira.totalPaginas; pagina += 1) {
        const proxima = await api.listarCampeonatosAdministrados(
          token,
          pagina,
          TAMANHO_PAGINA,
        );
        itens.push(...proxima.itens);
      }
      return itens;
    })
      .then((itens) => ativo && setCampeonatos(itens))
      .catch(
        () =>
          ativo &&
          setErro('Não foi possível carregar os Campeonatos administrados.'),
      )
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
    // A sessão hidratada é a fronteira de recuperação; o provider é estável.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, session?.sessionId]);

  return { campeonatos, carregando, erro };
}
