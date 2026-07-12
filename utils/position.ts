import type { Trade } from "~/types/trade";
import type { Post } from "~/types/post";
import type { Coin } from "~/types/coins";
import type { Holding } from "~/types/portfolio";

export interface Position {
  coinId: number;
  coin: Coin | undefined;
  trades: Trade[];
  posts: Post[];
  holding: Holding | undefined;
  isClosed: boolean;
  lastActivityDate: string;
}

export interface GroupedFeed {
  positions: Position[];
  unassignedPosts: Post[];
}

/**
 * Groups trades (and any coin-tagged posts) into one "position" per coin —
 * a coin only becomes a position if it has at least one trade; a post tagged
 * to a coin with no trades isn't a position, it's just a note, so it falls
 * through to unassignedPosts instead.
 */
export function groupByPosition(
  trades: Trade[],
  posts: Post[],
  coinsById: Record<number, Coin>,
  holdingsByCoinId: Record<number, Holding>
): GroupedFeed {
  const coinIds = new Set<number>();
  for (const t of trades) {
    if (t.coinId != null) coinIds.add(Number(t.coinId));
  }

  const positions: Position[] = [];

  for (const coinId of coinIds) {
    const coinTrades = [...trades]
      .filter((t) => Number(t.coinId) === coinId)
      .sort((a, b) => new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime());

    if (!coinTrades.length) continue;

    const coinPosts = [...posts]
      .filter((p) => p.coinId != null && Number(p.coinId) === coinId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const holding = holdingsByCoinId[coinId];
    const isClosed = !holding || Number(holding.totalQuantity) <= 0;

    const lastActivityDate = [coinTrades[0]?.executedAt, coinPosts[0]?.createdAt]
      .filter((d): d is string => !!d)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]!;

    positions.push({
      coinId,
      coin: coinsById[coinId],
      trades: coinTrades,
      posts: coinPosts,
      holding,
      isClosed,
      lastActivityDate
    });
  }

  positions.sort((a, b) => new Date(b.lastActivityDate).getTime() - new Date(a.lastActivityDate).getTime());

  const positionCoinIds = new Set(positions.map((p) => p.coinId));
  const unassignedPosts = posts.filter((p) => p.coinId == null || !positionCoinIds.has(Number(p.coinId)));

  return { positions, unassignedPosts };
}
