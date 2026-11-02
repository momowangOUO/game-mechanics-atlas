type Searchable = { id: string; name: string; aliases?: readonly string[] };
export const normalizeSearch = (text: string) =>
  text
    .normalize("NFKC")
    .toLocaleLowerCase()
    .replace(/[-_–—/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
export function matchesCatalog(
  item: Searchable,
  query: string,
  extra = "",
): boolean {
  const text = normalizeSearch(
    [item.name, item.id, ...(item.aliases ?? []), extra].join(" "),
  );
  return normalizeSearch(query)
    .split(" ")
    .every((word) => text.includes(word));
}
