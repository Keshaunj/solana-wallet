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
import TokenListComponent from './components/TokenListComponent'; // Token list component

// Import wallet adapter styles
import '@solana/wallet-adapter-react-ui/styles.css';

function App() {
  // Configure Solana wallet
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = clusterApiUrl(network);
  const wallets = [new PhantomWalletAdapter()];

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <Router>
            <div className="min-h-screen bg-gray-900 text-gray-100">
              <nav className="bg-gray-800 p-4">
                <div className="container mx-auto flex justify-between items-center">
                  <h1 className="text-xl font-bold text-purple-400">Pump Scanner</h1>
                  <div className="flex items-center space-x-6">
                    <Link to="/" className="hover:text-purple-400 transition-colors">Trading</Link>
                    <Link to="/watchlist" className="hover:text-purple-400 transition-colors">Watchlist</Link>
                    <Link to="/alerts" className="hover:text-purple-400 transition-colors">Alerts</Link>
                    <Link to="/profile" className="hover:text-purple-400 transition-colors">Profile</Link>
                    <Link to="/tokens" className="hover:text-purple-400 transition-colors">Tokens</Link>
                    <WalletMultiButton className="bg-purple-600 hover:bg-purple-700 transition-colors" />
                  </div>
                </div>
              </nav>

              <main className="container mx-auto p-4">
                <Routes>
                  <Route path="/" element={<TradingPairsTable />} />
                  <Route path="/watchlist" element={<Watchlist />} />
                  <Route path="/alerts" element={<Alerts />} />
                  <Route path="/profile" element={<UserProfile />} />
                  <Route path="/tokens" element={<TokenListComponent />} /> {/* Token list route */}
                </Routes>
              </main>
            </div>
          </Router>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
