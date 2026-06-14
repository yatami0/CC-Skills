/**
 * @poc/ui-engine — メタ定義駆動 CRUD レンダラ(V-5)の公開 API。
 * 消費側(services/master/web)はこのエンジンに meta とデータ/コールバックを渡すだけで、
 * マスタ個別の画面コードなしに CRUD 画面を得る。
 */
export { MasterCrudView } from "./MasterCrudView";
export { MasterList } from "./MasterList";
export { MetaForm } from "./MetaForm";
export { buildFormSchema } from "./buildSchema";
export type {
  AppError,
  FieldMeta,
  FieldType,
  FormValues,
  MasterUiMeta,
  RecordRow,
} from "./types";
