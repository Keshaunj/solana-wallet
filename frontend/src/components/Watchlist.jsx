import React, { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { TrashIcon, PlusIcon, RotateCwIcon } from 'lucide-react';
import { Connection, PublicKey } from '@solana/web3.js';
import { debounce } from 'lodash';

const Watchlist = () => {
  const { publicKey } = useWallet();
  const [watchlistItems, setWatchlistItems] = useState(() => {
    const saved = localStorage.getItem('watchlist');
    return saved ? JSON.parse(saved) : [];
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const connection = new Connection('https://api.mainnet-beta.solana.com');

  const fetchWatchlist = useCallback(async () => {
    if (!publicKey) return;
    try {
      setLoading(true);
      const watchlistData = await Promise.all(
        watchlistItems.map(async (item) => {
          try {
            const tokenMint = new PublicKey(item.address);
            const tokenAccounts = await connection.getTokenAccountsByOwner(publicKey, { mint: tokenMint });
            const balance = tokenAccounts.value[0]?.account.data.parsed.info.tokenAmount.uiAmount || 0;
            const response = await fetch(`https://api.coingecko.com/api/v3/coins/${item.id}`);
            const data = await response.json();
            return { ...item, balance, price: data.market_data.current_price.usd, change: data.market_data.price_change_percentage_24h };
          } catch (err) {
            console.error(`Error fetching token ${item.symbol}:`, err);
            return { ...item, balance: 0, price: 0, change: 0 };
          }
        })
      );
      setWatchlistItems(watchlistData);
      localStorage.setItem('watchlist', JSON.stringify(watchlistData));
    } catch (err) {
      setError('Failed to fetch watchlist. Please try again.');
    } finally {
      setLoading(false); 
    }
  }, [publicKey, watchlistItems]);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  const searchCoins = useCallback(async (query) => {
    try {
      const response = await fetch(`https://api.coingecko.com/api/v3/search?query=${query}`);
      const data = await response.json();
      setSearchResults(data.coins.slice(0, 5));
    } catch (err) {
      console.error('Error searching coins:', err);
    }
  }, []);

  const debouncedSearch = useCallback(debounce(searchCoins, 300), [searchCoins]);

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.length < 2) {
      setSearchResults([]);
      return;
    }
    debouncedSearch(value);    
  };

  const addToWatchlist = useCallback(async (token) => {
    const response = await fetch(`https://api.coingecko.com/api/v3/coins/${token.id}`);
    const data = await response.json();
    const newItem = { 
      ...token, 
      balance: 0, 
      price: data.market_data.current_price.usd,
      change: data.market_data.price_change_percentage_24h
    };
    setWatchlistItems((prev) => [...prev, newItem]);
    setSearchTerm('');
    setSearchResults([]);
  }, []);
  
  const removeFromWatchlist = useCallback(async (tokenId) => {
    setWatchlistItems((prev) => prev.filter((item) => item.id !== tokenId));
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold text-purple-400 mb-4">
        Watchlist
        <button 
          onClick={fetchWatchlist}
          disabled={loading}
          className="ml-2 text-gray-400 hover:text-purple-500 transition-colors disabled:opacity-50"
          title="Refresh watchlist"
        >
          <RotateCwIcon className="w-5 h-5" />
        </button>  
      </h2>
      <div className="flex mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search coins..."
          className="flex-grow bg-gray-800 rounded-l-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          onClick={() => addToWatchlist(searchResults[0])}
          disabled={searchResults.length === 0}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-r-lg disabled:opacity-50"
        >
          <PlusIcon className="w-5 h-5" />
        </button>
      </div>
      {error && <div className="bg-red-500 text-white p-4 rounded-lg mb-4">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : watchlistItems.length === 0 ? (
        <div className="text-gray-400">Your watchlist is empty.</div>
      ) : (
        <div className="space-y-4">
          {watchlistItems.map((item) => (
            <div key={item.id} className="bg-gray-800 p-4 rounded-lg flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-purple-400">{item.name}</h3>
                <p className="text-sm text-gray-400">
                  {item.symbol} | ${item.price} | {item.change}%
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <p>Balance: {item.balance}</p>
                <button
                  onClick={() => removeFromWatchlist(item.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  title="Remove from watchlist"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {searchResults.length > 0 && (
        <div className="absolute mt-1 w-full bg-gray-800 rounded-md shadow-lg">
          {searchResults.map((coin) => (
            <div
              key={coin.id}
              className="p-2 hover:bg-gray-700 cursor-pointer"
              onClick={() => addToWatchlist(coin)}
            >
              {coin.name} ({coin.symbol})
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Watchlist;