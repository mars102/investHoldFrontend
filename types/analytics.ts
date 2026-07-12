import type { Coin } from "./coins";

export type RiskLevel = "low" | "medium" | "high" | "unknown";

export interface RiskBreakdownItem {
  coinId: number;
  ticker: string;
  value: number;
  weightPercent: number;
}

export interface RiskScore {
  hhi: number | null;
  level: RiskLevel;
  totalValue: number;
  breakdown: RiskBreakdownItem[];
}

export interface TradeTimingItem {
  transactionId: number;
  coinId: number;
  type: string;
  pricePerUnit: number;
  executedAt: string;
  score: number | null;
}

export interface TradeTimingResponse {
  average: number | null;
  trades: TradeTimingItem[];
}

export type InsightType =
  | "underwater_position"
  | "near_local_high"
  | "price_milestone"
  | "concentration_risk"
  | "best_timing_trade";

export interface Insight {
  id: number;
  userId: number;
  coinId: number;
  coin: Coin;
  type: InsightType;
  message: string;
  data: Record<string, unknown>;
  createdAt: string;
}
