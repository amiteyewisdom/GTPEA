// Pages through a PostgREST query with .range() so exports aren't silently
// truncated at the server row limit (~1000/request). `build` must return a
// fresh, unexecuted query builder — .range() is applied per page.
export async function fetchAllPages<T = any>(
  build: () => { range: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: any }> },
  pageSize = 1000
): Promise<{ data: T[]; error: any }> {
  const all: T[] = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await build().range(from, from + pageSize - 1);
    if (error) return { data: all, error };
    all.push(...(data ?? []));
    if (!data || data.length < pageSize) break;
  }
  return { data: all, error: null };
}
