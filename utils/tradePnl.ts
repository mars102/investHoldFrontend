import type { Trade } from '~/types/trade'
import type { Coin } from '~/types/coins'
import type { TradeCostBasis } from '~/utils/costBasis'

/**
 * Approximate P&L for a trade, for filtering/sorting purposes. Uses the coin's
 * last known live price rather than fetching per-trade history — good enough
 * to bucket trades as profit/loss, not meant to match a post's own chart to
 * the last cent (that one uses the actual fetched price history).
 */
export function computeTradePnlPercent(trade: Trade, coin: Coin | undefined, costBasis: TradeCostBasis | undefined): number {
  const isBuy = trade.type?.toString().toLowerCase() === 'buy'
  const tradePrice = Number(trade.pricePerUnit) || 0

  if (!isBuy && costBasis?.realizedPnlPercent != null) {
    return costBasis.realizedPnlPercent
  }

  const entryPrice = isBuy ? tradePrice : costBasis?.avgCostBasisBefore || tradePrice
  const latestPrice = Number(coin?.currentPrice) || tradePrice
  if (!entryPrice) return 0

  const diff = latestPrice - entryPrice
  const directional = isBuy ? diff : -diff
  return (directional / entryPrice) * 100
}
