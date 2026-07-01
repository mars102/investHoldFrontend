export interface Coin {
  id: number;
  ticker: string;
  fullName: string;
  description: string;
  currentPrice: number;
  currency: string;
  externalId: string;
  logoUrl: string;
  website: string;
  blockchain: string;
  contractAddress: string;
  category: string;
  marketCap: number;
  volume24h: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
  rank: number;
  isActive: boolean;
  isTradable: boolean;
  createdAt: string;
  updatedAt: string;
  priceUpdatedAt: string;
}
