
export type TradeType = 'BUY'|'SELL'
export type TradeStatus = 'OPEN'|'CLOSED'|'PENDING'

export interface Trade {
    id: string
    userId: string
    coinId: number
    type: TradeType
    quantity: number
    pricePerUnit: number // цена одной монеты
    totalAmount: number // quantity*pricePerUnit
    fee: number, //коммисия
    feeCurrency: string
    status: TradeStatus,
    exchangeSource: string // написать биржу для групировки
    description: string // Коментарий к сделке
    executedAt: string
    createdAt: string
    updatedAt: string
}

export type createTrade =  Omit<Trade,'updatedAt'|'createdAt'|'totalAmount'|'id'|'userId'|'status'>

