import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

const Alerts = () => {
  const { publicKey } = useWallet();
  const [alerts, setAlerts] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAlert, setNewAlert] = useState({
    type: 'price',
    pair: '',
    condition: 'above',
    value: '',
    active: true
  });
  const [availablePairs, setAvailablePairs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (publicKey) {
      fetchAlerts();
      fetchAvailablePairs();
    }
  }, [publicKey]);

  const fetchAlerts = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/alerts/${publicKey.toString()}`);
      const data = await response.json();
      if (data.success) {
        setAlerts(data.data);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const fetchAvailablePairs = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/trading/pairs');
      const data = await response.json();
      if (data.success) {
        setAvailablePairs(data.data);
      }
    } catch (error) {
      console.error('Error fetching trading pairs:', error);
    }
  };

  const createAlert = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/alerts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: publicKey.toString(),
          ...newAlert
        }),
      });

      const data = await response.json();
      if (data.success) {
        setAlerts([...alerts, data.data]);
        setShowCreateModal(false);
        setNewAlert({
          type: 'price',
          pair: '',
          condition: 'above',
          value: '',
          active: true
        });
      }
    } catch (error) {
      console.error('Error creating alert:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAlertStatus = async (alertId) => {
    try {
      const alert = alerts.find(a => a._id === alertId);
      const response = await fetch(`http://localhost:3000/api/alerts/${publicKey.toString()}/${alertId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          active: !alert.active
        }),
      });

      if (response.ok) {
        setAlerts(alerts.map(alert => 
          alert._id === alertId ? { ...alert, active: !alert.active } : alert
        ));
      }
    } catch (error) {
      console.error('Error toggling alert status:', error);
    }
  };

  const deleteAlert = async (alertId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/alerts/${publicKey.toString()}/${alertId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAlerts(alerts.filter(alert => alert._id !== alertId));
      }
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'text-gray-500';
    switch (status) {
      case 'triggered': return 'text-yellow-500';
      case 'active': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  if (!publicKey) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-400">Please connect your wallet to manage alerts</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-purple-400">Alerts</h2>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Create Alert
        </button>
      </div>

      {/* Create Alert Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-purple-400">Create New Alert</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={createAlert} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Alert Type
                </label>
                <select
                  value={newAlert.type}
                  onChange={(e) => setNewAlert({ ...newAlert, type: e.target.value })}
                  className="w-full bg-gray-700 rounded-lg p-2 text-white"
                >
                  <option value="price">Price Alert</option>
                  <option value="volume">Volume Alert</option>
                  <option value="pump">Pump Alert</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Trading Pair
                </label>
                <select
                  value={newAlert.pair}
                  onChange={(e) => setNewAlert({ ...newAlert, pair: e.target.value })}
                  className="w-full bg-gray-700 rounded-lg p-2 text-white"
                >
                  <option value="">Select a pair</option>
                  {availablePairs.map((pair) => (
                    <option key={pair._id} value={pair._id}>
                      {pair.baseToken.symbol}/{pair.quoteToken.symbol}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Condition
                </label>
                <select
                  value={newAlert.condition}
                  onChange={(e) => setNewAlert({ ...newAlert, condition: e.target.value })}
                  className="w-full bg-gray-700 rounded-lg p-2 text-white"
                >
                  <option value="above">Above</option>
                  <option value="below">Below</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Value
                </label>
                <input
                  type="number"
                  value={newAlert.value}
                  onChange={(e) => setNewAlert({ ...newAlert, value: e.target.value })}
                  className="w-full bg-gray-700 rounded-lg p-2 text-white"
                  placeholder="Enter value"
                  step="any"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition-colors ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Creating...' : 'Create Alert'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Alerts List */}
      <div className="space-y-4">
        {alerts.map((alert) => (
          <div key={alert._id} className="bg-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-purple-400">{alert.pair}</h3>
                <p className="text-sm text-gray-300 mt-1">{alert.type}</p>
                <p className="text-sm text-gray-400 mt-2">
                  {alert.condition} {alert.value}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => toggleAlertStatus(alert._id)}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      alert.active 
                        ? 'bg-green-500 hover:bg-green-600' 
                        : 'bg-gray-600 hover:bg-gray-700'
                    }`}
                  >
                    {alert.active ? 'Active' : 'Inactive'}
                  </button>
                  <button
                    onClick={() => deleteAlert(alert._id)}
                    className="text-red-400 hover:text-red-500"
                  >
                    Delete
                  </button>
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  {new Date(alert.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Alerts;