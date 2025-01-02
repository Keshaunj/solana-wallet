import React from 'react';

const Alerts = () => {
  const alerts = [
    {
      type: 'Price Alert',
      pair: 'SOL/USDC',
      message: 'Price above $105.00',
      timestamp: '2 minutes ago',
      status: 'active'
    },
    {
      type: 'Volume Alert',
      pair: 'RAY/USDC',
      message: 'Unusual volume spike detected',
      timestamp: '15 minutes ago',
      status: 'triggered'
    },
    {
      type: 'Price Alert',
      pair: 'BONK/USDC',
      message: 'Price below $0.000010',
      timestamp: '1 hour ago',
      status: 'inactive'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'triggered': return 'text-yellow-500';
      case 'inactive': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-purple-400">Alerts</h2>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
          Create Alert
        </button>
      </div>

      <div className="space-y-4">
        {alerts.map((alert, index) => (
          <div key={index} className="bg-gray-800 rounded-lg p-4 shadow-xl hover:bg-gray-700 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-purple-400">{alert.pair}</h3>
                <p className="text-sm text-gray-300 mt-1">{alert.type}</p>
                <p className="text-sm text-gray-400 mt-2">{alert.message}</p>
              </div>
              <div className="text-right">
                <p className={`font-medium ${getStatusColor(alert.status)}`}>
                  {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                </p>
                <p className="text-sm text-gray-400 mt-1">{alert.timestamp}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Alerts;