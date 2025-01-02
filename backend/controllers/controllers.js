import { User, Token, TradingPair, PumpMetrics } from './models/models.js';

export const createUser = async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const addToken = async (req, res) => {
  try {
    const token = new Token(req.body);
    await token.save();
    res.status(201).json(token);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getTokens = async (req, res) => {
  try {
    const tokens = await Token.find();
    res.json(tokens);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const addTradingPair = async (req, res) => {
  try {
    const pair = new TradingPair(req.body);
    await pair.save();
    res.status(201).json(pair);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getTradingPairs = async (req, res) => {
  try {
    const pairs = await TradingPair.find()
      .populate('baseToken')
      .populate('quoteToken');
    res.json(pairs);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const addPumpMetrics = async (req, res) => {
  try {
    const metrics = new PumpMetrics(req.body);
    await metrics.save();
    res.status(201).json(metrics);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getPumpMetrics = async (req, res) => {
  try {
    const metrics = await PumpMetrics.find()
      .populate('pairId');
    res.json(metrics);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const addToWatchlist = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    user.watchlist.push(req.body.pairId);
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const removeFromWatchlist = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    user.watchlist = user.watchlist.filter(id => id !== req.params.pairId);
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const createAlert = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    user.alerts.push(req.body);
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateAlert = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const alert = user.alerts.id(req.params.alertId);
    if (!alert) return res.status(404).json({ error: 'Alert not found' });
    
    Object.assign(alert, req.body);
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};