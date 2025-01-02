import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import TradingPairsTable from './components/TradingPairsTable';
import Watchlist from './components/Watchlist';
import Alerts from './components/Alerts';
import UserProfile from './components/UserProfile';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <nav className="bg-gray-800 p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold text-orange-400">Flash Defi Firm</h1>
            <div className="flex space-x-4">
              <Link to="/" className="hover:text-purple-400 transition-colors">Trading</Link>
              <Link to="/watchlist" className="hover:text-purple-400 transition-colors">Watchlist</Link>
              <Link to="/alerts" className="hover:text-purple-400 transition-colors">Alerts</Link>
              <Link to="/profile" className="hover:text-purple-400 transition-colors">Profile</Link>
            </div>
          </div>
        </nav>
        
        <main className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={<TradingPairsTable />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/profile" element={<UserProfile />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;