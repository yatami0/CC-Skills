import { AppError } from '@repo/lib/error';

// API エラー骨格（設計 §3.4）。mutator が非 2xx をここへ変換して throw し、
// TanStack Query が捕捉する（§3.5）。

/** backend / BFF から返るエラー本文の最小形（実スキーマ確定時に拡張）。 */
export interface ErrorResponse {
  message?: string;
  code?: string;
  [key: string]: unknown;
}

export class ApiError extends AppError {
  readonly status: number;
  readonly body: ErrorResponse | null;

  constructor(status: number, body: ErrorResponse | null) {
    super(`error.api.status.${status}`, {
      message: body?.message ?? `API request failed with status ${status}`,
    });
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }

  /** 非 2xx レスポンスを ApiError へ変換する。本文 JSON 解釈に失敗しても落とさない。 */
  static async fromResponse(response: Response): Promise<ApiError> {
    let body: ErrorResponse | null = null;
    try {
      const text = await response.text();
      body = text ? (JSON.parse(text) as ErrorResponse) : null;
    } catch {
      body = null;
    }
    return new ApiError(response.status, body);
  }
}

export function isApiError(value: unknown): value is ApiError {
  return value instanceof ApiError;
}
