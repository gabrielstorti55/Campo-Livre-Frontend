'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useConsentimentosApi } from '@/contexts/consentimentos-api';
import { LayoutAutenticacao } from '@/layouts/autenticacao';
import { ErroApi } from '@/services/api/problem-details';
import type { EstadoConsentimentoParental } from '@/types/api/consentimentos';

type Estado =
  | { tipo: 'carregando' }
  | { tipo: 'erro'; mensagem: string }
  | { tipo: 'pronto'; dados: EstadoConsentimentoParental };

function mensagemErro(error: unknown): string {
  if (error instanceof ErroApi) {
    if (error.problem.codigo === 'LINK_PARENTAL_EXPIRADO')
      return 'Este link parental expirou.';
    if (error.problem.codigo === 'LINK_PARENTAL_NAO_DISPONIVEL')
      return 'Este link parental não está disponível.';
    if (error.problem.codigo === 'ARQUIVO_MUITO_GRANDE')
      return 'O documento excede o limite de 10 MB.';
    if (error.problem.codigo === 'DOCUMENTO_INADEQUADO')
      return 'O documento não pôde ser aceito. Envie uma nova imagem legível.';
    if (error.problem.codigo === 'TENTATIVA_ATIVA')
      return 'Já existe um documento em processamento.';
  }
  return 'Não foi possível concluir a solicitação.';
}

const titulos = {
  ENVIAR_DOCUMENTO: 'Envie o documento do responsável',
  AGUARDAR_REVISAO: 'Documento em análise',
  TENTAR_NOVAMENTE: 'Envie uma nova foto',
  CONCLUIDO: 'Análise concluída',
} as const;

export function TelaParental() {
  const api = useConsentimentosApi();
  const token = useRef('');
  const iniciou = useRef(false);
  const documentoSelecionado = useRef<File | null>(null);
  const [estado, setEstado] = useState<Estado>({ tipo: 'carregando' });
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    if (iniciou.current) return;
    iniciou.current = true;
    const params = new URLSearchParams(window.location.search);
    token.current = params.get('token')?.trim() ?? '';
    window.history.replaceState({}, '', window.location.pathname);
    if (!token.current) {
      queueMicrotask(() =>
        setEstado({ tipo: 'erro', mensagem: 'O link parental é inválido.' }),
      );
      return;
    }
    void api.consultarParental(token.current).then(
      (dados) => setEstado({ tipo: 'pronto', dados }),
      (error) => setEstado({ tipo: 'erro', mensagem: mensagemErro(error) }),
    );
  }, [api]);

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const documento = documentoSelecionado.current;
    if (!documento || documento.size === 0)
      return setMensagem('Selecione um documento.');
    if (documento.size > 10 * 1024 * 1024)
      return setMensagem('O documento excede o limite de 10 MB.');
    setEnviando(true);
    setMensagem('');
    try {
      await api.enviarDocumento(token.current, documento);
      setMensagem(
        'Documento recebido para análise. Consulte este link novamente para acompanhar.',
      );
      setEstado((atual) =>
        atual.tipo === 'pronto'
          ? {
              tipo: 'pronto',
              dados: {
                ...atual.dados,
                proximaAcao: 'AGUARDAR_REVISAO',
                uploadPermitido: false,
                statusConsentimento: 'EM_ANALISE',
                statusTentativa: 'RECEBIDA',
              },
            }
          : atual,
      );
    } catch (error) {
      setMensagem(mensagemErro(error));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <LayoutAutenticacao>
      {estado.tipo === 'carregando' ? (
        <p role="status">Consultando o consentimento…</p>
      ) : null}
      {estado.tipo === 'erro' ? (
        <>
          <h1 className="font-display text-3xl font-semibold">
            Link indisponível
          </h1>
          <p role="alert" className="mt-3 text-sm text-destructive">
            {estado.mensagem}
          </p>
        </>
      ) : null}
      {estado.tipo === 'pronto' ? (
        <div>
          <p className="text-xs font-semibold tracking-[0.14em] text-green-dark uppercase">
            Consentimento parental
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold">
            {titulos[estado.dados.proximaAcao]}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Status: {estado.dados.statusConsentimento}. Link válido até{' '}
            {new Date(estado.dados.expiraEm).toLocaleString('pt-BR')}.
          </p>
          {estado.dados.decisao ? (
            <p className="mt-2 text-sm">Decisão: {estado.dados.decisao}.</p>
          ) : null}
          {estado.dados.uploadPermitido ? (
            <form onSubmit={enviar} className="mt-6 space-y-4">
              <label className="block text-sm font-medium">
                Documento do responsável
                <Input
                  className="mt-1"
                  name="documento"
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  onChange={(event) => {
                    documentoSelecionado.current =
                      event.currentTarget.files?.[0] ?? null;
                  }}
                />
              </label>
              <p className="text-xs text-muted-foreground">
                Máximo de 10 MB. O envio não significa aprovação automática.
              </p>
              <Button type="submit" disabled={enviando}>
                {enviando ? 'Enviando…' : 'Enviar documento'}
              </Button>
            </form>
          ) : null}
          {mensagem ? (
            <p role="status" className="mt-4 text-sm">
              {mensagem}
            </p>
          ) : null}
        </div>
      ) : null}
    </LayoutAutenticacao>
  );
}
