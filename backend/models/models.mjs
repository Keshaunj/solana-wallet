import mongoose from 'mongoose';

// User Schema
const userSchema = new mongoose.Schema({
    walletAddress: { type: String, required: true, unique: true },
    email: { type: String },
    profileImage: { type: String },
    emailNotifications: { type: Boolean, default: false },
    priceAlerts: { type: Boolean, default: false },
    balance: { type: Number, default: 0 },
    tradingStats: {
        totalTrades: { type: Number, default: 0 },
        successfulTrades: { type: Number, default: 0 },
        lastTradeAt: { type: Date }
    },
    transactions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction'
    }],
    createdAt: { type: Date, default: Date.now }
});
// Transaction Schema
const transactionSchema = new mongoose.Schema({
    sender: { type: String, required: true },
    recipient: { type: String, required: true },
    amount: { type: Number, required: true },
    signature: { type: String, required: true, unique: true },
    timestamp: { type: Date, default: Date.now },
    status: { 
        type: String, 
        enum: ['pending', 'confirmed', 'failed'],
        default: 'pending'
    }
});

// Create models
const User = mongoose.model('User', userSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);

export { User, Transaction };