import type { ErroDeCampo, ProblemDetails } from '@/types/api/autenticacao';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readString(
  source: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = source[key];
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function readStatus(
  source: Record<string, unknown>,
  fallbackStatus: number,
): number {
  const status = source['status'];
  return typeof status === 'number' && Number.isInteger(status)
    ? status
    : fallbackStatus;
}

function readFieldErrors(value: unknown): ErroDeCampo[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const errors = value.flatMap((item) => {
    if (!isRecord(item)) return [];
    const campo = readString(item, 'campo');
    const mensagem = readString(item, 'mensagem');
    return campo && mensagem ? [{ campo, mensagem }] : [];
  });

  return errors.length > 0 ? errors : undefined;
}

export function normalizarProblemDetails(
  body: unknown,
  fallbackStatus = 500,
): ProblemDetails {
  if (!isRecord(body)) {
    return {
      type: 'about:blank',
      title: 'Não foi possível concluir a solicitação',
      status: fallbackStatus,
      codigo: 'RESPOSTA_INVALIDA',
    };
  }

  const detail = readString(body, 'detail');
  const instance = readString(body, 'instance');
  const erros = readFieldErrors(body['erros']);

  return {
    type: readString(body, 'type') ?? 'about:blank',
    title:
      readString(body, 'title') ?? 'Não foi possível concluir a solicitação',
    status: readStatus(body, fallbackStatus),
    codigo: readString(body, 'codigo') ?? 'ERRO_NAO_IDENTIFICADO',
    ...(detail ? { detail } : {}),
    ...(instance ? { instance } : {}),
    ...(erros ? { erros } : {}),
  };
}

export class ErroApi extends Error {
  readonly problem: ProblemDetails;

  constructor(problem: ProblemDetails) {
    super(problem.detail ?? problem.title);
    this.name = 'ErroApi';
    this.problem = problem;
  }
}
