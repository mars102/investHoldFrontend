export interface Asset {
    id: string
    symbol: string
    name: string
    amount: number
    avg_buy_price: number
    current_price: number
    total_value: number
    profit_loss: number
    profit_loss_percentage: number
}

export interface PortfolioStats {
    total_balance: number
    total_profit: number
    total_profit_percentage: number
    active_trades: number
    total_assets: number
}