/**
 * 読み取り専用フック(useXxxState)。Atom の値を返すだけ・副作用なし。
 * 読み取りだけのコンポーネントを書き込みロジックへ依存させないための層(06-state-and-hooks)。
 */
import { useAtomValue } from "jotai";

import {
  masterErrorAtom,
  masterLoadingAtom,
  masterMetaAtom,
  masterRecordsAtom,
} from "../../../store/masterStore";

export function useMasterCrudState() {
  return {
    meta: useAtomValue(masterMetaAtom),
    records: useAtomValue(masterRecordsAtom),
    loading: useAtomValue(masterLoadingAtom),
    error: useAtomValue(masterErrorAtom),
  };
}
