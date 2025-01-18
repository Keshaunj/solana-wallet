import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { TrashIcon, PlusIcon } from 'lucide-react';

const Watchlist = () => {
  const { publicKey } = useWallet();
  const [watchlistItems, setWatchlistItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/watchlist/${publicKey.toString()}`);
        const data = await response.json();
        if (response.ok) {
          setWatchlistItems(data.data);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (publicKey) {
      fetchWatchlist();
    }
  }, [publicKey]);

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);
  
    if (value.length < 2) {
      setSearchResults([]);
      return;
    }
  
    try {
      setLoading(true);
      const response = await fetch(`/api/tokens/search?q=${value}`);
  
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.tokens);
      } else {
        const errorText = await response.text();
        setError(`Error searching tokens: ${errorText}`);
      }
    } catch (err) {
      setError(`Error searching tokens: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const addToWatchlist = async (token) => {
    try {
      const response = await fetch('/api/watchlist/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokenAddress: token.address,
          symbol: token.symbol,
        }),
      });

      if (response.ok) {
        setWatchlistItems([...watchlistItems, token]);
        setSearchTerm('');
        setSearchResults([]);
      } else {
        setError(await response.json().error);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const removeFromWatchlist = async (tokenAddress) => {
    try {
      const response = await fetch(`/api/watchlist/${publicKey.toString()}/${tokenAddress}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setWatchlistItems(watchlistItems.filter((item) => item.address !== tokenAddress));
      } else {
        setError(await response.json().error);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-purple-400">Watchlist</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search tokens..."
              className="w-full bg-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            {loading && (
              <div className="absolute right-3 top-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500"></div>
              </div>
            )}
          </div>
          <button
            onClick={() => addToWatchlist(searchResults[0])}
            disabled={searchResults.length === 0}
            className={`bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors ${
              searchResults.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <PlusIcon className="w-5 h-5 inline-block mr-2" />
            Add Token
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500 text-white p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {watchlistItems.length === 0 ? (
        <div className="text-gray-400">Your watchlist is empty.</div>
      ) : (
        <div className="space-y-4">
          {watchlistItems.map((item) => (
            <div
              key={item.address}
              className="bg-gray-800 p-4 rounded-lg flex justify-between items-center hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center">
                {item.logoURI && (
                  <img
                    src={item.logoURI}
                    alt={item.name}
                    className="w-8 h-8 rounded-full mr-3"
                  />
                )}
                <div>
                  <h3 className="font-semibold text-purple-400">{item.symbol}</h3>
                  <p className="text-sm text-gray-400">{item.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-lg">${item.price}</p>
                  <p className={item.priceChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                    {item.priceChange >= 0 ? '+' : ''}{item.priceChange}%
                  </p>
                </div>
                <button
                  onClick={() => removeFromWatchlist(item.address)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Watchlist;