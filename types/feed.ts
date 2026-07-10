import type { Trade } from "./trade";
import type { Post } from "./post";

export type FeedItemType = "post" | "trade";

export interface FeedItem {
  type: FeedItemType;
  date: string;
  item: Post | Trade;
}

export interface FeedResponse {
  total: number;
  limit: number;
  offset: number;
  items: FeedItem[];
}

export type FeedFilterType = "all" | "trades" | "posts";
