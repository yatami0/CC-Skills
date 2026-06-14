/**
 * グローバル状態(Jotai Atom)。store/ に集約する(ページ配下に置かない)。
 *
 * 状態の型は ui-engine のドメイン型(MasterUiMeta / RecordRow / AppError)で持つ。
 * 契約の生成物 generated/ には触れない(store は generated の sanctioned consumer ではない)。
 * 生成 MasterMeta → MasterUiMeta などの写像は features 層(mappers)が担う。
 */
import { atom } from "jotai";

import type { AppError, MasterUiMeta, RecordRow } from "@poc/ui-engine";

/** メタ定義(未取得は null)。画面はこの値だけを見て描画する。 */
export const masterMetaAtom = atom<MasterUiMeta | null>(null);

/** 一覧レコード。 */
export const masterRecordsAtom = atom<RecordRow[]>([]);

/** ローディング(withAppLoading 相当の最小版)。 */
export const masterLoadingAtom = atom<boolean>(false);

/** 正規化済みエラー(契約 ErrorResponse → AppError)。null=正常。 */
export const masterErrorAtom = atom<AppError | null>(null);
