/**
 * API Response Type Definitions
 * for KD Bitcoin Real Estate Calculator
 */

// CoinGecko API Types
export interface CoinGeckoSimplePrice {
  bitcoin: {
    usd: number;
    usd_market_cap?: number;
    usd_24h_vol?: number;
    usd_24h_change?: number;
    last_updated_at?: number;
  };
}

export interface CoinGeckoHistoricalPrice {
  id: string;
  symbol: string;
  name: string;
  prices: [number, number][]; // [timestamp, price]
  market_caps: [number, number][]; // [timestamp, market_cap]
  total_volumes: [number, number][]; // [timestamp, volume]
}

export interface CoinGeckoMarketData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d: number;
  price_change_percentage_30d: number;
  price_change_percentage_1y: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  last_updated: string;
}

// Bitcoin Price Service Types
export interface BitcoinPriceData {
  /** Current Bitcoin price in USD */
  currentPrice: number;
  /** Price change in last 24 hours */
  priceChange24h: number;
  /** Price change percentage in last 24 hours */
  priceChangePercent24h: number;
  /** Price change in last 7 days */
  priceChange7d: number;
  /** Price change percentage in last 7 days */
  priceChangePercent7d: number;
  /** Market cap */
  marketCap: number;
  /** Trading volume (24h) */
  volume24h: number;
  /** All-time high */
  allTimeHigh: number;
  /** All-time low */
  allTimeLow: number;
  /** Last updated timestamp */
  lastUpdated: string;
}

export interface HistoricalPricePoint {
  /** Date in YYYY-MM-DD format */
  date: string;
  /** Unix timestamp */
  timestamp: number;
  /** Bitcoin price in USD */
  price: number;
  /** Trading volume */
  volume: number;
  /** Market cap */
  marketCap: number;
}

export interface PriceProjection {
  /** Projection model name */
  model: string;
  /** Target date */
  targetDate: string;
  /** Projected price */
  projectedPrice: number;
  /** Confidence level (0-1) */
  confidence: number;
  /** Factors considered */
  factors: string[];
}

// API Error Types
export interface APIError {
  /** Error message */
  message: string;
  /** Error code */
  code: string;
  /** HTTP status code */
  status: number;
  /** Additional details */
  details?: any;
  /** Timestamp when error occurred */
  timestamp: string;
}

// API Response Wrappers
export interface APIResponse<T> {
  /** Response data */
  data: T;
  /** Success flag */
  success: boolean;
  /** Error information if success is false */
  error?: APIError;
  /** Response metadata */
  meta?: {
    /** Request timestamp */
    requestTime: string;
    /** Response timestamp */
    responseTime: string;
    /** Data source */
    source: string;
    /** Cache information */
    cached?: boolean;
    /** Cache expiry */
    cacheExpiry?: string;
  };
}

// Rate Limiting
export interface RateLimitInfo {
  /** Requests remaining */
  remaining: number;
  /** Rate limit reset time */
  resetTime: number;
  /** Rate limit window */
  window: number;
  /** Total requests allowed */
  limit: number;
}

// Enhanced Bitcoin API Response
export interface BitcoinAPIResponse extends APIResponse<BitcoinPriceData> {
  /** Rate limiting information */
  rateLimit?: RateLimitInfo;
  /** Data freshness (in seconds) */
  dataAge?: number;
}

// Historical Data Request/Response
export interface HistoricalDataRequest {
  /** Start date (YYYY-MM-DD) */
  startDate: string;
  /** End date (YYYY-MM-DD) */
  endDate: string;
  /** Data interval (daily, hourly, etc.) */
  interval: 'daily' | 'hourly' | 'weekly' | 'monthly';
  /** Currency (default: usd) */
  currency?: string;
}

export interface HistoricalDataResponse extends APIResponse<HistoricalPricePoint[]> {
  /** Request parameters */
  request: HistoricalDataRequest;
  /** Number of data points returned */
  count: number;
}

// Price Alert Types
export interface PriceAlert {
  /** Alert ID */
  id: string;
  /** Target price */
  targetPrice: number;
  /** Alert type */
  type: 'above' | 'below' | 'exact';
  /** Alert status */
  status: 'active' | 'triggered' | 'expired';
  /** Created timestamp */
  createdAt: string;
  /** Expiry timestamp */
  expiresAt?: string;
} 