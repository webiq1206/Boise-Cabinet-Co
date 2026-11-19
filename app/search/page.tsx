import type { FinishCategory } from "@/shared/catalog";
import { SearchClient } from "./SearchClient";

const FINISH_CATEGORIES: readonly FinishCategory[] = ["matte", "gloss", "woodgrain"];

/** /search, /search?q=Snow+White&finish=matte, /search?finish=woodgrain */
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";
  const finish = one(params.finish).toLowerCase();
  return (
    <SearchClient
      initialQuery={one(params.q).slice(0, 80)}
      initialFinish={(FINISH_CATEGORIES as readonly string[]).includes(finish) ? (finish as FinishCategory) : ""}
    />
  );
}
