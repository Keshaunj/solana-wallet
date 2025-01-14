import { Router } from 'express';
import { User } from '../models/models.js';
import { body, validationResult } from 'express-validator';

const router = Router();

// Add token to watchlist
router.post('/add', [
    body('walletAddress').isString().withMessage('Wallet address must be a string'),
    body('pair').isString().withMessage('Token pair must be a string'),
    body('targetPrice').isFloat({ gt: 0 }).withMessage('Target price must be a positive number')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const { walletAddress, pair, targetPrice } = req.body;
        const user = await User.findOne({ walletAddress });
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        user.watchlist = user.watchlist || [];
        user.watchlist.push({ pair, targetPrice });
        await user.save();

        res.status(201).json({ success: true, data: user.watchlist });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get watchlist for a user
router.get('/:walletAddress', async (req, res) => {
    try {
        const { walletAddress } = req.params;
        const user = await User.findOne({ walletAddress });
        
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.json({ success: true, data: user.watchlist || [] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Remove token from watchlist
router.delete('/:walletAddress/:pair', async (req, res) => {
    try {
        const { walletAddress, pair } = req.params;

        const user = await User.findOne({ walletAddress });
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Remove the pair from watchlist
        user.watchlist = user.watchlist.filter(item => item.pair !== pair);
        await user.save();

        res.json({ success: true, data: user.watchlist });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
