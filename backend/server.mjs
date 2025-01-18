import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import walletRoutes from './routes/walletRoutes.mjs';
import transactionRoutes from './routes/transactionRoutes.mjs';
import watchlistRoutes from './routes/watchlistRoutes.mjs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware - Critical for protecting against various attacks
app.use(helmet()); // Sets secure HTTP headers

// Rate limiting - Prevents DDoS and brute force
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// MongoDB connection with enhanced security options
// Simplified MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000
})
.then(() => console.log('MongoDB Connected Successfully'))
.catch((error) => {
    console.error('MongoDB Connection Failed');
    process.exit(1);
});
// Body parsers with size limits
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Security Middleware
app.use(mongoSanitize()); // Prevents NoSQL injection attacks
app.use(xss()); // Sanitizes user input
app.use(hpp()); // Prevents HTTP Parameter Pollution

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 600
}));

// Development logging
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.path}`);
        next();
    });
}

// Request timeout middleware
const routeTimeout = (req, res, next) => {
    res.setTimeout(5000, () => {
        res.status(408).json({
            status: 'error',
            message: 'Request timeout'
        });
    });
    next();
};

// Routes with timeouts and rate limiting
app.use('/api/wallet', routeTimeout, limiter, walletRoutes);
app.use('/api/transaction', routeTimeout, limiter, transactionRoutes);
app.use('/api/watchlist', routeTimeout, limiter, watchlistRoutes);

// Health check with separate rate limiter
const healthCheckLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5
});

app.get('/health', healthCheckLimiter, (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Route not found'
    });
});

// Error handler
app.use((err, req, res, next) => {
    const sanitizedError = {
        message: 'An error occurred',
        path: req.path,
        timestamp: new Date().toISOString()
    };

    console.error('Error:', {
        ...sanitizedError,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });

    res.status(err.statusCode || 500).json({
        status: 'error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred',
        error: process.env.NODE_ENV === 'development' ? sanitizedError : {}
    });
});

// Start server
const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
    console.log(`${signal} received. Starting graceful shutdown`);
    
    server.close(() => {
        console.log('HTTP server closed');
    });

    try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
        process.exit(0);
    } catch (err) {
        console.error('Error during shutdown:', err);
        process.exit(1);
    }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions and rejections
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception. Shutting down...');
    console.error(err.name, err.message);
    process.exit(1);
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection. Shutting down...');
    console.error(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});