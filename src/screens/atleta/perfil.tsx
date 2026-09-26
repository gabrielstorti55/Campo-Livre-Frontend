'use client';

import Link from 'next/link';
import { Trophy } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';

import { CabecalhoPagina } from '@/components/layout/cabecalho-pagina';
import { CampoFormulario } from '@/components/layout/campo-formulario';
import { CartaoFormulario } from '@/components/layout/cartao-formulario';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAutenticacaoApi } from '@/contexts/autenticacao-api';
import { useMunicipiosApi } from '@/contexts/municipios-api';
import { useSessao } from '@/hooks/use-sessao';
import { obterAtletaPublicoDaContaPrototipo } from '@/mocks/atleta/perfis-contas';
import type { MinhaConta, PosicaoPrincipal } from '@/types/api/autenticacao';
import type { AtletaPublico } from '@/types/publico';
import type { Municipio } from '@/types/api/municipios';

const posicoes: Array<{ value: PosicaoPrincipal; label: string }> = [
  { value: 'GOLEIRO', label: 'Goleiro' },
  { value: 'ZAGUEIRO', label: 'Zagueiro' },
  { value: 'LATERAL', label: 'Lateral' },
  { value: 'MEIO_CAMPO', label: 'Meio-campo' },
  { value: 'ATACANTE', label: 'Atacante' },
];

