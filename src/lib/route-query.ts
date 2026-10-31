type Query = Pick<URLSearchParams, "getAll" | "toString">;

// Server searchParams treated repeated keys as arrays, never as a scalar.
export function singleQueryValue(query: Query, name: string) {
  const values = query.getAll(name);
  return values.length === 1 ? values[0] : undefined;
}

export function normalizedQueryKey(query: Pick<URLSearchParams, "toString">) {
  const normalized = new URLSearchParams(query.toString());
  normalized.sort();
  return normalized.toString();
}
