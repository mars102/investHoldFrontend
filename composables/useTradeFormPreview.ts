export interface TradeFormPreviewState {
  coinId: number | null
  type: string
  quantity: number
  pricePerUnit: number
}

/** Shared live state of whichever trade form (composer or an in-place edit)
 *  is currently open, so the coin info panel in the feed's sidebar can react
 *  to it without prop-drilling through the post list. */
export function useTradeFormPreview() {
  return useState<TradeFormPreviewState | null>('trade-form-preview', () => null)
}
