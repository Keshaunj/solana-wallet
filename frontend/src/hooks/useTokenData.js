// hooks/useTokenData.js
import { useState, useEffect } from 'react';
import { fetchBitquery, QUERIES } from '../utils/bitquery';

export function useTokenData(tokenAddress) {
  const [tokenData, setTokenData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await fetchBitquery(QUERIES.getTokenInfo, {
          network: "solana_mainnet",
          token: tokenAddress
        });
        setTokenData(result.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (tokenAddress) {
      fetchData();
    }
  }, [tokenAddress]);

  return { tokenData, loading, error };
}

export function usePumpDetection(tokenAddress) {
  const [pumpData, setPumpData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Get data for the last 24 hours
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        
        const result = await fetchBitquery(QUERIES.getPumpData, {
          network: "solana_mainnet",
          token: tokenAddress,
          since: since
        });
        setPumpData(result.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (tokenAddress) {
      fetchData();
    }
  }, [tokenAddress]);

  return { pumpData, loading, error };
}

export function useTradingPairs() {
  const [pairs, setPairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await fetchBitquery(QUERIES.getTradingPairs, {
          network: "solana_mainnet"
        });
        setPairs(result.data?.solana?.dexTrades || []);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { pairs, loading, error };
}

export function useTokenTransfers(tokenAddress, limit = 10) {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await fetchBitquery(QUERIES.getTokenTransfers, {
          network: "solana_mainnet",
          token: tokenAddress,
          limit: limit
        });
        setTransfers(result.data?.solana?.transfers || []);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (tokenAddress) {
      fetchData();
    }
  }, [tokenAddress, limit]);

  return { transfers, loading, error };
}