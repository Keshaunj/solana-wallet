import React from 'react';

const Watchlist = () => {
  const watchlistItems = [
    { pair: 'SOL/USDC', price: '$103.45', change: '+5.67%', alert: '> $105.00' },
    { pair: 'RAY/USDC', price: '$0.245', change: '-2.34%', alert: '< $0.20' },
    { pair: 'BONK/USDC', price: '$0.00001234', change: '+12.34%', alert: '> $0.000015' }
  ];

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-purple-400">Watchlist</h2>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
          Add New
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-xl">
        {watchlistItems.map((item, index) => (
          <div 
            key={index} 
            className="p-4 border-b border-gray-700 last:border-b-0 hover:bg-gray-700 transition-colors"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-purple-400">{item.pair}</h3>
                <p className="text-sm text-gray-400">Alert when {item.alert}</p>
              </div>
              <div className="text-right">
                <p className="text-lg">{item.price}</p>
                <p className={item.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}>
                  {item.change}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Watchlist;