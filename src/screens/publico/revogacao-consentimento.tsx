'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useConsentimentosApi } from '@/contexts/consentimentos-api';
import { LayoutAutenticacao } from '@/layouts/autenticacao';
import { ErroApi } from '@/services/api/problem-details';
import type {
  ConsultaRevogacao,
  RespostaRevogacao,
} from '@/types/api/consentimentos';

type Estado =
  | { tipo: 'carregando' }
  | { tipo: 'erro'; mensagem: string }
  | { tipo: 'consulta'; dados: ConsultaRevogacao }
  | { tipo: 'concluido'; dados: RespostaRevogacao };

function mensagemErro(error: unknown): string {
  if (error instanceof ErroApi) {
    if (error.problem.codigo === 'REVOGACAO_NAO_DISPONIVEL')
      return 'Este link de revogação não está disponível.';
    if (error.problem.codigo === 'CREDENCIAIS_REVOGACAO_INVALIDAS')
      return 'Link ou senha de revogação inválidos.';
    if (error.problem.codigo === 'LIMITE_EXCEDIDO')
      return 'Muitas tentativas. Aguarde antes de tentar novamente.';
  }
  return 'Não foi possível concluir a revogação.';
}

export function TelaRevogacaoConsentimento() {
  const api = useConsentimentosApi();
  const token = useRef('');
  const iniciou = useRef(false);
  const [estado, setEstado] = useState<Estado>({ tipo: 'carregando' });
  const [confirmado, setConfirmado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (iniciou.current) return;
    iniciou.current = true;
    token.current =
      new URLSearchParams(window.location.search).get('token')?.trim() ?? '';
    window.history.replaceState({}, '', window.location.pathname);
    if (!token.current) {
      queueMicrotask(() =>
        setEstado({
          tipo: 'erro',
          mensagem: 'O link de revogação é inválido.',
        }),
      );
      return;
    }
    void api.consultarRevogacao(token.current).then(
      (dados) => setEstado({ tipo: 'consulta', dados }),
      (error) => setEstado({ tipo: 'erro', mensagem: mensagemErro(error) }),
    );
  }, [api]);

  async function revogar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!confirmado || enviando) return;
    const senha = String(
      new FormData(event.currentTarget).get('senhaRevogacao') ?? '',
    );
    setEnviando(true);
    setErro('');
    try {
      setEstado({
        tipo: 'concluido',
        dados: await api.revogar(token.current, senha),
      });
    } catch (error) {
      setErro(mensagemErro(error));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <LayoutAutenticacao>
      <p className="text-xs font-semibold tracking-[0.14em] text-destructive uppercase">
        Revogação parental
      </p>
      {estado.tipo === 'carregando' ? (
        <p role="status" className="mt-3">
          Consultando o consentimento…
        </p>
      ) : null}
      {estado.tipo === 'erro' ? (
        <>
          <h1 className="mt-3 font-display text-3xl font-semibold">
            Revogação indisponível
          </h1>
          <p role="alert" className="mt-3 text-sm text-destructive">
            {estado.mensagem}
          </p>
        </>
      ) : null}
      {estado.tipo === 'consulta' ? (
        <div>
          <h1 className="mt-3 font-display text-3xl font-semibold">
            Revogar consentimento
          </h1>
          <p className="mt-3 text-sm">
            Conta de {estado.dados.nomeUsuarioMenor}, {estado.dados.idade} anos.
          </p>
          {estado.dados.statusConsentimento === 'REVOGADO' ? (
            <p className="mt-5 text-sm font-semibold">
              Este consentimento já foi revogado.
            </p>
          ) : (
            <>
              <ul className="mt-5 list-disc space-y-2 pl-5 text-sm">
                {estado.dados.efeitos.contaInativadaImediatamente ? (
                  <li>A conta será inativada imediatamente.</li>
                ) : null}
                <li>
                  Os dados elimináveis serão excluídos em{' '}
                  {estado.dados.efeitos.prazoEliminacaoDias} dias.
                </li>
                {estado.dados.efeitos.fatosEsportivosDefinitivosPermanecem ? (
                  <li>Os fatos esportivos definitivos permanecerão.</li>
                ) : null}
              </ul>
              <form onSubmit={revogar} className="mt-6 space-y-4">
                <label className="block text-sm font-medium">
                  Senha de revogação
                  <Input
                    className="mt-1"
                    name="senhaRevogacao"
                    type="password"
                    required
                    autoComplete="current-password"
                  />
                </label>
                <label className="flex gap-3 text-sm leading-5">
                  <input
                    type="checkbox"
                    checked={confirmado}
                    onChange={(event) => setConfirmado(event.target.checked)}
                  />{' '}
                  Confirmo que desejo revogar o consentimento e inativar a conta
                  do menor.
                </label>
                {erro ? (
                  <p role="alert" className="text-sm text-destructive">
                    {erro}
                  </p>
                ) : null}
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={!confirmado || enviando}
                >
                  {enviando ? 'Revogando…' : 'Revogar consentimento'}
                </Button>
              </form>
            </>
          )}
        </div>
      ) : null}
      {estado.tipo === 'concluido' ? (
        <div aria-live="polite">
          <h1 className="mt-3 font-display text-3xl font-semibold">
            Consentimento revogado
          </h1>
          <p className="mt-3 text-sm">
            A conta do menor foi inativada. Eliminação agendada para{' '}
            {new Date(estado.dados.eliminacaoAgendadaPara).toLocaleDateString(
              'pt-BR',
            )}
            .
          </p>
        </div>
      ) : null}
    </LayoutAutenticacao>
  );
}
