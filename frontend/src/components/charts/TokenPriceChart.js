import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { fetchBitquery, QUERIES } from './utils/bitquery';

const TokenPriceChart = ({ tokenAddress }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTokenPriceData = async () => {
      try {
        const result = await fetchBitquery(QUERIES.getTokenInfo, {
          network: 'solana_mainnet',
          token: tokenAddress
        });

        const priceData = result.data.solana.transfers.map(transfer => ({
          time: transfer.block.timestamp.time,
          price: transfer.amount / transfer.currency.decimals
        }));

        setChartData(priceData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTokenPriceData();
  }, [tokenAddress]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <LineChart width={600} height={400} data={chartData}>
      <XAxis dataKey="time" />
      <YAxis />
      <CartesianGrid strokeDasharray="3 3" />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="price" stroke="#8884d8" />
    </LineChart>
  );
};

export default TokenPriceChart;