function EditorPerfil({
  conta,
  atletaPublico,
}: {
  conta: MinhaConta;
  atletaPublico?: AtletaPublico | undefined;
}) {
  const api = useAutenticacaoApi();
  const municipiosApi = useMunicipiosApi();
  const { executarAutenticado, recarregarMinhaConta } = useSessao();
  const municipio = conta.municipio
    ? `${conta.municipio.nome}/${conta.municipio.uf}`
    : 'Município não informado';
  const [nome, setNome] = useState(conta.nome);
  const [biografia, setBiografia] = useState(conta.biografia ?? '');
  const [posicao, setPosicao] = useState<PosicaoPrincipal | ''>(
    conta.posicaoPrincipal ?? '',
  );
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [municipioId, setMunicipioId] = useState(conta.municipio?.id ?? '');
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const titulos =
    atletaPublico?.campeonatos.filter(
      (participacao) => participacao.resultado === 'Campeão',
    ) ?? [];

  useEffect(() => {
    void municipiosApi
      .listarMunicipios({ pagina: 1, tamanho: 100 })
      .then((pagina) => {
        setMunicipios(pagina.itens);
        setMunicipioId((atual) => atual || pagina.itens[0]?.id || '');
      });
  }, [municipiosApi]);

  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setOcupado(true);
    setMensagem(null);
    try {
      await executarAutenticado((accessToken) =>
        api.atualizarMinhaConta(accessToken, {
          nome: nome.trim(),
          biografia: biografia.trim() || null,
          municipioId,
          posicaoPrincipal: posicao || null,
        }),
      );
      await recarregarMinhaConta();
      setMensagem('Perfil básico atualizado.');
    } catch {
      setMensagem('Não foi possível atualizar o perfil. Revise os campos.');
    } finally {
      setOcupado(false);
    }
  }

  async function enviarFoto(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!arquivo) return;
    setOcupado(true);
    setMensagem(null);
    try {
      await executarAutenticado((accessToken) =>
        api.enviarFotoMinhaConta(accessToken, arquivo),
      );
      await recarregarMinhaConta();
      setArquivo(null);
      setMensagem('Foto atualizada.');
    } catch {
      setMensagem('Não foi possível processar a foto selecionada.');
    } finally {
      setOcupado(false);
    }
  }

  async function removerFoto() {
    setOcupado(true);
    setMensagem(null);
    try {
      await executarAutenticado((accessToken) =>
        api.removerFotoMinhaConta(accessToken),
      );
      await recarregarMinhaConta();
      setMensagem('Foto removida.');
    } catch {
      setMensagem('Não foi possível remover a foto.');
    } finally {
      setOcupado(false);
    }
  }

  return (
    <>
      <CabecalhoPagina
        title="Perfil básico"
        subtitle={`@${conta.nomeUsuario} · ${municipio}`}
        actions={
          <Button variant="campoOutline" asChild>
            <Link href="/minha-conta">Dados privados e segurança</Link>
          </Button>
        }
      />

      {atletaPublico ? (
        <section
          aria-label="Suas estatísticas"
          className="mb-6 border-t-4 border-accent bg-green-dark p-5 text-white"
        >
          <h2 className="font-display text-xl font-bold uppercase">
            Suas estatísticas
          </h2>
          <p className="mt-1 text-sm text-white/70">
            Números publicados nas competições do CampoLivre
          </p>
          <dl className="mt-5 grid max-w-sm grid-cols-2 gap-6">
            <div>
              <dt className="text-sm text-white/70">Partidas</dt>
              <dd className="font-display text-4xl font-bold">
                {atletaPublico.partidasPublicadas}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-white/70">Gols</dt>
              <dd className="font-display text-4xl font-bold">
                {atletaPublico.golsPublicados}
              </dd>
            </div>
          </dl>
        </section>
      ) : null}

      {titulos.length ? (
        <section
          aria-label="Títulos conquistados"
          className="mb-6 border-y border-border bg-card py-5 sm:p-6"
        >
          <div className="flex items-center gap-3">
            <Trophy className="h-6 w-6 text-accent" aria-hidden="true" />
            <div>
              <h2 className="font-display text-xl font-bold uppercase">
                Títulos conquistados
              </h2>
              <p className="text-sm text-muted-foreground">
                Campanhas publicadas em que você terminou como campeão
              </p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {titulos.map((titulo) => (
              <article
                key={`${titulo.campeonato}-${titulo.ano}`}
                className="border-l-2 border-accent pl-4"
              >
                <h3 className="font-semibold">{titulo.campeonato}</h3>
                <p className="text-sm text-muted-foreground">
                  {titulo.resultado} · {titulo.ano}
                </p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <form onSubmit={salvar}>
        <CartaoFormulario>
          <CampoFormulario label="Nome público" htmlFor="nome-perfil">
            <Input
              id="nome-perfil"
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              required
            />
          </CampoFormulario>

          <CampoFormulario label="Biografia" htmlFor="biografia-perfil">
            <Textarea
              id="biografia-perfil"
              value={biografia}
              onChange={(event) => setBiografia(event.target.value)}
              rows={5}
            />
          </CampoFormulario>

          <CampoFormulario label="Posição principal" htmlFor="posicao-perfil">
            <select
              id="posicao-perfil"
              value={posicao}
              onChange={(event) =>
                setPosicao(event.target.value as PosicaoPrincipal | '')
              }
              className="flex min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Não informar</option>
              {posicoes.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </CampoFormulario>

          <CampoFormulario label="Município" htmlFor="municipio-perfil">
            <select
              id="municipio-perfil"
              value={municipioId}
              onChange={(event) => setMunicipioId(event.target.value)}
              className="flex min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            >
              <option value="" disabled>
                Selecione um município
              </option>
              {municipios.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nome}/{item.uf}
                </option>
              ))}
            </select>
          </CampoFormulario>

          <Button type="submit" variant="campo" disabled={ocupado}>
            Salvar perfil
          </Button>
        </CartaoFormulario>
      </form>

      <form onSubmit={enviarFoto} className="mt-6">
        <CartaoFormulario>
          <div>
            <h2 className="font-display text-xl font-bold">Foto pública</h2>
            <p className="text-sm text-muted-foreground">
              PNG, JPEG ou WebP. O servidor valida o conteúdo, remove metadados
              e normaliza a imagem.
            </p>
          </div>
          <CampoFormulario label="Arquivo da foto" htmlFor="foto-perfil">
            <Input
              id="foto-perfil"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => setArquivo(event.target.files?.[0] ?? null)}
            />
          </CampoFormulario>
          <div className="flex flex-wrap gap-3">
            <Button
              type="submit"
              variant="campo"
              disabled={ocupado || !arquivo}
            >
              Enviar foto
            </Button>
            <Button
              type="button"
              variant="campoOutline"
              disabled={ocupado || !conta.fotoUrl}
              onClick={() => void removerFoto()}
            >
              Remover foto
            </Button>
          </div>
        </CartaoFormulario>
      </form>

      {mensagem ? (
        <p role="status" className="mt-4 text-sm">
          {mensagem}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-4 text-sm font-semibold">
        <Link
          href="/minha-conta/alterar-email"
          className="text-green-dark hover:underline"
        >
          Alterar e-mail
        </Link>
        <Link
          href="/minha-conta/seguranca"
          className="text-green-dark hover:underline"
        >
          Alterar senha
        </Link>
      </div>
    </>
  );
}

export function TelaPerfilAtletaAutenticado() {
  const { session } = useSessao();
  if (!session) return <p role="status">Carregando perfil...</p>;
  const atletaPublico = session.prototipo
    ? obterAtletaPublicoDaContaPrototipo(session.minhaConta.id)
    : undefined;
  return (
    <EditorPerfil
      key={session.minhaConta.id}
      conta={session.minhaConta}
      atletaPublico={atletaPublico}
    />
  );
}
