import { Router } from 'express';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { User } from '../models/models.js';

const router = Router();

// Create new wallet
router.post('/create', async (req, res) => {
    try {
        const { username, walletAddress } = req.body;
        const user = new User({
            username,
            walletAddress
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
        const connection = new Connection(process.env.SOLANA_RPC_URL);
        const { walletAddress } = req.params;
        const pubKey = new PublicKey(walletAddress);
        const balance = await connection.getBalance(pubKey);
        
        res.json({
            success: true,
            balance: balance / LAMPORTS_PER_SOL
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get wallet info
router.get('/:walletAddress', async (req, res) => {
    try {
        const { walletAddress } = req.params;
        const user = await User.findOne({ walletAddress });
        
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

export default router;