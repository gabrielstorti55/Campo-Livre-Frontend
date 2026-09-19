'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { CabecalhoPagina } from '@/components/layout/cabecalho-pagina';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useSessao } from '@/hooks/use-sessao';

export function TelaDesativarConta() {
  const router = useRouter();
  const { desativarConta } = useSessao();
  const [ciente, setCiente] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState('');

  async function confirmar() {
    if (!ciente || processando) return;
    setProcessando(true);
    setErro('');
    try {
      const resposta = await desativarConta();
      const query = new URLSearchParams({
        eliminacaoPrevistaEm: resposta.eliminacaoPrevistaEm,
        prazoDias: String(resposta.prazoDias),
      });
      router.replace(`/conta-desativada?${query.toString()}`);
    } catch {
      setErro(
        'Não foi possível desativar a conta. Sua sessão permanece ativa e você pode tentar novamente.',
      );
      setConfirmando(false);
      setProcessando(false);
    }
  }

  return (
    <>
      <CabecalhoPagina
        title="Desativar minha conta"
        subtitle="Revise os efeitos antes de confirmar"
      />
      <section className="max-w-2xl border-t-2 border-danger bg-card p-5 sm:p-6">
        <ul className="list-disc space-y-3 pl-5 text-sm leading-6 text-muted-foreground">
          <li>A conta será inativada imediatamente.</li>
          <li>Todas as sessões serão encerradas.</li>
          <li>
            A eliminação ou anonimização está prevista para ocorrer após 90
            dias.
          </li>
          <li>
            Dados sujeitos à conservação legal excepcional podem permanecer
            restritos ou anonimizados.
          </li>
          <li>
            Depois da eliminação, referências públicas passam a mostrar “Usuário
            não encontrado”.
          </li>
          <li>
            É possível solicitar reativação durante o prazo, desde que a
            eliminação ainda não tenha começado. Depois de executada, ela é
            irreversível.
          </li>
        </ul>

        <label className="mt-6 flex items-start gap-3 text-sm font-semibold">
          <input
            type="checkbox"
            checked={ciente}
            onChange={(event) => setCiente(event.target.checked)}
          />
          Li e compreendi os efeitos da desativação e o prazo de eliminação.
        </label>

        {erro ? (
          <p role="alert" className="mt-4 text-sm text-danger">
            {erro}
          </p>
        ) : null}

        <Button
          className="mt-6"
          variant="campoOutline"
          disabled={!ciente || processando}
          onClick={() => setConfirmando(true)}
        >
          Desativar minha conta
        </Button>
      </section>

      <Dialog open={confirmando} onOpenChange={setConfirmando}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar desativação</DialogTitle>
            <DialogDescription>
              Esta ação inativa a conta e revoga todas as sessões imediatamente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="campoOutline"
              disabled={processando}
              onClick={() => setConfirmando(false)}
            >
              Voltar
            </Button>
            <Button
              variant="campo"
              disabled={processando}
              onClick={() => void confirmar()}
            >
              {processando ? 'Desativando...' : 'Confirmar desativação'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
