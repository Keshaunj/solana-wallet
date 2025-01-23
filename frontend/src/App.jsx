import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import TradingPairsTable from './components/TradingPairsTable';
import Watchlist from './components/Watchlist';
import Alerts from './components/Alerts';
import UserProfile from './components/UserProfile';
import TokenListComponent from './components/TokenListComponent';
import { useTokenData } from './hooks/useTokenData';
import { fetchSolanaTokenData } from './utils/solanaApi';
import '@solana/wallet-adapter-react-ui/styles.css';

function App() {
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = clusterApiUrl(network);
  const wallets = [new PhantomWalletAdapter()];
  const { tokenData, loading, error } = useTokenData('SOL');
  const { balance } = fetchSolanaTokenData('SOL');

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <Router>
            <div className="min-h-screen bg-gray-900 text-gray-100">
              <nav className="bg-gray-800 border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                      <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                        <div className="text-2xl font-bold text-gray-100 bg-pink-800 px-4 py-2 rounded-md">Flash Firm</div>
                          <Link to="/" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Home</Link>
                          <Link to="/watchlist" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Watchlist</Link>
                          <Link to="/alerts" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Alerts</Link>
                          <Link to="/profile" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Profile</Link>
                          <Link to="/tokens" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Tokens</Link>
                        </div>
                      </div>
                    </div>
                    <div className="hidden md:block">
                      <div className="ml-4 flex items-center md:ml-6">
                        <WalletMultiButton className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" />
                      </div>
                    </div>
                  </div>
                </div>
              </nav>
              <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                  <Routes>
                    <Route path="/" element={<TradingPairsTable />} />
                    <Route path="/watchlist" element={<Watchlist />} />
                    <Route path="/alerts" element={<Alerts />} />
                    <Route path="/profile" element={<UserProfile balance={balance} />} />
                    <Route path="/tokens" element={<TokenListComponent tokenData={tokenData} loading={loading} error={error} />} />
                  </Routes>
                </div>
              </main>
            </div>
          </Router>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;