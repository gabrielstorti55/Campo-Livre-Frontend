'use client';

import { useEffect, useState } from 'react';

import { CampoFormulario } from '@/components/layout/campo-formulario';
import { CartaoFormulario } from '@/components/layout/cartao-formulario';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTimesApi } from '@/contexts/times-api';
import { useSessao } from '@/hooks/use-sessao';
import type { HistoricoMembroTime, MembroElenco } from '@/types/api/times';

export function OperacoesTime({
  timeId,
  status,
  onStatusChange,
}: {
  timeId: string;
  status: 'ATIVO' | 'DESATIVADO';
  onStatusChange: (status: 'ATIVO' | 'DESATIVADO') => void;
}) {
  const api = useTimesApi();
  const { executarAutenticado } = useSessao();
  const [elenco, setElenco] = useState<MembroElenco[]>([]);
  const [historico, setHistorico] = useState<HistoricoMembroTime[]>([]);
  const [motivoRemocao, setMotivoRemocao] = useState('');
  const [motivoDesativacao, setMotivoDesativacao] = useState('');
  const [confirmacao, setConfirmacao] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    void api.listarElenco(timeId, 1, 100).then((pagina) => {
      if (ativo) setElenco(pagina.itens);
    });
    void executarAutenticado((accessToken) =>
      api.listarHistoricoElenco(timeId, accessToken, 1, 20),
    ).then(
      (pagina) => {
        if (ativo) setHistorico(pagina.itens);
      },
      () => {
        // Histórico é privado; ausência de permissão não impede o elenco público.
      },
    );
    return () => {
      ativo = false;
    };
  }, [api, executarAutenticado, timeId]);

  async function executar(
    operacao: (accessToken: string) => Promise<unknown>,
    sucesso: string,
  ): Promise<boolean> {
    setOcupado(true);
    setMensagem(null);
    try {
      await executarAutenticado(operacao);
      setMensagem(sucesso);
      return true;
    } catch {
      setMensagem(
        'A operação não foi concluída. Verifique sua permissão e o estado atual do vínculo ou do time.',
      );
      return false;
    } finally {
      setOcupado(false);
    }
  }

  async function remover(membroId: string) {
    if (!confirmacao || !motivoRemocao.trim()) return;
    const concluiu = await executar(
      (accessToken) =>
        api.removerAtleta(timeId, membroId, accessToken, motivoRemocao.trim()),
      'Atleta removido e participações contextuais encerradas.',
    );
    if (!concluiu) return;
    setElenco((atual) => atual.filter((item) => item.membroId !== membroId));
    setConfirmacao(false);
    setMotivoRemocao('');
  }

  async function transferir(sucessorMembroId: string) {
    if (!confirmacao) return;
    const concluiu = await executar(
      (accessToken) =>
        api.transferirCapitania(timeId, sucessorMembroId, accessToken),
      'Capitania transferida. Suas capacidades foram atualizadas pelo servidor.',
    );
    if (!concluiu) return;
    setConfirmacao(false);
  }

  async function sair() {
    if (!confirmacao) return;
    const concluiu = await executar(
      (accessToken) => api.sairDoTime(timeId, accessToken),
      'Seu vínculo com o time foi encerrado.',
    );
    if (!concluiu) return;
    setConfirmacao(false);
  }

  async function alterarCiclo() {
    if (!confirmacao) return;
    if (status === 'ATIVO' && !motivoDesativacao.trim()) return;
    if (status === 'ATIVO') {
      const concluiu = await executar(
        (accessToken) =>
          api.desativarTime(timeId, accessToken, motivoDesativacao.trim()),
        'Time desativado e convites pendentes tratados pelo servidor.',
      );
      if (!concluiu) return;
      onStatusChange('DESATIVADO');
    } else {
      const concluiu = await executar(
        (accessToken) => api.reativarTime(timeId, accessToken),
        'Time reativado sem restaurar convites anteriores.',
      );
      if (!concluiu) return;
      onStatusChange('ATIVO');
    }
    setConfirmacao(false);
    setMotivoDesativacao('');
  }

  return (
    <section className="mt-6 space-y-6" aria-labelledby="operacoes-time-title">
      <CartaoFormulario>
        <div>
          <h2
            id="operacoes-time-title"
            className="font-display text-xl font-bold"
          >
            Elenco e vínculos
          </h2>
          <p className="text-sm text-muted-foreground">
            Remoções e saídas preservam o histórico e encerram participações
            contextuais ativas conforme a resposta do servidor.
          </p>
        </div>

        <CampoFormulario label="Motivo" htmlFor="motivo-remocao">
          <Input
            id="motivo-remocao"
            value={motivoRemocao}
            onChange={(event) => setMotivoRemocao(event.target.value)}
          />
        </CampoFormulario>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={confirmacao}
            onChange={(event) => setConfirmacao(event.target.checked)}
          />
          Confirmo a operação selecionada e seus efeitos no vínculo.
        </label>

        <div className="divide-y divide-border border-y border-border">
          {elenco.map((membro) => (
            <div
              key={membro.membroId}
              className="flex flex-wrap items-center justify-between gap-3 py-3"
            >
              <div>
                <p className="font-semibold">{membro.nome}</p>
                <p className="text-sm text-muted-foreground">
                  {membro.funcao} · @{membro.nomeUsuario}
                </p>
              </div>
              {membro.funcao === 'ATLETA' ? (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="campoOutline"
                    disabled={ocupado || !confirmacao}
                    onClick={() => void transferir(membro.membroId)}
                  >
                    Transferir capitania
                  </Button>
                  <Button
                    type="button"
                    variant="campoOutline"
                    disabled={ocupado || !confirmacao || !motivoRemocao.trim()}
                    onClick={() => void remover(membro.membroId)}
                  >
                    Remover atleta
                  </Button>
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="campoOutline"
          disabled={ocupado || !confirmacao}
          onClick={() => void sair()}
        >
          Sair do time
        </Button>
      </CartaoFormulario>

      <CartaoFormulario>
        <h2 className="font-display text-xl font-bold">Histórico do elenco</h2>
        {historico.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Histórico indisponível ou sem registros para esta conta.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {historico.map((item) => (
              <div key={item.membroId} className="py-3 text-sm">
                <p className="font-semibold">{item.nome}</p>
                <p>
                  {item.origem} · {item.funcaoAtual} · entrada{' '}
                  {new Date(item.entrouEm).toLocaleDateString('pt-BR')}
                </p>
                {item.saiuEm ? (
                  <p>
                    saída {new Date(item.saiuEm).toLocaleDateString('pt-BR')} ·{' '}
                    {item.motivoSaida ?? 'motivo não informado'}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </CartaoFormulario>

      <CartaoFormulario>
        <h2 className="font-display text-xl font-bold">Ciclo do time</h2>
        {status === 'ATIVO' ? (
          <CampoFormulario
            label="Motivo da desativação"
            htmlFor="motivo-desativacao"
          >
            <Input
              id="motivo-desativacao"
              value={motivoDesativacao}
              onChange={(event) => setMotivoDesativacao(event.target.value)}
            />
          </CampoFormulario>
        ) : (
          <p className="text-sm text-muted-foreground">
            A reativação preserva identidade e histórico, mas não restaura
            convites encerrados.
          </p>
        )}
        <Button
          type="button"
          variant="campoOutline"
          disabled={
            ocupado ||
            !confirmacao ||
            (status === 'ATIVO' && !motivoDesativacao.trim())
          }
          onClick={() => void alterarCiclo()}
        >
          {status === 'ATIVO' ? 'Desativar time' : 'Reativar time'}
        </Button>
      </CartaoFormulario>

      {mensagem ? (
        <p role="status" className="text-sm">
          {mensagem}
        </p>
      ) : null}
    </section>
  );
}
