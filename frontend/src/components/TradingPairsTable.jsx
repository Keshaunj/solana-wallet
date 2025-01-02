import React from 'react';

const TradingPairsTable = () => {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 text-purple-400">Trading Pairs</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-800 shadow-md rounded-lg">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Pair</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">24h Change</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">24h Volume</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            <tr className="hover:bg-gray-700">
              <td className="px-6 py-4 whitespace-nowrap text-purple-400">SOL/USDC</td>
              <td className="px-6 py-4 whitespace-nowrap">$103.45</td>
              <td className="px-6 py-4 whitespace-nowrap text-green-500">+5.67%</td>
              <td className="px-6 py-4 whitespace-nowrap">$1,234,567</td>
            </tr>
            <tr className="hover:bg-gray-700">
              <td className="px-6 py-4 whitespace-nowrap text-purple-400">RAY/USDC</td>
              <td className="px-6 py-4 whitespace-nowrap">$0.245</td>
              <td className="px-6 py-4 whitespace-nowrap text-red-500">-2.34%</td>
              <td className="px-6 py-4 whitespace-nowrap">$456,789</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TradingPairsTable;