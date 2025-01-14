import React, { useEffect, useState } from 'react';

const TokenListComponent = () => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTokens = async () => {
      try {
        // Replace this with your actual API endpoint
        const response = await fetch('https://api.example.com/tokens');
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const tokenList = await response.json();
        setTokens(tokenList);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    loadTokens();
  }, []);

  if (loading) return <div>Loading tokens...</div>;
  if (error) return <div>Error fetching tokens: {error.message}</div>;

  return (
    <div>
      <h1>Token List</h1>
      <ul>
        {tokens.map((token, index) => (
          <li key={index}>
            {token.logoURI && <img src={token.logoURI} alt={token.name} width={30} height={30} />}
            {token.name} ({token.symbol}) - Address: {token.address}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TokenListComponent;
