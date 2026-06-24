// @repo/lib/i18n — 横断 i18n 骨格（設計 §2.2）。
// 基盤時点は最小。文言ハードコード禁止（§3.7）の受け皿として、
// 実際の i18n ライブラリ（i18next 等）導入時にここへ集約する。

export type Locale = 'ja' | 'en';

export const DEFAULT_LOCALE: Locale = 'ja';

/**
 * メッセージキー解決のプレースホルダ。
 * 実装は i18n ライブラリ導入時に差し替える。現状はキーをそのまま返す。
 */
export function t(key: string): string {
  return key;
}
