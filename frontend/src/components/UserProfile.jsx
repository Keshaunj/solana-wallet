import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

const UserProfile = () => {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const getBalance = async () => {
      if (connected && publicKey) {
        try {
          const balance = await connection.getBalance(publicKey);
          setBalance(balance / LAMPORTS_PER_SOL);
        } catch (error) {
          console.error('Error fetching balance:', error);
        }
      }
    };

    getBalance();
  }, [connected, publicKey, connection]);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {publicKey ? publicKey.toString().slice(0, 2) : 'NA'}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-purple-400">
              {connected ? 'Connected User' : 'Not Connected'}
            </h2>
            <p className="text-gray-400">
              {connected ? 'Wallet connected' : 'Please connect wallet'}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Wallet Section */}
          <div className="border-b border-gray-700 pb-6">
            <h3 className="text-lg font-semibold text-purple-400 mb-4">Wallet Details</h3>
            <div className="bg-gray-900 p-4 rounded-lg">
              <p className="text-sm text-gray-400">Connected Wallet</p>
              {connected ? (
                <p className="text-sm font-mono text-gray-300 break-all">
                  {publicKey.toString()}
                </p>
              ) : (
                <div className="my-4">
                  <WalletMultiButton className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors" />
                </div>
              )}
            </div>
            {connected && (
              <div className="bg-gray-900 p-4 rounded-lg mt-4">
                <p className="text-sm text-gray-400">Balance</p>
                <p className="text-xl font-semibold text-white">{balance.toFixed(4)} SOL</p>
              </div>
            )}
          </div>

          {connected && (
            <>
              {/* Statistics Section */}
              <div className="border-b border-gray-700 pb-6">
                <h3 className="text-lg font-semibold text-purple-400 mb-4">Trading Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-900 p-4 rounded-lg">
                    <p className="text-sm text-gray-400">Total Trades</p>
                    <p className="text-xl font-semibold text-white">156</p>
                  </div>
                  <div className="bg-gray-900 p-4 rounded-lg">
                    <p className="text-sm text-gray-400">Success Rate</p>
                    <p className="text-xl font-semibold text-green-500">82%</p>
                  </div>
                </div>
              </div>

              {/* Settings Section */}
              <div>
                <h3 className="text-lg font-semibold text-purple-400 mb-4">Preferences</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-gray-900 p-4 rounded-lg">
                    <span className="text-gray-300">Email Notifications</span>
                    <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-md transition-colors">
                      Enabled
                    </button>
                  </div>
                  <div className="flex items-center justify-between bg-gray-900 p-4 rounded-lg">
                    <span className="text-gray-300">Price Alerts</span>
                    <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-md transition-colors">
                      Enabled
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;