import React, { useState, useEffect, useRef } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

const UserProfile = () => {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const fileInputRef = useRef(null);
  
  const [userData, setUserData] = useState({
    balance: 0,
    profileImage: null,
    email: '',
    emailNotifications: false,
    priceAlerts: false,
    tradingStats: {
      totalTrades: 0,
      successfulTrades: 0,
      lastTradeAt: null
    }
  });

  const [loading, setLoading] = useState({
    image: false,
    data: true
  });

  useEffect(() => {
    if (connected && publicKey) {
      fetchUserData();
      getBalance();
    }
  }, [connected, publicKey]);

  const getBalance = async () => {
    if (publicKey) {
      try {
        const balance = await connection.getBalance(publicKey);
        setUserData(prev => ({
          ...prev,
          balance: balance / LAMPORTS_PER_SOL
        }));
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    }
  };

  const fetchUserData = async () => {
    setLoading(prev => ({ ...prev, data: true }));
    try {
      const response = await fetch(`http://localhost:3000/api/users/${publicKey.toString()}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUserData(prev => ({
            ...prev,
            ...data.user
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(prev => ({ ...prev, data: false }));
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(prev => ({ ...prev, image: true }));
    const formData = new FormData();
    formData.append('profileImage', file);
    formData.append('walletAddress', publicKey.toString());

    try {
      const response = await fetch('http://localhost:3000/api/users/profile-image', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUserData(prev => ({
            ...prev,
            profileImage: data.imageUrl
          }));
        }
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setLoading(prev => ({ ...prev, image: false }));
    }
  };

  const handleEmailUpdate = async (e) => {
    const email = e.target.value;
    try {
      const response = await fetch(`http://localhost:3000/api/users/${publicKey.toString()}/email`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUserData(prev => ({
            ...prev,
            email
          }));
        }
      }
    } catch (error) {
      console.error('Error updating email:', error);
    }
  };

  const toggleNotification = async (type) => {
    const updateValue = !userData[type];
    try {
      const response = await fetch(`http://localhost:3000/api/users/${publicKey.toString()}/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          [type]: updateValue
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUserData(prev => ({
            ...prev,
            [type]: updateValue
          }));
        }
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-gray-400 mb-4">Please connect your wallet to view profile</p>
        <WalletMultiButton />
      </div>
    );
  }

  if (loading.data) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center overflow-hidden">
              {userData.profileImage ? (
                <img 
                  src={userData.profileImage} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-white">
                  {publicKey.toString().slice(0, 2)}
                </span>
              )}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-purple-500 rounded-full p-2 cursor-pointer hover:bg-purple-600 transition-colors"
                disabled={loading.image}
              >
                {loading.image ? '...' : '📷'}
              </button>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-purple-400">Connected User</h2>
            <p className="text-gray-400">Wallet connected</p>
          </div>
        </div>

        {/* Wallet Details */}
        <div className="border-b border-gray-700 pb-6">
          <h3 className="text-lg font-semibold text-purple-400 mb-4">Wallet Details</h3>
          <div className="bg-gray-900 p-4 rounded-lg">
            <p className="text-sm text-gray-400">Connected Wallet</p>
            <p className="text-sm font-mono text-gray-300 break-all">
              {publicKey.toString()}
            </p>
          </div>
          <div className="bg-gray-900 p-4 rounded-lg mt-4">
            <p className="text-sm text-gray-400">Balance</p>
            <p className="text-xl font-semibold text-white">
              {userData.balance.toFixed(4)} SOL
            </p>
          </div>
        </div>

        {/* Trading Statistics */}
        <div className="border-b border-gray-700 py-6">
          <h3 className="text-lg font-semibold text-purple-400 mb-4">Trading Statistics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-900 p-4 rounded-lg">
              <p className="text-sm text-gray-400">Total Trades</p>
              <p className="text-xl font-semibold text-white">
                {userData.tradingStats?.totalTrades || 0}
              </p>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg">
              <p className="text-sm text-gray-400">Success Rate</p>
              <p className="text-xl font-semibold text-green-500">
                {userData.tradingStats?.totalTrades > 0 
                  ? ((userData.tradingStats.successfulTrades / userData.tradingStats.totalTrades) * 100).toFixed(0)
                  : 0}%
              </p>
            </div>
          </div>
          {userData.tradingStats?.lastTradeAt && (
            <div className="bg-gray-900 p-4 rounded-lg mt-4">
              <p className="text-sm text-gray-400">Last Trade</p>
              <p className="text-sm text-gray-300">
                {new Date(userData.tradingStats.lastTradeAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {/* Email Settings */}
        <div className="border-b border-gray-700 py-6">
          <h3 className="text-lg font-semibold text-purple-400 mb-4">Email Settings</h3>
          <div className="bg-gray-900 p-4 rounded-lg">
            <input
              type="email"
              value={userData.email || ''}
              onChange={(e) => setUserData(prev => ({ ...prev, email: e.target.value }))}
              onBlur={handleEmailUpdate}
              placeholder="Enter your email"
              className="w-full bg-gray-800 text-white px-4 py-2 rounded-md border border-gray-700 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Preferences */}
        <div className="pt-6">
          <h3 className="text-lg font-semibold text-purple-400 mb-4">Preferences</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-gray-900 p-4 rounded-lg">
              <span className="text-gray-300">Email Notifications</span>
              <button
                onClick={() => toggleNotification('emailNotifications')}
                className={`px-4 py-1 rounded-md transition-colors ${
                  userData.emailNotifications 
                    ? 'bg-purple-600 hover:bg-purple-700' 
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {userData.emailNotifications ? 'Enabled' : 'Disabled'}
              </button>
            </div>
            <div className="flex items-center justify-between bg-gray-900 p-4 rounded-lg">
              <span className="text-gray-300">Price Alerts</span>
              <button
                onClick={() => toggleNotification('priceAlerts')}
                className={`px-4 py-1 rounded-md transition-colors ${
                  userData.priceAlerts 
                    ? 'bg-purple-600 hover:bg-purple-700' 
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {userData.priceAlerts ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;