/**
 * API Services Index
 * for KD Bitcoin Real Estate Calculator
 * 
 * This file re-exports all API functions from the various modules
 * to provide a centralized import point for the entire application.
 */

// Bitcoin Price API Functions
export {
  getCurrentBitcoinPrice,
  getDetailedBitcoinData,
  getHistoricalBitcoinData,
  getBitcoinPriceAtDate,
  checkAPIHealth,
  clearCache,
  getCacheStats,
} from './bitcoin-price';

// API Configuration
export const API_CONFIG = {
  COINGECKO_BASE_URL: 'https://api.coingecko.com/api/v3',
  BITCOIN_ID: 'bitcoin',
  DEFAULT_CURRENCY: 'usd',
  RATE_LIMIT_DELAY: 1000, // 1 second between requests
  CACHE_DURATION: 60000, // 1 minute cache
  REQUEST_TIMEOUT: 10000, // 10 seconds timeout
};

// API Helper Functions
export const createAPIRequest = (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const defaultOptions: RequestInit = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    ...options,
  };

  return fetch(url, defaultOptions);
};

export const handleAPIError = (error: any): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
};

export const formatAPIResponse = <T>(
  data: T,
  success: boolean,
  error?: any
): {
  data: T;
  success: boolean;
  error?: string;
  timestamp: string;
} => {
  return {
    data,
    success,
    error: error ? handleAPIError(error) : undefined,
    timestamp: new Date().toISOString(),
  };
}; 