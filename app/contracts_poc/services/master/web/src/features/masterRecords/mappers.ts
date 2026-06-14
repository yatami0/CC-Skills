/**
 * 契約の生成型(generated/) ⇄ ui-engine ドメイン型 の写像。
 *
 * features 層は generated/ に触れてよい sanctioned consumer。ここで契約型を
 * 静的に参照することで、契約の項目をリネーム/削除すると tsc が落ちる(V-1 の波及点)。
 * ui-engine と store は generated に依存させず、この層が境界の翻訳を一手に担う。
 *
 * 注(PoC 割り切り): 本 PoC のレコード契約は単一固定形(MasterRecord = name/unitPrice/
 * effectiveDate/version)。メタ定義は dept/price で異なるが、書込リクエスト
 * (Create/Update)は契約の固定項目へ写像する。型バリエーションを持つ price マスタが
 * この固定契約と一致するため、書込の往復は price で実証する(基本設計 §6.3)。
 */
import type { CreateRecordRequest } from "@poc/api-client/generated/model/createRecordRequest";
import type { ErrorResponse } from "@poc/api-client/generated/model/errorResponse";
import type { MasterMeta } from "@poc/api-client/generated/model/masterMeta";
import type { MasterRecord } from "@poc/api-client/generated/model/masterRecord";
import type { UpdateRecordRequest } from "@poc/api-client/generated/model/updateRecordRequest";
import type {
  AppError,
  FieldType,
  FormValues,
  MasterUiMeta,
  RecordRow,
} from "@poc/ui-engine";

/** 生成 MasterMeta → エンジンが解釈する MasterUiMeta。 */
export function toUiMeta(meta: MasterMeta): MasterUiMeta {
  return {
    masterId: meta.masterId,
    fields: meta.fields.map((f) => ({
      name: f.name,
      type: f.type as FieldType,
      required: f.required,
      codeValues: f.codeValues,
    })),
  };
}

/** 生成 MasterRecord → 一覧/フォームが扱う汎用 RecordRow。 */
export function toRow(rec: MasterRecord): RecordRow {
  const row: RecordRow = { id: rec.id, version: rec.version };
  return Object.assign(row, rec);
}

/** フォーム値 → 契約 CreateRecordRequest(契約の固定項目を静的参照=V-1)。 */
export function toCreateRequest(values: FormValues): CreateRecordRequest {
  return {
    name: String(values.name ?? ""),
    unitPrice: Number(values.unitPrice ?? 0),
    effectiveDate: String(values.effectiveDate ?? ""),
  };
}

/** フォーム値＋現レコード → 契約 UpdateRecordRequest(楽観排他 version を載せ替え)。 */
export function toUpdateRequest(
  values: FormValues,
  record: RecordRow,
): UpdateRecordRequest {
  return {
    name: String(values.name ?? ""),
    unitPrice: Number(values.unitPrice ?? 0),
    effectiveDate: String(values.effectiveDate ?? ""),
    version: record.version ?? 0,
  };
}

/** 契約 ErrorResponse → 表示用 AppError。 */
export function toAppError(res: ErrorResponse): AppError {
  return { code: res.errorCode, message: res.message };
}
