// @repo/lib/error — 横断エラー骨格（設計 §2.2）。
// アプリ固有の ApiError（apps/master/src/lib/error）はこの AppError を土台にできる。

/** アプリ横断のエラー基底。ユーザー提示メッセージ（i18n キー）と原因を分離する。 */
export class AppError extends Error {
  /** i18n メッセージキー（文言ハードコード禁止 §3.7）。 */
  readonly messageKey: string;
  override readonly cause?: unknown;

  constructor(messageKey: string, options?: { message?: string; cause?: unknown }) {
    super(options?.message ?? messageKey);
    this.name = 'AppError';
    this.messageKey = messageKey;
    this.cause = options?.cause;
  }
}

export function isAppError(value: unknown): value is AppError {
  return value instanceof AppError;
}
