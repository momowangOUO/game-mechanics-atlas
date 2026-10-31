type Searchable = { id: string; name: string; aliases?: readonly string[] };
export function matchesCatalog(
  item: Searchable,
  query: string,
  extra = "",
): boolean {
  const normalize = (text: string) =>
    text.normalize("NFKC").trim().toLocaleLowerCase();
  return normalize(
    [item.name, item.id, ...(item.aliases ?? []), extra].join(" "),
  ).includes(normalize(query));
}
