import { Router } from 'express';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { User } from '../models/models.mjs';

const router = Router();

// Create new wallet
router.post('/create', async (req, res) => {
    try {
        const { username, walletAddress } = req.body;
        
        // Check if wallet address is valid
        try {
            new PublicKey(walletAddress);
        } catch (error) {
            return res.status(400).json({
                success: false,
                error: 'Invalid wallet address'
            });
        }

        // Check if username or wallet address already exists
        const existingUser = await User.findOne({
            $or: [
                { username: username },
                { walletAddress: walletAddress }
            ]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: existingUser.username === username ? 
                    'Username already taken' : 'Wallet address already registered'
            });
        }

        const user = new User({
            username,
            walletAddress,
            watchlist: [],
            alerts: []
        });
        await user.save();
        res.status(201).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get wallet balance
router.get('/balance/:walletAddress', async (req, res) => {
    try {
        if (!process.env.SOLANA_RPC_URL) {
            throw new Error('Solana RPC URL not configured');
        }

        const { walletAddress } = req.params;
        
        // Validate wallet address
        try {
            const pubKey = new PublicKey(walletAddress);
            const connection = new Connection(process.env.SOLANA_RPC_URL);
            const balance = await connection.getBalance(pubKey);
            
            // Update user's balance in database
            await User.findOneAndUpdate(
                { walletAddress },
                { balance: balance / LAMPORTS_PER_SOL },
                { new: true }
            );
            
            res.json({
                success: true,
                balance: balance / LAMPORTS_PER_SOL
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                error: 'Invalid wallet address'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get wallet info with transactions
router.get('/:walletAddress', async (req, res) => {
    try {
        const { walletAddress } = req.params;
        
        // Validate wallet address
        try {
            new PublicKey(walletAddress);
        } catch (error) {
            return res.status(400).json({
                success: false,
                error: 'Invalid wallet address'
            });
        }

        const user = await User.findOne({ walletAddress })
            .populate({
                path: 'transactions',
                options: { 
                    sort: { timestamp: -1 },
                    limit: 10
                }
            });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Wallet not found'
            });
        }
        
        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Update wallet info
router.put('/:walletAddress', async (req, res) => {
    try {
        const { walletAddress } = req.params;
        const { username } = req.body;

        // Validate wallet address
        try {
            new PublicKey(walletAddress);
        } catch (error) {
            return res.status(400).json({
                success: false,
                error: 'Invalid wallet address'
            });
        }

        const user = await User.findOneAndUpdate(
            { walletAddress },
            { username },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Wallet not found'
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Delete wallet and associated data
router.delete('/:walletAddress', async (req, res) => {
    try {
        const { walletAddress } = req.params;
        
        // Validate wallet address
        try {
            new PublicKey(walletAddress);
        } catch (error) {
            return res.status(400).json({
                success: false,
                error: 'Invalid wallet address'
            });
        }

        const user = await User.findOneAndDelete({ walletAddress });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Wallet not found'
            });
        }

        res.json({
            success: true,
            message: 'Wallet disconnected and data removed',
            data: {
                walletAddress: user.walletAddress,
                disconnectedAt: new Date().toISOString()
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;