import { useState, useEffect } from 'react';


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


// Other hooks...