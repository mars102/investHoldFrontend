import type { Trade } from "~/types/trade";
import type { Post } from "~/types/post";
import type { Coin } from "~/types/coins";
import type { FeedItem, FeedFilterType } from "~/types/feed";

function matches(query: string, ...values: (string | null | undefined)[]): boolean {
  return values.some((v) => !!v && v.toLowerCase().includes(query));
}

/**
 * Client-side search over the user's full trade/post history — the /feed
 * endpoint is paginated and has no search param, but tradeStore.trades and
 * postStore.posts are always fetched in full (needed for cost-basis/grouping),
 * so searching those directly covers everything, not just the loaded page.
 */
export function searchFeed(
  trades: Trade[],
  posts: Post[],
  coinsById: Record<number, Coin>,
  query: string,
  type: FeedFilterType,
  coinId: number | null
): FeedItem[] {
  const q = query.trim().toLowerCase();
  const items: FeedItem[] = [];

  if (type !== "posts") {
    for (const trade of trades) {
      if (coinId != null && Number(trade.coinId) !== coinId) continue;
      const coin = trade.coinId != null ? coinsById[Number(trade.coinId)] : undefined;
      if (q && !matches(q, trade.description, trade.exchangeSource, coin?.ticker, coin?.fullName)) continue;
      items.push({ type: "trade", date: trade.executedAt, item: trade });
    }
  }

  if (type !== "trades") {
    for (const post of posts) {
      if (coinId != null && Number(post.coinId) !== coinId) continue;
      const coin = post.coinId != null ? coinsById[Number(post.coinId)] : undefined;
      if (q && !matches(q, post.title, post.content, coin?.ticker, coin?.fullName)) continue;
      items.push({ type: "post", date: post.createdAt, item: post });
    }
  }

  return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
