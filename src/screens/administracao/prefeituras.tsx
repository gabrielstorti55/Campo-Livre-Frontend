'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';

import { CabecalhoPagina } from '@/components/layout/cabecalho-pagina';
import { Cartao } from '@/components/layout/cartao';
import { Button } from '@/components/ui/button';
import { useAdministracaoGlobalApi } from '@/contexts/administracao-global-api';
import { useMunicipiosApi } from '@/contexts/municipios-api';
import { useSessao } from '@/hooks/use-sessao';
import type {
  PrefeituraAdministrativa,
  UsuarioInstitucional,
} from '@/types/api/administracao-global';
import type { EntradaEdicaoPrefeitura } from '@/types/api/administracao-global';
import type { Municipio } from '@/types/api/municipios';

export function TelaPrefeiturasAdministracao() {
  const api = useAdministracaoGlobalApi();
  const municipiosApi = useMunicipiosApi();
  const { executarAutenticado } = useSessao();
  const [itens, setItens] = useState<PrefeituraAdministrativa[]>([]);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [nome, setNome] = useState('');
  const [emailPublico, setEmailPublico] = useState('');
  const [municipioId, setMunicipioId] = useState('');
  const [emailResponsavel, setEmailResponsavel] = useState('');
  const [responsavel, setResponsavel] = useState<UsuarioInstitucional | null>(
    null,
  );
  const [editando, setEditando] = useState<PrefeituraAdministrativa | null>(
    null,
  );
  const [nomeEdicao, setNomeEdicao] = useState('');
  const [emailEdicao, setEmailEdicao] = useState('');
  const [telefoneEdicao, setTelefoneEdicao] = useState('');
  const [removerTelefone, setRemoverTelefone] = useState(false);
  const [mensagem, setMensagem] = useState('');

  const carregar = useCallback(async () => {
    const pagina = await executarAutenticado((token) =>
      api.listarPrefeituras(token, { pagina: 1, tamanho: 100 }),
    );
    setItens(pagina.itens);
  }, [api, executarAutenticado]);

  useEffect(() => {
    void Promise.resolve().then(carregar);
    void municipiosApi
      .listarMunicipios({ pagina: 1, tamanho: 100 })
      .then((pagina) => {
        setMunicipios(pagina.itens);
        setMunicipioId((atual) => atual || pagina.itens[0]?.id || '');
      });
  }, [carregar, municipiosApi]);

  async function buscarResponsavel() {
    const pagina = await executarAutenticado((token) =>
      api.buscarUsuarioPorEmail(emailResponsavel, token),
    );
    setResponsavel(pagina.itens[0] ?? null);
  }

  async function criar(event: FormEvent) {
    event.preventDefault();
    if (!responsavel || !municipioId) return;
    await executarAutenticado((token) =>
      api.criarPrefeitura(
        {
          municipioId,
          nomeOficial: nome.trim(),
          cnpj: null,
          emailContatoPublico: emailPublico.trim(),
          telefoneContatoPublico: null,
          responsavelInicialUsuarioId: responsavel.usuarioId,
        },
        token,
        crypto.randomUUID(),
      ),
    );
    setMensagem('Prefeitura criada e convite inicial emitido.');
    setNome('');
    setEmailPublico('');
    setResponsavel(null);
    await carregar();
  }

  async function salvarEdicao() {
    if (!editando) return;
    const entrada: EntradaEdicaoPrefeitura = {};
    const novoNome = nomeEdicao.trim();
    const novoEmail = emailEdicao.trim();
    const novoTelefone = telefoneEdicao.trim();
    if (novoNome && novoNome !== editando.nomeOficial)
      entrada.nomeOficial = novoNome;
    if (novoEmail) entrada.emailContatoPublico = novoEmail;
    if (removerTelefone) entrada.telefoneContatoPublico = null;
    else if (novoTelefone) entrada.telefoneContatoPublico = novoTelefone;
    if (Object.keys(entrada).length === 0) {
      setMensagem('Informe ao menos um campo para atualizar.');
      return;
    }
    await executarAutenticado((token) =>
      api.editarPrefeitura(editando.id, entrada, token),
    );
    setMensagem('Prefeitura atualizada.');
    setEditando(null);
    await carregar();
  }

  return (
    <div className="space-y-8">
      <CabecalhoPagina
        title="Prefeituras"
        subtitle="Cadastro institucional global"
      />
      <div className="space-y-3">
        {itens.map((prefeitura) => (
          <Cartao
            key={prefeitura.id}
            className="flex flex-wrap items-center gap-3"
          >
            <div className="flex-1">
              <h2 className="font-display text-lg font-semibold">
                {prefeitura.nomeOficial}
              </h2>
              <p className="text-sm text-muted-foreground">
                {prefeitura.municipio.nome}/{prefeitura.municipio.uf} ·{' '}
                {prefeitura.status}
              </p>
            </div>
            <Button
              variant="campoOutline"
              onClick={() => {
                setEditando(prefeitura);
                setNomeEdicao(prefeitura.nomeOficial);
                setEmailEdicao('');
                setTelefoneEdicao('');
                setRemoverTelefone(false);
              }}
            >
              Editar
            </Button>
          </Cartao>
        ))}
      </div>

      {editando ? (
        <section className="border-y py-5">
          <h2 className="font-display text-xl font-semibold">
            Editar Prefeitura
          </h2>
          <label className="mt-3 block text-sm">
            Novo nome oficial
            <input
              className="mt-1 min-h-11 w-full border px-3"
              value={nomeEdicao}
              onChange={(e) => setNomeEdicao(e.target.value)}
            />
          </label>
          <label className="mt-3 block text-sm">
            Novo e-mail público
            <input
              type="email"
              className="mt-1 min-h-11 w-full border px-3"
              value={emailEdicao}
              onChange={(e) => setEmailEdicao(e.target.value)}
            />
          </label>
          <label className="mt-3 block text-sm">
            Novo telefone público
            <input
              className="mt-1 min-h-11 w-full border px-3"
              value={telefoneEdicao}
              disabled={removerTelefone}
              onChange={(e) => setTelefoneEdicao(e.target.value)}
            />
          </label>
          <label className="mt-3 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={removerTelefone}
              onChange={(e) => setRemoverTelefone(e.target.checked)}
            />
            Remover telefone público atual
          </label>
          <p className="mt-2 text-xs text-muted-foreground">
            A listagem administrativa não retorna os contatos atuais. Campos de
            contato vazios permanecem inalterados; marque a opção acima para
            remover explicitamente o telefone.
          </p>
          <Button className="mt-3" onClick={() => void salvarEdicao()}>
            Salvar edição
          </Button>
        </section>
      ) : null}

      <section className="border-t pt-6">
        <h2 className="font-display text-2xl font-semibold">
          Criar Prefeitura
        </h2>
        <form className="mt-4 space-y-4" onSubmit={criar}>
          <label className="block text-sm">
            Município
            <select
              className="mt-1 min-h-11 w-full border px-3"
              value={municipioId}
              onChange={(e) => setMunicipioId(e.target.value)}
            >
              {municipios.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nome}/{m.uf}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            Nome oficial
            <input
              required
              className="mt-1 min-h-11 w-full border px-3"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            E-mail público
            <input
              required
              type="email"
              className="mt-1 min-h-11 w-full border px-3"
              value={emailPublico}
              onChange={(e) => setEmailPublico(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            E-mail do responsável inicial
            <input
              required
              type="email"
              className="mt-1 min-h-11 w-full border px-3"
              value={emailResponsavel}
              onChange={(e) => setEmailResponsavel(e.target.value)}
            />
          </label>
          <Button
            type="button"
            variant="campoOutline"
            onClick={() => void buscarResponsavel()}
          >
            Buscar responsável
          </Button>
          {responsavel ? (
            <p>
              <strong>{responsavel.nome}</strong> · @{responsavel.nomeUsuario}
            </p>
          ) : null}
          <Button type="submit" disabled={!responsavel || !municipioId}>
            Criar Prefeitura
          </Button>
        </form>
      </section>
      {mensagem ? <p role="status">{mensagem}</p> : null}
    </div>
  );
}
