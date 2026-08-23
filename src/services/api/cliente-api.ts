import {
  ErroApi,
  normalizarProblemDetails,
} from '@/services/api/problem-details';

type RequestOptions = {
  method?: string;
  body?: unknown;
  accessToken?: string;
  credentials?: RequestCredentials;
  signal?: AbortSignal;
  headers?: Record<string, string>;
};

function joinUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

async function readBody(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('json')) return undefined;

  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

export class ClienteApi {
  constructor(private readonly baseUrl: string) {}

  async request<T = unknown>(
    path: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const hasBody = options.body !== undefined;
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      ...(options.accessToken
        ? { Authorization: `Bearer ${options.accessToken}` }
        : {}),
      ...options.headers,
    };

    const response = await fetch(joinUrl(this.baseUrl, path), {
      method: options.method ?? 'GET',
      headers,
      ...(hasBody ? { body: JSON.stringify(options.body) } : {}),
      ...(options.credentials ? { credentials: options.credentials } : {}),
      ...(options.signal ? { signal: options.signal } : {}),
    });

    const body = await readBody(response);
    if (!response.ok) {
      throw new ErroApi(normalizarProblemDetails(body, response.status));
    }

    return body as T;
  }
}

export function obterUrlApi(): string {
  return process.env['NEXT_PUBLIC_API_URL'] ?? '/api/v1';
}
