// utils/bitquery.js
const BITQUERY_API_URL = 'https://graphql.bitquery.io';
const BITQUERY_API_KEY = 'YOUR_BITQUERY_API_KEY'; // You'll need to get this from bitquery.io

// Fetch function with Bitquery headers
export async function fetchBitquery(query, variables = {}) {
  try {
    const response = await fetch(BITQUERY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': BITQUERY_API_KEY,
      },
      body: JSON.stringify({
        query,
        variables
      })
    });
    
    return await response.json();
  } catch (error) {
    console.error('Bitquery API Error:', error);
    throw error;
  }
}

// GraphQL Queries
export const QUERIES = {
  // Get token price and trading info
  getTokenInfo: `
    query ($network: BitqueryNetwork!, $token: String!) {
      solana(network: $network) {
        transfers(
          options: {desc: "block.timestamp.time", limit: 1}
          currency: {is: $token}
        ) {
          amount
          currency {
            symbol
            name
            decimals
          }
          block {
            timestamp {
              time(format: "%Y-%m-%d %H:%M:%S")
            }
          }
          transaction {
            signature
          }
        }
      }
    }
  `,

  // Get pump detection data
  getPumpData: `
    query ($network: BitqueryNetwork!, $token: String!, $since: ISO8601DateTime) {
      solana(network: $network) {
        trades(
          options: {desc: "block.timestamp.time"}
          time: {since: $since}
          txFrom: {is: $token}
        ) {
          tradeAmount
          price
          side
          block {
            timestamp {
              time(format: "%Y-%m-%d %H:%M:%S")
            }
          }
        }
      }
    }
  `,

  // Get trading pairs
  getTradingPairs: `
    query ($network: BitqueryNetwork!) {
      solana(network: $network) {
        dexTrades(options: {desc: "tradeAmount", limit: 10}) {
          exchange {
            name
          }
          baseCurrency {
            symbol
            name
          }
          quoteCurrency {
            symbol
          }
          tradeAmount
          price
        }
      }
    }
  `,

  // Get token transfers
  getTokenTransfers: `
    query ($network: BitqueryNetwork!, $token: String!, $limit: Int!) {
      solana(network: $network) {
        transfers(
          options: {desc: "block.timestamp.time", limit: $limit}
          currency: {is: $token}
        ) {
          amount
          sender
          receiver
          block {
            timestamp {
              time(format: "%Y-%m-%d %H:%M:%S")
            }
          }
          transaction {
            signature
          }
        }
      }
    }
  `
};