export type QueryKeyPrimitive = string | number | boolean;
export function normalizeQueryParams<T extends object | undefined>(
  params: T,
): Record<string, QueryKeyPrimitive> | undefined {
  if (!params) {
    return undefined;
  }

  const entries = Object.entries(
    params as Record<string, QueryKeyPrimitive | null | undefined>,
  )
    .filter(
      (entry): entry is [string, QueryKeyPrimitive] =>
        entry[1] !== undefined && entry[1] !== null && entry[1] !== '',
    )
    .sort((a, b) => a[0].localeCompare(b[0]));

  if (entries.length === 0) {
    return undefined;
  }

  return Object.fromEntries(entries);
}
