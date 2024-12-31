import express from 'express';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import argon2 from 'argon2';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'SOLANA_RPC_URL'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

// MongoDB Connection with retry logic
const connectToMongoDB = async (retries = 5, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✓ MongoDB Connected Successfully!');
      return;
    } catch (err) {
      console.error(`MongoDB connection attempt ${i + 1} failed:`, err.message);
      if (i < retries - 1) {
        console.log(`Retrying in ${delay/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  console.error('Failed to connect to MongoDB after multiple attempts');
  process.exit(1);
};

// User Model
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  walletAddresses: [String],
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Initialize Solana connection
const connection = new Connection(
  process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  'confirmed'
);

// Middleware to handle async errors
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Test MongoDB Connection
app.get('/api/test/mongodb', asyncHandler(async (req, res) => {
  const testUser = new User({
    email: `test_${Date.now()}@test.com`,
    password: 'test_password'
  });
  await testUser.save();
  await User.deleteOne({ _id: testUser._id });
  res.json({ success: true, message: 'MongoDB is connected and working!' });
}));

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Auth Routes
app.post('/api/register', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const hashedPassword = await argon2.hash(password);
  const user = new User({
    email,
    password: hashedPassword
  });

  await user.save();
  res.json({ success: true, message: 'Registration successful' });
}));

app.post('/api/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const validPassword = await argon2.verify(user.password, password);
  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  res.json({ 
    success: true,
    user: {
      email: user.email,
      walletAddresses: user.walletAddresses
    }
  });
}));

// Wallet Routes
app.post('/api/wallet/link', asyncHandler(async (req, res) => {
  const { email, walletAddress } = req.body;
  
  if (!email || !walletAddress) {
    return res.status(400).json({ error: 'Email and wallet address are required' });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (!user.walletAddresses.includes(walletAddress)) {
    user.walletAddresses.push(walletAddress);
    await user.save();
  }

  res.json({ success: true, walletAddresses: user.walletAddresses });
}));

// Get wallet balance
app.get('/api/balance/:address', asyncHandler(async (req, res) => {
  const { address } = req.params;
  
  try {
    const publicKey = new PublicKey(address);
    const balance = await connection.getBalance(publicKey);
    
    res.json({
      sol: balance / LAMPORTS_PER_SOL,
      lamports: balance,
      address
    });
  } catch (error) {
    res.status(400).json({ error: 'Invalid wallet address' });
  }
}));

// Get recent transactions
app.get('/api/transactions/:address', asyncHandler(async (req, res) => {
  const { address } = req.params;
  
  try {
    const publicKey = new PublicKey(address);
    const transactions = await connection.getSignaturesForAddress(
      publicKey,
      { limit: 10 }
    );
    
    res.json({ transactions });
  } catch (error) {
    res.status(400).json({ error: 'Invalid wallet address' });
  }
}));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Connect to MongoDB
connectToMongoDB().catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Connected to Solana ${process.env.SOLANA_RPC_URL || 'devnet'}`);
});