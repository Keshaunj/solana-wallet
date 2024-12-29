// server.js
import express from 'express';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Solana connection
const connection = new Connection(
  process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  'confirmed'
);

// Test endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' });
});



// Get wallet balance
app.get('/api/balance/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const publicKey = new PublicKey(address);
    const balance = await connection.getBalance(publicKey);
    
    res.json({
      sol: balance / LAMPORTS_PER_SOL,
      lamports: balance,
      address
    });
  } catch (error) {
    res.status(400).json({ 
      error: 'Invalid address or network error',
      details: error.message 
    });
  }
});

// Get recent transactions
app.get('/api/transactions/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const publicKey = new PublicKey(address);
    const transactions = await connection.getSignaturesForAddress(
      publicKey,
      { limit: 10 }
    );
    
    res.json({ transactions });
  } catch (error) {
    res.status(400).json({ 
      error: 'Failed to fetch transactions',
      details: error.message 
    });
  }
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Connected to Solana ${process.env.SOLANA_RPC_URL || 'devnet'}`);
});