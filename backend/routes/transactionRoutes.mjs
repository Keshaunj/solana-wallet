import { Router } from 'express';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Transaction, User } from '../models/models.mjs';

const router = Router();

// Middleware to validate Solana wallet address
const validateWalletAddress = (req, res, next) => {
    const { walletAddress } = req.params;
    try {
        new PublicKey(walletAddress);
        next();
    } catch (error) {
        res.status(400).json({
            success: false,
            error: 'Invalid wallet address format'
        });
    }
};

// Submit transaction
router.post('/submit', async (req, res) => {
    try {
        const { sender, recipient, amount, signature, token } = req.body;

        // Validate input
        if (!sender || !recipient || !amount || !signature) {
            return res.status(400).json({
                success: false,
                error: 'Missing required transaction details'
            });
        }

        // Validate amounts
        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid transaction amount'
            });
        }

        const transaction = new Transaction({
            sender,
            recipient,
            amount,
            signature,
            token,
            timestamp: new Date()
        });

        await transaction.save();

        res.status(201).json({
            success: true,
            data: transaction
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get transaction history for a wallet
router.get('/history/:walletAddress', validateWalletAddress, async (req, res) => {
    try {
        const { walletAddress } = req.params;
        const { limit = 50, offset = 0 } = req.query;

        const transactions = await Transaction.find({
            $or: [
                { sender: walletAddress },
                { recipient: walletAddress }
            ]
        })
        .sort({ timestamp: -1 })
        .limit(Number(limit))
        .skip(Number(offset));

        const totalTransactions = await Transaction.countDocuments({
            $or: [
                { sender: walletAddress },
                { recipient: walletAddress }
            ]
        });

        res.json({
            success: true,
            data: transactions,
            pagination: {
                total: totalTransactions,
                limit: Number(limit),
                offset: Number(offset)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get transaction status
router.get('/status/:signature', async (req, res) => {
    try {
        if (!process.env.SOLANA_RPC_URL) {
            throw new Error('Solana RPC URL not configured');
        }

        const connection = new Connection(process.env.SOLANA_RPC_URL);
        const { signature } = req.params;

        const transaction = await Transaction.findOne({ signature });
        
        if (!transaction) {
            return res.status(404).json({
                success: false,
                error: 'Transaction not found'
            });
        }
        
        const status = await connection.getSignatureStatus(signature);
        
        res.json({
            success: true,
            data: {
                dbStatus: transaction.status,
                networkStatus: status,
                signature,
                timestamp: transaction.timestamp
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Update trading stats
router.post('/trading-stats/:walletAddress', validateWalletAddress, async (req, res) => {
    try {
        const { walletAddress } = req.params;
        const { 
            success, 
            tradeType, 
            amount, 
            pair, 
            token 
        } = req.body;

        // Validate input
        if (typeof success !== 'boolean') {
            return res.status(400).json({ 
                success: false, 
                error: 'Success must be a boolean' 
            });
        }

        const user = await User.findOne({ walletAddress });
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                error: 'User not found' 
            });
        }

        // Initialize tradingStats if not exists
        if (!user.tradingStats) {
            user.tradingStats = {
                totalTrades: 0,
                successfulTrades: 0,
                lastTradeAt: null,
                tradeHistory: []
            };
        }

        // Update trading stats
        user.tradingStats.totalTrades += 1;
        
        if (success) {
            user.tradingStats.successfulTrades += 1;
        }

        user.tradingStats.lastTradeAt = new Date();

        // Track detailed trade history
        user.tradingStats.tradeHistory.push({
            timestamp: new Date(),
            success,
            tradeType,
            amount,
            pair,
            token
        });

        // Limit trade history to last 100 trades
        if (user.tradingStats.tradeHistory.length > 100) {
            user.tradingStats.tradeHistory.shift();
        }

        await user.save();

        // Calculate success rate
        const successRate = user.tradingStats.totalTrades > 0 
            ? (user.tradingStats.successfulTrades / user.tradingStats.totalTrades) * 100 
            : 0;

        res.json({
            success: true,
            tradingStats: {
                ...user.tradingStats,
                successRate: successRate.toFixed(2)
            }
        });
    } catch (error) {
        console.error('Trading stats update error:', {
            walletAddress: req.params.walletAddress,
            error: error.message
        });

        res.status(500).json({ 
            success: false, 
            error: 'Internal server error while updating trading stats',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

export default router;