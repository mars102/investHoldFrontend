const STORAGE_KEY = "investhold:watchlist";

function readStored(): number[] {
  if (import.meta.server) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
}

export function useWatchlist() {
  const coinIds = useState<number[]>("watchlist", readStored);

  watch(
    coinIds,
    (value) => {
      if (import.meta.client) localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    },
    { deep: true }
  );

  function isWatched(coinId: number): boolean {
    return coinIds.value.includes(coinId);
  }

  function add(coinId: number) {
    if (!isWatched(coinId)) coinIds.value = [...coinIds.value, coinId];
  }

  function remove(coinId: number) {
    coinIds.value = coinIds.value.filter((id) => id !== coinId);
  }

  function toggle(coinId: number) {
    isWatched(coinId) ? remove(coinId) : add(coinId);
  }

  return { coinIds, isWatched, add, remove, toggle };
}
