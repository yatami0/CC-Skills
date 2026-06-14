/**
 * メタ定義 → Zod スキーマの導出。
 *
 * V-5 の肝の一つ: バリデーション(必須・型)を**メタ定義から機械的に組み立てる**。
 * マスタごとに手書きの schema を持たない(項目が増減しても画面コードは不変)。
 * 入力は HTML フォーム由来のため基本は文字列で届く。型は number だけ数値へ寄せる。
 */
import { match } from "ts-pattern";
import { z } from "zod";

import type { FieldMeta, MasterUiMeta } from "./types";

const requiredMsg = (name: string) => `${name} は必須です`;
const numberMsg = (name: string) => `${name} は数値で入力してください`;

/** 空文字/未入力を undefined に寄せ、数値文字列は数値へ。それ以外は素通し(z.number が弾く)。 */
const toNumberInput = (v: unknown): unknown => {
  if (v === "" || v === null || v === undefined) return undefined;
  const n = Number(v);
  return Number.isNaN(n) ? v : n;
};

function fieldSchema(f: FieldMeta): z.ZodTypeAny {
  return match(f.type)
    .with("string", "date", () => {
      const base = z.string();
      return f.required ? base.min(1, requiredMsg(f.name)) : base.optional();
    })
    .with("code", () => {
      const values = f.codeValues ?? [];
      if (values.length === 0) {
        const base = z.string();
        return f.required ? base.min(1, requiredMsg(f.name)) : base.optional();
      }
      const enumSchema = z.enum([values[0]!, ...values.slice(1)] as [
        string,
        ...string[],
      ]);
      return f.required
        ? enumSchema
        : z.union([z.literal(""), enumSchema]).optional();
    })
    .with("number", () => {
      const num = z.number({
        required_error: requiredMsg(f.name),
        invalid_type_error: numberMsg(f.name),
      });
      return z.preprocess(toNumberInput, f.required ? num : num.optional());
    })
    .exhaustive();
}

/**
 * 1 マスタのメタ定義から RHF(@hookform/resolvers)に渡す Zod オブジェクトスキーマを作る。
 * フィールド名がそのままフォームのキーになる。
 */
export function buildFormSchema(
  meta: MasterUiMeta,
): z.ZodType<Record<string, unknown>> {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const f of meta.fields) {
    shape[f.name] = fieldSchema(f);
  }
  return z.object(shape);
}
