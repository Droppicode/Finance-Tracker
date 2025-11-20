#!/usr/bin/env python3
"""
Script to refresh historical data for all symbols already in Firestore.
Runs as a scheduled GitHub Actions job to keep data fresh.
"""

import sys
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime, timezone
import argparse

# Import the fetch function from the main script
import os
sys.path.insert(0, os.path.dirname(__file__))
from fetch_yfinance import fetch_yfinance_data, save_to_firestore


def parse_arguments():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description='Refresh all historical data in Firestore')
    parser.add_argument('--firebase-creds', required=True, 
                       help='Path to Firebase service account JSON file')
    parser.add_argument('--max-symbols', type=int, default=50,
                       help='Maximum number of symbols to update (default: 50)')
    return parser.parse_args()


def get_all_symbols_from_firestore(db):
    """
    Get all unique symbols from Firestore historical-data collection.
    
    Args:
        db: Firestore database instance
    
    Returns:
        list: List of unique symbols
    """
    print("Fetching all symbols from Firestore...")
    
    try:
        docs = db.collection('historical-data').stream()
        
        symbols = set()
        for doc in docs:
            data = doc.data()
            if 'symbol' in data:
                symbols.add(data['symbol'])
        
        symbols_list = sorted(list(symbols))
        print(f"Found {len(symbols_list)} unique symbols: {', '.join(symbols_list)}")
        
        return symbols_list
        
    except Exception as e:
        print(f"Error fetching symbols: {str(e)}")
        return []


def should_refresh(doc_data):
    """
    Check if data should be refreshed (older than 12 hours or has error status).
    
    Args:
        doc_data: Document data from Firestore
    
    Returns:
        bool: True if should refresh
    """
    # Always refresh if status is error
    if doc_data.get('status') == 'error':
        return True
    
    # Check if data is older than 12 hours
    fetched_at = doc_data.get('fetchedAt')
    if not fetched_at:
        return True
    
    try:
        fetched_time = datetime.fromisoformat(fetched_at.replace('Z', '+00:00'))
        now = datetime.now(timezone.utc)
        age_hours = (now - fetched_time).total_seconds() / 3600
        
        # Refresh if older than 12 hours
        return age_hours > 12
    except:
        return True


def refresh_symbol(db, symbol):
    """
    Refresh historical data for a specific symbol.
    
    Args:
        db: Firestore database instance
        symbol: Stock symbol
    
    Returns:
        bool: True if successful
    """
    print(f"\n{'='*60}")
    print(f"Refreshing {symbol}...")
    
    try:
        # Check if we should refresh
        doc_id = f"{symbol}_max"
        doc_ref = db.collection('historical-data').document(doc_id)
        doc = doc_ref.get()
        
        if doc.exists:
            if not should_refresh(doc.to_dict()):
                print(f"  ✓ {symbol} data is fresh (< 12 hours old), skipping")
                return True
        
        # Fetch fresh data
        print(f"  → Fetching data from YFinance...")
        data = fetch_yfinance_data(symbol, 'max')
        
        if data['status'] == 'completed':
            print(f"  → Saving to Firestore...")
            save_to_firestore(db, symbol, 'max', data)
            print(f"  ✓ {symbol} refreshed successfully ({len(data.get('data', []))} points)")
            return True
        else:
            print(f"  ✗ Failed to fetch {symbol}: {data.get('error', 'Unknown error')}")
            # Still save the error status
            save_to_firestore(db, symbol, 'max', data)
            return False
            
    except Exception as e:
        print(f"  ✗ Error refreshing {symbol}: {str(e)}")
        return False


def main():
    """Main execution function."""
    args = parse_arguments()
    
    print("="*60)
    print("SCHEDULED REFRESH - Historical Stock Data")
    print("="*60)
    print(f"Started at: {datetime.now(timezone.utc).isoformat()}")
    print(f"Max symbols to update: {args.max_symbols}")
    print()
    
    # Initialize Firebase
    try:
        cred = credentials.Certificate(args.firebase_creds)
        firebase_admin.initialize_app(cred)
        db = firestore.client()
        print("✓ Firebase initialized successfully\n")
    except Exception as e:
        print(f"✗ Error initializing Firebase: {str(e)}")
        sys.exit(1)
    
    # Get all symbols
    symbols = get_all_symbols_from_firestore(db)
    
    if not symbols:
        print("No symbols found in Firestore. Nothing to refresh.")
        sys.exit(0)
    
    # Limit number of symbols to refresh (avoid hitting rate limits)
    if len(symbols) > args.max_symbols:
        print(f"\n⚠ Limiting to {args.max_symbols} symbols (found {len(symbols)})")
        symbols = symbols[:args.max_symbols]
    
    # Refresh each symbol
    print(f"\nRefreshing {len(symbols)} symbol(s)...\n")
    
    success_count = 0
    error_count = 0
    skipped_count = 0
    
    for i, symbol in enumerate(symbols, 1):
        print(f"[{i}/{len(symbols)}] ", end='')
        result = refresh_symbol(db, symbol)
        
        if result:
            success_count += 1
        else:
            error_count += 1
    
    # Summary
    print("\n" + "="*60)
    print("REFRESH SUMMARY")
    print("="*60)
    print(f"Total symbols: {len(symbols)}")
    print(f"✓ Successful: {success_count}")
    print(f"✗ Failed: {error_count}")
    print(f"Completed at: {datetime.now(timezone.utc).isoformat()}")
    print("="*60)
    
    # Exit with error if any failures
    if error_count > 0:
        print(f"\n⚠ {error_count} symbol(s) failed to refresh")
        sys.exit(1)
    
    print("\n✓ All symbols refreshed successfully!")
    sys.exit(0)


if __name__ == '__main__':
    main()
