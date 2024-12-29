import { useState, useEffect } from 'react';
import { AlertCircle, Wallet, Send, RotateCw, Plus } from 'lucide-react';

function App() {
  const [wallet, setWallet] = useState(null);
  const [connected, setConnected] = useState(false);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [publicKey, setPublicKey] = useState(null);

  useEffect(() => {
    const checkWallet = async () => {
      try {
        const { solana } = window;
        if (solana?.isPhantom) {
          setWallet(solana);
          if (solana.isConnected) {
            const pubKey = solana.publicKey;
            setPublicKey(pubKey.toString());
            setConnected(true);
            await fetchBalance(pubKey.toString());
          }
        }
      } catch (error) {
        console.error('Wallet detection error:', error);
      }
    };

    checkWallet();
  }, []);

  const fetchBalance = async (address) => {
    try {
      const response = await fetch(`http://localhost:3000/api/balance/${address}`);
      const data = await response.json();
      if (data.sol) {
        setBalance(data.sol);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    try {
      if (!wallet) {
        window.open('https://phantom.app/', '_blank');
        return;
      }

      const { publicKey } = await wallet.connect();
      const address = publicKey.toString();
      setPublicKey(address);
      setConnected(true);
      await fetchBalance(address);
    } catch (error) {
      console.error('Connection error:', error);
    }
    setLoading(false);
  };

  const handleDisconnect = async () => {
    try {
      await wallet?.disconnect();
      setConnected(false);
      setPublicKey(null);
      setBalance(0);
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };

  const handleRefresh = async () => {
    if (connected && publicKey) {
      setLoading(true);
      await fetchBalance(publicKey);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Alert Section */}
        <div className="rounded-lg border border-gray-700 p-4 bg-gray-800/50 text-gray-200 backdrop-blur-sm transition-all duration-300 hover:bg-gray-800/70">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-400" />
            <h5 className="text-blue-400 font-medium">Solana Devnet</h5>
          </div>
          <p className="mt-2 text-sm text-gray-300">
            {!wallet ? (
              "Please install Phantom Wallet to continue."
            ) : (
              "Connected to Solana Devnet. Use Phantom wallet to interact."
            )}
          </p>
        </div>

        {/* Main Card */}
        <div className="rounded-xl border border-gray-700 bg-gray-800/50 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10">
          <div className="border-b border-gray-700 p-6">
            <div className="flex items-center gap-3 text-xl font-semibold">
              <Wallet className="h-6 w-6 text-blue-400" />
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
                Solana Wallet
              </span>
            </div>
          </div>
          
          <div className="p-6">
            {!connected ? (
              <button 
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-[1.02] text-white font-medium py-3 rounded-md disabled:opacity-50"
                onClick={handleConnect}
                disabled={loading}
              >
                {!wallet ? 'Install Phantom Wallet' : loading ? 'Connecting...' : 'Connect Wallet'}
              </button>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-gray-400">Address</div>
                    <div className="font-mono text-sm break-all text-gray-300">{publicKey}</div>
                  </div>
                  <button 
                    onClick={handleDisconnect}
                    className="px-4 py-2 border border-gray-700 text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
                
                <div className="relative overflow-hidden rounded-xl border border-gray-700 p-6 transition-all duration-300 hover:border-blue-500/50 group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <div className="text-sm text-gray-400">Balance</div>
                    <div className="text-3xl font-bold text-white mt-1">
                      {loading ? 'Loading...' : `${balance.toFixed(4)} SOL`}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      ≈ ${(balance * 123.45).toFixed(2)} USD
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white transition-all duration-300 transform hover:scale-[1.02] py-2 rounded-md flex items-center justify-center disabled:opacity-50"
                    disabled={!connected || loading}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </button>
                  <button 
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white transition-all duration-300 py-2 rounded-md flex items-center justify-center disabled:opacity-50"
                    disabled={!connected || loading}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Receive
                  </button>
                  <button 
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white transition-all duration-300 py-2 rounded-md flex items-center justify-center disabled:opacity-50"
                    onClick={handleRefresh}
                    disabled={!connected || loading}
                  >
                    <RotateCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;