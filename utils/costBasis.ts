import type { Trade } from '~/types/trade'

export interface TradeCostBasis {
  avgCostBasisBefore: number
  positionQtyBefore: number
  positionQtyAfter: number
  realizedPnl: number | null
  realizedPnlPercent: number | null
  percentOfPositionSold: number | null
}

/**
 * Replays a user's trades in chronological order (per coin) using the average-cost
 * method, so a SELL's P&L is measured against the cost basis accumulated up to
 * that point (DCA-style investing), not against today's market price.
 */
export function computeCostBasisTimeline(trades: Trade[]): Map<string, TradeCostBasis> {
  const byCoin = new Map<number, Trade[]>()
  for (const trade of trades) {
    if (trade.coinId == null) continue
    // Coerce to a number: the API isn't guaranteed to return coinId with a
    // consistent type, and a Map uses strict equality for keys — 2 and "2"
    // would otherwise land in different groups and corrupt the replay.
    const coinId = Number(trade.coinId)
    const list = byCoin.get(coinId) ?? []
    list.push(trade)
    byCoin.set(coinId, list)
  }

  const result = new Map<string, TradeCostBasis>()

  for (const coinTrades of byCoin.values()) {
    const sorted = [...coinTrades].sort(
      (a, b) => new Date(a.executedAt).getTime() - new Date(b.executedAt).getTime()
    )

    let qty = 0
    let costBasis = 0

    for (const trade of sorted) {
      const isBuy = trade.type?.toString().toLowerCase() === 'buy'
      const tradeQty = Number(trade.quantity) || 0
      const tradePrice = Number(trade.pricePerUnit) || 0
      const avgBefore = qty > 0 ? costBasis / qty : 0
      const qtyBefore = qty

      if (isBuy) {
        qty += tradeQty
        costBasis += tradeQty * tradePrice

        result.set(trade.id, {
          avgCostBasisBefore: avgBefore,
          positionQtyBefore: qtyBefore,
          positionQtyAfter: qty,
          realizedPnl: null,
          realizedPnlPercent: null,
          percentOfPositionSold: null
        })
      } else {
        const soldQty = Math.min(tradeQty, qty)
        const realizedPnl = avgBefore > 0 ? (tradePrice - avgBefore) * soldQty : null
        const realizedPnlPercent = avgBefore > 0 ? ((tradePrice - avgBefore) / avgBefore) * 100 : null
        const percentOfPositionSold = qtyBefore > 0 ? (soldQty / qtyBefore) * 100 : null

        costBasis -= avgBefore * soldQty
        qty -= soldQty
        if (qty <= 0) {
          qty = 0
          costBasis = 0
        }

        result.set(trade.id, {
          avgCostBasisBefore: avgBefore,
          positionQtyBefore: qtyBefore,
          positionQtyAfter: qty,
          realizedPnl,
          realizedPnlPercent,
          percentOfPositionSold
        })
      }
    }
  }

  return result
}
