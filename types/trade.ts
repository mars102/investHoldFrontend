export enum TradeType {
    BUY = 'buy',
    SELL = 'sell'
}

export enum TradeStatus {
    OPEN = 'open',
    CLOSED = 'closed',
    PENDING = 'pending'
}

export interface Trade {
    id: string
    user_id: string
    symbol: string
    type: TradeType
    amount: number
    price: number
    total: number
    fee: number
    notes?: string
    status: TradeStatus
    executed_at: string
    created_at: string
    updated_at: string
}

export interface CreateTradeDto {
    symbol: string
    type: TradeType
    amount: number
    price: number
    fee?: number
    notes?: string
    executed_at?: string
}