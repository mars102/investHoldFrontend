import type { Coin } from "./coins";

export interface Holding {
  id: number;
  userId: number;
  coinId: number;
  totalQuantity: string;
  averageBuyPrice: string;
  totalInvested: string;
  currentValue: number;
  profitLossAbsolute: number;
  profitLossPercentage: number;
  updatedAt: string;
  createdAt: string;
  coin: Coin;
}

export interface PortfolioSummary {
  totalInvested: number;
  totalCurrentValue: number;
  totalProfitLoss: number;
  totalProfitLossPercentage: number;
  holdingsCount: number;
  holdings: Holding[];
}
