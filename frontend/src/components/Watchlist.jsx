import React, { useState, useEffect, useRef } from 'react';
import { fetchAllNetworkTokens } from '../services/tokenServices';

const Watchlist = () => {
 const [watchlistItems, setWatchlistItems] = useState([]);
 const [newToken, setNewToken] = useState({ symbol: '', targetPrice: '' }); // Changed pair to symbol
 const [error, setError] = useState('');
 const [searchTerm, setSearchTerm] = useState('');
 const [searchResults, setSearchResults] = useState([]);
 const [isSearching, setIsSearching] = useState(false);
 const [tokens, setTokens] = useState([]);
 const [loading, setLoading] = useState(true);
 const searchRef = useRef(null);

 useEffect(() => {
   const loadTokens = async () => {
     const allTokens = await fetchAllNetworkTokens();
     setTokens(allTokens);
     setLoading(false);
   };
   loadTokens();
 }, []);

 useEffect(() => {
   const handleClickOutside = (event) => {
     if (searchRef.current && !searchRef.current.contains(event.target)) {
       setIsSearching(false);
     }
   };
   document.addEventListener('mousedown', handleClickOutside);
   return () => document.removeEventListener('mousedown', handleClickOutside);
 }, []);

 useEffect(() => {
   if (searchTerm) {
     const filtered = tokens.filter(token => 
       token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
       token.name.toLowerCase().includes(searchTerm.toLowerCase())
     );
     setSearchResults(filtered.slice(0, 10));
   } else {
     setSearchResults([]);
   }
 }, [searchTerm, tokens]);

 const handleSearchSelect = (token) => {
   console.log('Selected token:', token);
   setSearchTerm(token.symbol); // Update search input
   setNewToken({ ...newToken, symbol: token.symbol }); // Update selected token
   setIsSearching(false);
 };

 const handleAddToken = async (e) => {
   e.preventDefault();
   
   if (!newToken.symbol || !newToken.targetPrice) {
     setError('Please fill in all fields');
     return;
   }

   const selectedToken = tokens.find(t => t.symbol === newToken.symbol);
   if (!selectedToken) {
     setError('Please select a valid token');
     return;
   }

   try {
     const response = await fetch('http://localhost:3000/api/watchlist/add', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         walletAddress: "your-wallet-address", // Replace with actual wallet address
         symbol: selectedToken.symbol,
         targetPrice: newToken.targetPrice
       }),
     });

     const data = await response.json();
     
     if (data.success) {
       const newItem = {
         ...selectedToken,
         targetPrice: newToken.targetPrice,
         currentPrice: '0.00',
         change: '0.00%'
       };

       setWatchlistItems([...watchlistItems, newItem]);
       setNewToken({ symbol: '', targetPrice: '' });
       setSearchTerm('');
       setError('');
     } else {
       setError(data.error || 'Failed to add token to watchlist');
     }
   } catch (error) {
     setError('Error adding token to watchlist');
     console.error('Error:', error);
   }
 };

 const handleRemoveToken = async (symbol) => {
   try {
     const response = await fetch(`http://localhost:3000/api/watchlist/your-wallet-address/${symbol}`, {
       method: 'DELETE',
     });

     const data = await response.json();
     
     if (data.success) {
       setWatchlistItems(watchlistItems.filter(item => item.symbol !== symbol));
     } else {
       setError('Failed to remove token from watchlist');
     }
   } catch (error) {
     setError('Error removing token from watchlist');
     console.error('Error:', error);
   }
 };

 return (
   <div className="p-4">
     <div className="mb-6">
       <h2 className="text-2xl font-bold text-purple-400 mb-4">Watchlist</h2>
       
       <form onSubmit={handleAddToken} className="bg-gray-800 p-4 rounded-lg mb-4">
         <div className="flex gap-4 mb-2">
           <div className="relative flex-1" ref={searchRef}>
             <input
               type="text"
               placeholder={loading ? "Loading tokens..." : "Search for token (e.g., SOL, BONK)"}
               value={searchTerm}
               onChange={(e) => {
                 console.log('Input value:', e.target.value);
                 setSearchTerm(e.target.value);
                 setIsSearching(true);
               }}
               onFocus={() => setIsSearching(true)}
               disabled={loading}
               className="bg-gray-700 text-white px-4 py-2 rounded-lg w-full"
             />
             {isSearching && searchResults.length > 0 && (
               <div className="absolute z-10 w-full mt-1 bg-gray-700 rounded-lg shadow-xl max-h-60 overflow-auto">
                 {searchResults.map((token) => (
                   <div
                     key={token.address}
                     className="px-4 py-2 hover:bg-gray-600 cursor-pointer flex items-center"
                     onClick={() => handleSearchSelect(token)}
                   >
                     {token.logoURI && (
                       <img 
                         src={token.logoURI} 
                         alt={token.name}
                         className="w-6 h-6 mr-2 rounded-full"
                       />
                     )}
                     <div>
                       <div className="text-purple-400 font-medium">{token.symbol}</div>
                       <div className="text-sm text-gray-400">{token.name}</div>
                     </div>
                   </div>
                 ))}
               </div>
             )}
           </div>
           <input
             type="number"
             step="any"
             placeholder="Target Price"
             value={newToken.targetPrice}
             onChange={(e) => setNewToken({ ...newToken, targetPrice: e.target.value })}
             className="bg-gray-700 text-white px-4 py-2 rounded-lg w-32"
           />
           <button 
             type="submit"
             disabled={loading}
             className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors disabled:bg-purple-400"
           >
             Add
           </button>
         </div>
         {error && <p className="text-red-500 text-sm">{error}</p>}
       </form>

       <div className="space-y-3">
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
                   className="w-8 h-8 mr-3 rounded-full"
                 />
               )}
               <div>
                 <h3 className="text-lg font-semibold text-purple-400">{item.symbol}</h3>
                 <p className="text-sm text-gray-400">Target: ${item.targetPrice}</p>
               </div>
             </div>
             
             <div className="text-right">
               <p className="text-lg">${item.currentPrice}</p>
               <p className={item.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}>
                 {item.change}
               </p>
             </div>

             <button
               onClick={() => handleRemoveToken(item.symbol)}
               className="ml-4 text-gray-400 hover:text-red-500 transition-colors"
             >
               Remove
             </button>
           </div>
         ))}
       </div>
     </div>
   </div>
 );
};

export default Watchlist;