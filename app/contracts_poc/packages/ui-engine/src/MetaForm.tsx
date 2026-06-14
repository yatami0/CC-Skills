/**
 * メタ駆動フォーム(登録/編集)。
 *
 * meta.fields から「入力 UI の種類」と「Zod バリデーション」を導出する。
 * マスタごとのフォームコンポーネントは作らない(ADR-0003)。
 *  - string → text / date → date / number → number / code → select(codeValues)
 *  - 必須・型エラーはフィールド直下にインライン表示(クライアント Zod)
 *  - 二重送信は formState.isSubmitting で抑止(submit 中は無効化)
 */
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";
import { match } from "ts-pattern";

import { buildFormSchema } from "./buildSchema";
import type { FieldMeta, FormValues, MasterUiMeta, RecordRow } from "./types";

interface MetaFormProps {
  readonly meta: MasterUiMeta;
  /** 編集対象。null のときは新規登録モード。 */
  readonly record: RecordRow | null;
  readonly onSubmit: (values: FormValues) => void | Promise<void>;
  readonly onCancel?: () => void;
}

/** record(または空)から各フィールドの初期値を作る。型に依らず入力は文字列で持つ。 */
function toDefaultValues(meta: MasterUiMeta, record: RecordRow | null): FormValues {
  const values: FormValues = {};
  for (const f of meta.fields) {
    const raw = record?.[f.name];
    values[f.name] = raw === undefined || raw === null ? "" : String(raw);
  }
  return values;
}

function FieldControl({
  field,
  register,
  error,
}: {
  field: FieldMeta;
  register: ReturnType<typeof useForm<FormValues>>["register"];
  error?: string;
}) {
  const id = `field-${field.name}`;
  const control = match(field.type)
    .with("number", () => (
      <input id={id} type="number" step="any" {...register(field.name)} />
    ))
    .with("date", () => <input id={id} type="date" {...register(field.name)} />)
    .with("code", () => (
      <select id={id} {...register(field.name)}>
        <option value="">--</option>
        {(field.codeValues ?? []).map((v) => (
          <option key={v} value={v}>
            {v}
          </option>
        ))}
      </select>
    ))
    .with("string", () => (
      <input id={id} type="text" {...register(field.name)} />
    ))
    .exhaustive();

  return (
    <div>
      <label htmlFor={id}>
        {field.name}
        {field.required ? <span aria-hidden="true"> *</span> : null}
      </label>
      {control}
      {error ? <p role="alert">{error}</p> : null}
    </div>
  );
}

export function MetaForm({ meta, record, onSubmit, onCancel }: MetaFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(buildFormSchema(meta)) as Resolver<FormValues>,
    defaultValues: toDefaultValues(meta, record),
  });

  const submitLabel = record ? "更新" : "登録";

  return (
    <form
      aria-label={`${meta.masterId}-form`}
      onSubmit={handleSubmit((values) => onSubmit(values))}
    >
      {meta.fields.map((f) => (
        <FieldControl
          key={f.name}
          field={f}
          register={register}
          error={errors[f.name]?.message as string | undefined}
        />
      ))}
      <button type="submit" disabled={isSubmitting}>
        {submitLabel}
      </button>
      {record && onCancel ? (
        <button type="button" onClick={onCancel} disabled={isSubmitting}>
          キャンセル
        </button>
      ) : null}
    </form>
  );
}
