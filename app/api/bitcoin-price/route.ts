/**
 * Bitcoin Price API Route
 * for KD Bitcoin Real Estate Calculator
 * 
 * This API route handles requests for Bitcoin price data from the frontend.
 * It serves as a proxy to the CoinGecko API with caching and error handling.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentBitcoinPrice, getDetailedBitcoinData } from '@/lib/api/bitcoin-price';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const detailed = searchParams.get('detailed') === 'true';

    let bitcoinData;
    
    if (detailed) {
      bitcoinData = await getDetailedBitcoinData();
    } else {
      bitcoinData = await getCurrentBitcoinPrice();
    }

    // Return successful response
    return NextResponse.json(bitcoinData, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Bitcoin price API error:', error);
    
    // Return error response
    return NextResponse.json(
      {
        data: null,
        success: false,
        error: {
          message: 'Failed to fetch Bitcoin price data',
          code: 'INTERNAL_ERROR',
          status: 500,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'clear-cache') {
      const { clearCache } = await import('@/lib/api/bitcoin-price');
      clearCache();
      
      return NextResponse.json({
        success: true,
        message: 'Cache cleared successfully',
        timestamp: new Date().toISOString(),
      });
    }

    if (action === 'cache-stats') {
      const { getCacheStats } = await import('@/lib/api/bitcoin-price');
      const stats = getCacheStats();
      
      return NextResponse.json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Invalid action',
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    );

  } catch (error) {
    console.error('Bitcoin price API POST error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
} 