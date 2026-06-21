import { createContext, useContext } from "react";
import type { SourceGroup } from "../components/types";

/**
 * 資料（work）全体で共有する派生データ。
 * 全 part を集約した sourceGroups を、末尾の出典一覧 part などへ配る
 * （DOM 走査ではなくデータ経由で渡す）。
 */
type WorkContextValue = { sourceGroups: SourceGroup[] };

const WorkContext = createContext<WorkContextValue>({ sourceGroups: [] });

export const WorkProvider = WorkContext.Provider;
export const useWorkContext = () => useContext(WorkContext);
