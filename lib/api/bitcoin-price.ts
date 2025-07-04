/**
 * Bitcoin Price API Service
 * for KD Bitcoin Real Estate Calculator
 * 
 * This service integrates with CoinGecko API to fetch Bitcoin price data
 */

import { 
  BitcoinPriceData, 
  BitcoinAPIResponse, 
  CoinGeckoSimplePrice, 
  CoinGeckoHistoricalPrice,
  CoinGeckoMarketData,
  HistoricalPricePoint,
  HistoricalDataRequest,
  HistoricalDataResponse,
  APIError 
} from '@/lib/types';

// CoinGecko API Configuration
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';
const BITCOIN_ID = 'bitcoin';
const DEFAULT_CURRENCY = 'usd';

// Rate limiting and caching
const RATE_LIMIT_DELAY = 1000; // 1 second between requests
const CACHE_DURATION = 60000; // 1 minute cache

// Simple in-memory cache
interface CacheEntry {
  data: any;
  timestamp: number;
  expires: number;
}

const cache = new Map<string, CacheEntry>();

/**
 * Get current Bitcoin price and market data
 */
export async function getCurrentBitcoinPrice(): Promise<BitcoinAPIResponse> {
  const cacheKey = 'current-bitcoin-price';
  const cached = getFromCache(cacheKey);
  
  if (cached) {
    return {
      data: cached,
      success: true,
      meta: {
        requestTime: new Date().toISOString(),
        responseTime: new Date().toISOString(),
        source: 'CoinGecko API',
        cached: true,
      }
    };
  }

  try {
    const response = await fetch(
      `${COINGECKO_BASE_URL}/simple/price?ids=${BITCOIN_ID}&vs_currencies=${DEFAULT_CURRENCY}&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: CoinGeckoSimplePrice = await response.json();
    const bitcoinData = data.bitcoin;

    const bitcoinPriceData: BitcoinPriceData = {
      currentPrice: bitcoinData.usd,
      priceChange24h: bitcoinData.usd_24h_change || 0,
      priceChangePercent24h: bitcoinData.usd_24h_change || 0,
      priceChange7d: 0, // Will be calculated separately
      priceChangePercent7d: 0, // Will be calculated separately
      marketCap: bitcoinData.usd_market_cap || 0,
      volume24h: bitcoinData.usd_24h_vol || 0,
      allTimeHigh: 0, // Will be fetched separately
      allTimeLow: 0, // Will be fetched separately
      lastUpdated: new Date(bitcoinData.last_updated_at! * 1000).toISOString(),
    };

    // Cache the result
    setInCache(cacheKey, bitcoinPriceData, CACHE_DURATION);

    return {
      data: bitcoinPriceData,
      success: true,
      meta: {
        requestTime: new Date().toISOString(),
        responseTime: new Date().toISOString(),
        source: 'CoinGecko API',
        cached: false,
      }
    };

  } catch (error) {
    const apiError: APIError = {
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'FETCH_ERROR',
      status: 500,
      timestamp: new Date().toISOString(),
    };

    return {
      data: getDefaultBitcoinPrice(),
      success: false,
      error: apiError,
      meta: {
        requestTime: new Date().toISOString(),
        responseTime: new Date().toISOString(),
        source: 'CoinGecko API',
        cached: false,
      }
    };
  }
}

/**
 * Get detailed Bitcoin market data
 */
export async function getDetailedBitcoinData(): Promise<BitcoinAPIResponse> {
  const cacheKey = 'detailed-bitcoin-data';
  const cached = getFromCache(cacheKey);
  
  if (cached) {
    return {
      data: cached,
      success: true,
      meta: {
        requestTime: new Date().toISOString(),
        responseTime: new Date().toISOString(),
        source: 'CoinGecko API',
        cached: true,
      }
    };
  }

  try {
    const response = await fetch(
      `${COINGECKO_BASE_URL}/coins/${BITCOIN_ID}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: CoinGeckoMarketData = await response.json();

    const bitcoinPriceData: BitcoinPriceData = {
      currentPrice: data.current_price,
      priceChange24h: data.price_change_24h,
      priceChangePercent24h: data.price_change_percentage_24h,
      priceChange7d: data.price_change_percentage_7d,
      priceChangePercent7d: data.price_change_percentage_7d,
      marketCap: data.market_cap,
      volume24h: data.total_volume,
      allTimeHigh: data.ath,
      allTimeLow: data.atl,
      lastUpdated: data.last_updated,
    };

    // Cache the result
    setInCache(cacheKey, bitcoinPriceData, CACHE_DURATION);

    return {
      data: bitcoinPriceData,
      success: true,
      meta: {
        requestTime: new Date().toISOString(),
        responseTime: new Date().toISOString(),
        source: 'CoinGecko API',
        cached: false,
      }
    };

  } catch (error) {
    const apiError: APIError = {
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'FETCH_ERROR',
      status: 500,
      timestamp: new Date().toISOString(),
    };

    return {
      data: getDefaultBitcoinPrice(),
      success: false,
      error: apiError,
      meta: {
        requestTime: new Date().toISOString(),
        responseTime: new Date().toISOString(),
        source: 'CoinGecko API',
        cached: false,
      }
    };
  }
}

/**
 * Get historical Bitcoin price data
 */
export async function getHistoricalBitcoinData(
  request: HistoricalDataRequest
): Promise<HistoricalDataResponse> {
  const cacheKey = `historical-${request.startDate}-${request.endDate}-${request.interval}`;
  const cached = getFromCache(cacheKey);
  
  if (cached) {
    return {
      data: cached,
      success: true,
      request,
      count: cached.length,
      meta: {
        requestTime: new Date().toISOString(),
        responseTime: new Date().toISOString(),
        source: 'CoinGecko API',
        cached: true,
      }
    };
  }

  try {
    // Convert date strings to timestamps
    const fromTimestamp = Math.floor(new Date(request.startDate).getTime() / 1000);
    const toTimestamp = Math.floor(new Date(request.endDate).getTime() / 1000);

    const response = await fetch(
      `${COINGECKO_BASE_URL}/coins/${BITCOIN_ID}/market_chart/range?vs_currency=${request.currency || DEFAULT_CURRENCY}&from=${fromTimestamp}&to=${toTimestamp}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: CoinGeckoHistoricalPrice = await response.json();

    // Convert to our format
    const historicalData: HistoricalPricePoint[] = data.prices.map(([timestamp, price], index) => {
      const date = new Date(timestamp);
      const volume = data.total_volumes[index] ? data.total_volumes[index][1] : 0;
      const marketCap = data.market_caps[index] ? data.market_caps[index][1] : 0;

      return {
        date: date.toISOString().substr(0, 10), // YYYY-MM-DD format
        timestamp: timestamp,
        price: price,
        volume: volume,
        marketCap: marketCap,
      };
    });

    // Filter by interval if needed
    const filteredData = filterByInterval(historicalData, request.interval);

    // Cache the result
    setInCache(cacheKey, filteredData, CACHE_DURATION * 5); // Cache longer for historical data

    return {
      data: filteredData,
      success: true,
      request,
      count: filteredData.length,
      meta: {
        requestTime: new Date().toISOString(),
        responseTime: new Date().toISOString(),
        source: 'CoinGecko API',
        cached: false,
      }
    };

  } catch (error) {
    const apiError: APIError = {
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'FETCH_ERROR',
      status: 500,
      timestamp: new Date().toISOString(),
    };

    return {
      data: [],
      success: false,
      error: apiError,
      request,
      count: 0,
      meta: {
        requestTime: new Date().toISOString(),
        responseTime: new Date().toISOString(),
        source: 'CoinGecko API',
        cached: false,
      }
    };
  }
}

/**
 * Get Bitcoin price at specific date
 */
export async function getBitcoinPriceAtDate(date: string): Promise<number> {
  const cacheKey = `price-at-${date}`;
  const cached = getFromCache(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    const formattedDate = new Date(date).toLocaleDateString('en-GB'); // DD-MM-YYYY format
    
    const response = await fetch(
      `${COINGECKO_BASE_URL}/coins/${BITCOIN_ID}/history?date=${formattedDate}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const price = data.market_data.current_price.usd;

    // Cache the result
    setInCache(cacheKey, price, CACHE_DURATION * 10); // Cache longer for historical prices

    return price;

  } catch (error) {
    console.error('Error fetching Bitcoin price at date:', error);
    return 0;
  }
}

/**
 * Utility functions
 */

function getFromCache(key: string): any | null {
  const entry = cache.get(key);
  if (entry && Date.now() < entry.expires) {
    return entry.data;
  }
  if (entry) {
    cache.delete(key);
  }
  return null;
}

function setInCache(key: string, data: any, duration: number): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    expires: Date.now() + duration,
  });
}

