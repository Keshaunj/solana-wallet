import { Router } from 'express';
import { Connection, PublicKey } from '@solana/web3.js';
import { Transaction } from '../models/models.js';

const router = Router();

// Submit transaction
router.post('/submit', async (req, res) => {
    try {
        const { sender, recipient, amount, signature } = req.body;
        const transaction = new Transaction({
            sender,
            recipient,
            amount,
            signature
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
router.get('/history/:walletAddress', async (req, res) => {
    try {
        const { walletAddress } = req.params;
        const transactions = await Transaction.find({
            $or: [
                { sender: walletAddress },
                { recipient: walletAddress }
            ]
        }).sort({ timestamp: -1 });
        
        res.json({
            success: true,
            data: transactions
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
                networkStatus: status
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