import React from 'react';

const UserProfile = () => {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-white">JD</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-purple-400">John Doe</h2>
            <p className="text-gray-400">Wallet connected: 2 days ago</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Wallet Section */}
          <div className="border-b border-gray-700 pb-6">
            <h3 className="text-lg font-semibold text-purple-400 mb-4">Wallet Details</h3>
            <div className="bg-gray-900 p-4 rounded-lg">
              <p className="text-sm text-gray-400">Connected Wallet</p>
              <p className="text-sm font-mono text-gray-300 break-all">
                0x742d35Cc6634C0532925a3b844Bc454e4438f44e
              </p>
            </div>
          </div>

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
        </div>
      </div>
    </div>
  );
};

export default UserProfile;