function getDefaultBitcoinPrice(): BitcoinPriceData {
  return {
    currentPrice: 45000, // Default fallback price
    priceChange24h: 0,
    priceChangePercent24h: 0,
    priceChange7d: 0,
    priceChangePercent7d: 0,
    marketCap: 0,
    volume24h: 0,
    allTimeHigh: 69000,
    allTimeLow: 3200,
    lastUpdated: new Date().toISOString(),
  };
}

function filterByInterval(
  data: HistoricalPricePoint[],
  interval: 'daily' | 'hourly' | 'weekly' | 'monthly'
): HistoricalPricePoint[] {
  if (interval === 'daily') {
    // Return all data for daily (CoinGecko returns daily data by default)
    return data;
  }

  // For other intervals, we would implement filtering logic
  // For now, just return the data as-is
  return data;
}

/**
 * Health check for the API service
 */
export async function checkAPIHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${COINGECKO_BASE_URL}/ping`);
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Clear the cache
 */
export function clearCache(): void {
  cache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  size: number;
  entries: Array<{ key: string; timestamp: number; expires: number; }>;
} {
  const entries = Array.from(cache.entries()).map(([key, entry]) => ({
    key,
    timestamp: entry.timestamp,
    expires: entry.expires,
  }));

  return {
    size: cache.size,
    entries,
  };
} 