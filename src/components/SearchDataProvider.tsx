"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { searchSeed, type SearchQueryStat } from "@/lib/heat";

type SearchDataset = { stats: SearchQueryStat[]; isImported: boolean };
type SearchDataState = SearchDataset & {
  replaceRecords: (stats: SearchQueryStat[]) => void;
  resetRecords: () => void;
};
const SearchDataContext = createContext<SearchDataState | null>(null);

export function SearchDataProvider({ children }: { children: ReactNode }) {
  // Each mounted browser session owns its records; no storage or server mutation.
  const [dataset, setDataset] = useState<SearchDataset>(() => ({
    stats: searchSeed,
    isImported: false,
  }));
  const value = useMemo(
    () => ({
      ...dataset,
      replaceRecords: (stats: SearchQueryStat[]) =>
        setDataset({ stats, isImported: true }),
      resetRecords: () => setDataset({ stats: searchSeed, isImported: false }),
    }),
    [dataset],
  );
  return (
    <SearchDataContext.Provider value={value}>
      {children}
    </SearchDataContext.Provider>
  );
}

export function useSearchData() {
  const context = useContext(SearchDataContext);
  if (!context) throw new Error("Search data provider missing");
  return context;
}
