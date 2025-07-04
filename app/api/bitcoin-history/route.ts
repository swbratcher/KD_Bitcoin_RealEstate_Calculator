/**
 * Bitcoin Historical Data API Route
 * for KD Bitcoin Real Estate Calculator
 * 
 * This API route handles requests for historical Bitcoin price data from the frontend.
 * It serves as a proxy to the CoinGecko API with caching and error handling.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getHistoricalBitcoinData, getBitcoinPriceAtDate } from '@/lib/api/bitcoin-price';
import { HistoricalDataRequest } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const interval = searchParams.get('interval') as 'daily' | 'hourly' | 'weekly' | 'monthly';
    const currency = searchParams.get('currency');
    const singleDate = searchParams.get('date');

    // Handle single date request
    if (singleDate) {
      const price = await getBitcoinPriceAtDate(singleDate);
      
      return NextResponse.json({
        success: true,
        data: {
          date: singleDate,
          price: price,
        },
        timestamp: new Date().toISOString(),
      }, {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
          'Content-Type': 'application/json',
        },
      });
    }

    // Validate required parameters for range request
    if (!startDate || !endDate) {
      return NextResponse.json(
        {
          success: false,
          error: 'startDate and endDate are required parameters',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Validate date format
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    
    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid date format. Use YYYY-MM-DD format',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Validate date range
    if (startDateObj >= endDateObj) {
      return NextResponse.json(
        {
          success: false,
          error: 'startDate must be before endDate',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Check if date range is too large (more than 1 year)
    const daysDifference = Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDifference > 365) {
      return NextResponse.json(
        {
          success: false,
          error: 'Date range cannot exceed 1 year',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Build request object
    const historicalRequest: HistoricalDataRequest = {
      startDate: startDate,
      endDate: endDate,
      interval: interval || 'daily',
      currency: currency || 'usd',
    };

    // Fetch historical data
    const historicalData = await getHistoricalBitcoinData(historicalRequest);

    // Return successful response
    return NextResponse.json(historicalData, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Bitcoin historical data API error:', error);
    
    // Return error response
    return NextResponse.json(
      {
        data: [],
        success: false,
        error: {
          message: 'Failed to fetch Bitcoin historical data',
          code: 'INTERNAL_ERROR',
          status: 500,
          timestamp: new Date().toISOString(),
        },
        count: 0,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { startDate, endDate, interval, currency } = body;

    // Validate required parameters
    if (!startDate || !endDate) {
      return NextResponse.json(
        {
          success: false,
          error: 'startDate and endDate are required in request body',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Build request object
    const historicalRequest: HistoricalDataRequest = {
      startDate: startDate,
      endDate: endDate,
      interval: interval || 'daily',
      currency: currency || 'usd',
    };

    // Fetch historical data
    const historicalData = await getHistoricalBitcoinData(historicalRequest);

    // Return successful response
    return NextResponse.json(historicalData, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Bitcoin historical data API POST error:', error);
    
    return NextResponse.json(
      {
        data: [],
        success: false,
        error: {
          message: 'Failed to fetch Bitcoin historical data',
          code: 'INTERNAL_ERROR',
          status: 500,
          timestamp: new Date().toISOString(),
        },
        count: 0,
      },
      { status: 500 }
    );
  }
} 