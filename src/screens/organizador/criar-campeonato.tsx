'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { CabecalhoPagina } from '@/components/layout/cabecalho-pagina';
import { CampoFormulario } from '@/components/layout/campo-formulario';
import { EstadoRecurso } from '@/components/layout/estado-recurso';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCampeonatosApi } from '@/contexts/campeonatos-api';
import { useMunicipiosApi } from '@/contexts/municipios-api';
import { usePrefeiturasApi } from '@/contexts/prefeituras-api';
import { useSessao } from '@/hooks/use-sessao';
import type { FormatoCampeonato } from '@/types/api/campeonatos';
import type { Municipio } from '@/types/api/municipios';
import type { PrefeituraDaConta } from '@/types/api/prefeituras';

function novaChaveIdempotencia() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `campeonato-${Date.now()}-${Math.random().toString(16).slice(2)}`
  );
}

export function TelaCriarCampeonato() {
  const router = useRouter();
  const campeonatosApi = useCampeonatosApi();
  const municipiosApi = useMunicipiosApi();
  const prefeiturasApi = usePrefeiturasApi();
  const { session, executarAutenticado } = useSessao();
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [prefeituras, setPrefeituras] = useState<PrefeituraDaConta[]>([]);
  const [municipioId, setMunicipioId] = useState('');
  const [contexto, setContexto] = useState('PESSOAL');
  const [formato, setFormato] = useState<FormatoCampeonato>('PONTOS_CORRIDOS');
  const [carregandoContextos, setCarregandoContextos] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const chaveTentativa = useRef(novaChaveIdempotencia());

  useEffect(() => {
    if (!session) return;
    let ativo = true;
    Promise.all([
      municipiosApi.listarMunicipios({ pagina: 1, tamanho: 100 }),
      executarAutenticado((accessToken) =>
        prefeiturasApi.listarMinhasPrefeituras(accessToken, 1, 100),
      ),
    ])
      .then(([paginaMunicipios, paginaPrefeituras]) => {
        if (!ativo) return;
        setMunicipios(paginaMunicipios.itens);
        setPrefeituras(
          paginaPrefeituras.itens.filter(
            (vinculo) => vinculo.prefeitura.status === 'ATIVA',
          ),
        );
        setMunicipioId((atual) => atual || paginaMunicipios.itens[0]?.id || '');
      })
      .catch(() => {
        if (ativo)
          setErro(
            'Não foi possível carregar Municípios e contextos institucionais.',
          );
      })
      .finally(() => {
        if (ativo) setCarregandoContextos(false);
      });

    return () => {
      ativo = false;
    };
  }, [executarAutenticado, municipiosApi, prefeiturasApi, session]);

  const prefeituraSelecionada = prefeituras.find(
    (vinculo) => vinculo.prefeitura.id === contexto,
  );

  return (
    <>
      <CabecalhoPagina
        title="Novo Campeonato"
        subtitle="Crie a competição com os dados essenciais e continue a configuração no workspace."
      />

      {erro && !municipios.length ? (
        <EstadoRecurso
          kind="error"
          title="Contextos indisponíveis"
          description={erro}
        />
      ) : null}

      <form
        className="mt-6 max-w-2xl space-y-5 border-t border-border pt-6"
        onSubmit={async (event) => {
          event.preventDefault();
          if (!municipioId || enviando) return;
          const dados = new FormData(event.currentTarget);
          setErro(null);
          setEnviando(true);
          try {
            const resultado = await executarAutenticado((accessToken) =>
              campeonatosApi.criarCampeonato(
                accessToken,
                {
                  nome: String(dados.get('nome') ?? '').trim(),
                  municipioId,
                  contexto: prefeituraSelecionada ? 'PREFEITURA' : 'PESSOAL',
                  prefeituraId: prefeituraSelecionada?.prefeitura.id ?? null,
                  formato,
                  inicioPrevistoEm: String(dados.get('inicioPrevistoEm') ?? ''),
                },
                chaveTentativa.current,
              ),
            );
            chaveTentativa.current = novaChaveIdempotencia();
            router.push(`/organizador/campeonato/${resultado.id}`);
          } catch {
            setErro(
              'Não foi possível criar o campeonato. Revise os dados e tente novamente.',
            );
          } finally {
            setEnviando(false);
          }
        }}
      >
        <CampoFormulario label="Nome do campeonato" htmlFor="nome-campeonato">
          <Input id="nome-campeonato" name="nome" required minLength={1} />
        </CampoFormulario>

        <CampoFormulario
          label="Contexto responsável"
          htmlFor="contexto-responsavel"
        >
          <select
            id="contexto-responsavel"
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={contexto}
            onChange={(event) => {
              const valor = event.target.value;
              setContexto(valor);
              const prefeitura = prefeituras.find(
                (item) => item.prefeitura.id === valor,
              );
              if (prefeitura)
                setMunicipioId(prefeitura.prefeitura.municipio.id);
            }}
            disabled={carregandoContextos}
          >
            <option value="PESSOAL">
              Pessoal — {session?.account.name ?? 'Conta pessoal'}
            </option>
            {prefeituras.map((vinculo) => (
              <option key={vinculo.membroId} value={vinculo.prefeitura.id}>
                {vinculo.prefeitura.nomeOficial}
              </option>
            ))}
          </select>
        </CampoFormulario>

        <CampoFormulario label="Município" htmlFor="municipio-campeonato">
          <select
            id="municipio-campeonato"
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={municipioId}
            onChange={(event) => setMunicipioId(event.target.value)}
            disabled={carregandoContextos || Boolean(prefeituraSelecionada)}
            required
          >
            <option value="">Selecione</option>
            {municipios.map((municipio) => (
              <option key={municipio.id} value={municipio.id}>
                {municipio.nome} — {municipio.uf}
              </option>
            ))}
          </select>
        </CampoFormulario>

        <CampoFormulario
          label="Formato pretendido"
          htmlFor="formato-campeonato"
        >
          <select
            id="formato-campeonato"
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={formato}
            onChange={(event) =>
              setFormato(event.target.value as FormatoCampeonato)
            }
          >
            <option value="PONTOS_CORRIDOS">Pontos corridos</option>
            <option value="MATA_MATA">Mata-mata</option>
            <option value="GRUPOS_E_MATA_MATA">Grupos e mata-mata</option>
          </select>
        </CampoFormulario>

        <CampoFormulario
          label="Data prevista de início"
          htmlFor="inicio-previsto"
        >
          <Input
            id="inicio-previsto"
            name="inicioPrevistoEm"
            type="date"
            required
          />
        </CampoFormulario>

        {erro ? (
          <p role="alert" className="text-sm font-semibold text-destructive">
            {erro}
          </p>
        ) : null}

        <Button
          type="submit"
          variant="campo"
          disabled={carregandoContextos || !municipioId || enviando}
        >
          {enviando ? 'Criando campeonato...' : 'Criar campeonato'}
        </Button>
      </form>
    </>
  );
}
