#!/usr/bin/env python3
"""
Script to fetch historical stock data using yfinance and save to Firestore.
Called by GitHub Actions workflow.
"""

import argparse
import json
import sys
from datetime import datetime, timezone
import yfinance as yf
import firebase_admin
from firebase_admin import credentials, firestore


def parse_arguments():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description='Fetch historical stock data using yfinance')
    parser.add_argument('--symbol', required=True, help='Stock symbol (e.g., PETR4.SA)')
    parser.add_argument('--range', required=True, 
                       choices=['1w', '2w', '1mo', '3mo', '6mo', '1y', 'max'],
                       help='Time range for historical data')
    parser.add_argument('--firebase-creds', required=True, 
                       help='Path to Firebase service account JSON file')
    return parser.parse_args()


def map_range_to_period(range_key):
    """Map frontend range to yfinance period parameter."""
    range_map = {
        '1w': '1mo',   # Get 1 month and filter to 1 week
        '2w': '1mo',   # Get 1 month and filter to 2 weeks
        '1mo': '1mo',
        '3mo': '3mo',
        '6mo': '6mo',
        '1y': '1y',
        'max': 'max'
    }
    return range_map.get(range_key, '1mo')


def map_range_to_interval(range_key):
    """Map frontend range to yfinance interval parameter."""
    interval_map = {
        '1w': '1d',
        '2w': '1d',
        '1mo': '1d',
        '3mo': '1d',
        '6mo': '1d',
        '1y': '1d',
        'max': '1wk'  # Weekly data for max range to reduce payload
    }
    return interval_map.get(range_key, '1d')


def fetch_yfinance_data(symbol, range_key):
    """
    Fetch historical data from yfinance.
    
    Args:
        symbol: Stock symbol (e.g., 'PETR4.SA')
        range_key: Range identifier ('1w', '1mo', etc.)
    
    Returns:
        dict: Historical data with format:
            {
                'data': [{'date': timestamp, 'open': float, 'high': float, 
                         'low': float, 'close': float, 'volume': int}, ...],
                'status': 'completed' | 'error',
                'error': str (if status is error),
                'fetchedAt': timestamp,
                'symbol': str,
                'range': str
            }
    """
    print(f"Fetching data for {symbol} with range {range_key}")
    
    try:
        # Ensure symbol has .SA suffix for Brazilian stocks
        if not symbol.endswith('.SA') and len(symbol) <= 6:
            symbol_with_suffix = f"{symbol}.SA"
        else:
            symbol_with_suffix = symbol
        
        # Create ticker object
        ticker = yf.Ticker(symbol_with_suffix)
        
        # Get period and interval
        period = map_range_to_period(range_key)
        interval = map_range_to_interval(range_key)
        
        print(f"YFinance params: symbol={symbol_with_suffix}, period={period}, interval={interval}")
        
        # Fetch historical data
        hist = ticker.history(period=period, interval=interval)
        
        if hist.empty:
            return {
                'status': 'error',
                'error': f'No data found for symbol {symbol}',
                'fetchedAt': datetime.now(timezone.utc).isoformat(),
                'symbol': symbol,
                'range': range_key,
                'data': []
            }
        
        # Convert to list of dicts
        data_list = []
        for index, row in hist.iterrows():
            data_list.append({
                'date': int(index.timestamp()),  # Unix timestamp
                'open': float(row['Open']),
                'high': float(row['High']),
                'low': float(row['Low']),
                'close': float(row['Close']),
                'volume': int(row['Volume'])
            })
        
        print(f"Successfully fetched {len(data_list)} data points")
        
        return {
            'status': 'completed',
            'data': data_list,
            'fetchedAt': datetime.now(timezone.utc).isoformat(),
            'symbol': symbol,
            'range': range_key
        }
        
    except Exception as e:
        print(f"Error fetching data: {str(e)}")
        return {
            'status': 'error',
            'error': str(e),
            'fetchedAt': datetime.now(timezone.utc).isoformat(),
            'symbol': symbol,
            'range': range_key,
            'data': []
        }


def save_to_firestore(db, symbol, range_key, data):
    """
    Save historical data to Firestore.
    
    Args:
        db: Firestore database instance
        symbol: Stock symbol
        range_key: Range identifier
        data: Data dict from fetch_yfinance_data
    """
    # Document ID format: {symbol}_{range}
    doc_id = f"{symbol}_{range_key}"
    
    print(f"Saving to Firestore document: historical-data/{doc_id}")
    
    try:
        # Reference to the document
        doc_ref = db.collection('historical-data').document(doc_id)
        
        # Save the data
        doc_ref.set(data)
        
        print(f"Successfully saved data to Firestore")
        
    except Exception as e:
        print(f"Error saving to Firestore: {str(e)}")
        raise


def main():
    """Main execution function."""
    args = parse_arguments()
    
    print(f"Starting fetch_yfinance.py")
    print(f"Symbol: {args.symbol}")
    print(f"Range: {args.range}")
    
    # Initialize Firebase
    try:
        cred = credentials.Certificate(args.firebase_creds)
        firebase_admin.initialize_app(cred)
        db = firestore.client()
        print("Firebase initialized successfully")
    except Exception as e:
        print(f"Error initializing Firebase: {str(e)}")
        sys.exit(1)
    
    # Fetch data from yfinance
    data = fetch_yfinance_data(args.symbol, args.range)
    
    # Save to Firestore
    try:
        save_to_firestore(db, args.symbol, args.range, data)
    except Exception as e:
        print(f"Failed to save to Firestore: {str(e)}")
        sys.exit(1)
    
    # Print summary
    print("\n=== Summary ===")
    print(f"Symbol: {data['symbol']}")
    print(f"Range: {data['range']}")
    print(f"Status: {data['status']}")
    print(f"Data points: {len(data.get('data', []))}")
    print(f"Fetched at: {data['fetchedAt']}")
    
    if data['status'] == 'error':
        print(f"Error: {data.get('error', 'Unknown error')}")
        sys.exit(1)
    
    print("\nSuccess!")
    sys.exit(0)


if __name__ == '__main__':
    main()
