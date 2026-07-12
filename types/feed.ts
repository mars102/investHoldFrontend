import type { Trade } from "./trade";
import type { Post } from "./post";
import type { Insight } from "./analytics";

export type FeedItemType = "post" | "trade" | "insight";

export interface FeedItem {
  type: FeedItemType;
  date: string;
  item: Post | Trade | Insight;
}

export interface FeedResponse {
  total: number;
  limit: number;
  offset: number;
  items: FeedItem[];
}

export type FeedFilterType = "all" | "trades" | "posts" | "insights";
