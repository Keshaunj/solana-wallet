import mongoose from 'mongoose';

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    walletAddress: { type: String, required: true, unique: true },
    balance: { type: Number, default: 0 },
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