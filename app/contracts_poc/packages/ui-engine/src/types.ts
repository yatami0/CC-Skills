/**
 * ui-engine が解釈する「メタ定義ドメイン型」。
 *
 * これは契約(OpenAPI)から生成される `MasterMeta`(generated/) とは**意図的に別物**にしている:
 *  - ui-engine は汎用の描画ライブラリであり、特定契約の生成物に結合しない(再利用性)。
 *  - 生成物 generated/ に触れてよいのは api-client / features / test のみ
 *    (dependency-cruiser: generated-only-via-sanctioned-consumers)。ui-engine は対象外。
 *
 * よって「生成 MasterMeta → この MasterUiMeta」への写像は features 層が担う。
 * 契約の項目をリネーム/削除するとその写像コードが tsc で落ちる(V-1 の波及点)。
 */

/** メタ定義のフィールド型。契約 enum [string, number, date, code] に対応する。 */
export type FieldType = "string" | "number" | "date" | "code";

/** 1 項目のメタ定義(項目名・型・必須・コード値)。 */
export interface FieldMeta {
  /** 項目名(レコードのキー・フォームのフィールド名・一覧のカラム名を兼ねる)。 */
  readonly name: string;
  readonly type: FieldType;
  readonly required: boolean;
  /** type=code のときの選択肢。プルダウンの option になる。 */
  readonly codeValues?: readonly string[];
}

/** 1 マスタ分のメタ定義。画面はこの定義「だけ」を見て描画する(マスタ個別コードなし)。 */
export interface MasterUiMeta {
  readonly masterId: string;
  readonly fields: readonly FieldMeta[];
}

/**
 * 一覧/フォームが扱う 1 レコード。
 * メタ駆動エンジンはレコードの具体型を知り得ないため、項目名キーの汎用オブジェクトで受ける。
 * (具体型 `MasterRecord` への静的依存＝V-1 の検知点は features 層に残す)
 */
export type RecordRow = {
  readonly id: string;
  /** 楽観排他用バージョン(更新時にそのまま載せ替える)。 */
  readonly version?: number;
} & Record<string, unknown>;

/** メタ駆動フォームが submit する値。フィールド名→入力値。 */
export type FormValues = Record<string, unknown>;

/** 画面に表示する正規化済みエラー(契約 ErrorResponse から features が写像する)。 */
export interface AppError {
  readonly code: string;
  readonly message: string;
}
