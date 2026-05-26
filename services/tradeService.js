const Trade = require('../models/Trade');
const { calculateTradeMetrics } = require('../helpers/calculations');

/**
 * Create a new trade with auto-calculated metrics
 */
const createTrade = async (userId, tradeData) => {
  const metrics = calculateTradeMetrics(tradeData);
  const trade = new Trade({
    ...tradeData,
    ...metrics,
    user: userId,
  });
  return trade.save();
};

/**
 * Update a trade and recalculate metrics
 */
const updateTrade = async (tradeId, userId, tradeData) => {
  const trade = await Trade.findOne({ _id: tradeId, user: userId });
  if (!trade) return null;

  const updatedData = { ...tradeData };
  const metrics = calculateTradeMetrics({
    entryPrice: updatedData.entryPrice || trade.entryPrice,
    exitPrice: updatedData.exitPrice || trade.exitPrice,
    quantity: updatedData.quantity || trade.quantity,
    stopLoss: updatedData.stopLoss !== undefined ? updatedData.stopLoss : trade.stopLoss,
    target: updatedData.target !== undefined ? updatedData.target : trade.target,
    tradeType: updatedData.tradeType || trade.tradeType,
    entryDate: updatedData.entryDate || trade.entryDate,
    exitDate: updatedData.exitDate || trade.exitDate,
  });

  Object.assign(trade, updatedData, metrics);
  return trade.save();
};

/**
 * Get trades with filters and pagination
 */
const getTrades = async (userId, filters = {}) => {
  const query = { user: userId };

  if (filters.strategy) query.strategy = filters.strategy;
  if (filters.status) query.status = filters.status;
  if (filters.tradeType) query.tradeType = filters.tradeType;
  if (filters.sector) query.sector = filters.sector;
  if (filters.stockName) query.stockName = { $regex: filters.stockName, $options: 'i' };

  if (filters.startDate || filters.endDate) {
    query.exitDate = {};
    if (filters.startDate) query.exitDate.$gte = new Date(filters.startDate);
    if (filters.endDate) query.exitDate.$lte = new Date(filters.endDate);
  }

  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 50;
  const skip = (page - 1) * limit;
  const sort = filters.sort || '-exitDate';

  const [trades, total] = await Promise.all([
    Trade.find(query).sort(sort).skip(skip).limit(limit),
    Trade.countDocuments(query),
  ]);

  return {
    trades,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get a single trade
 */
const getTradeById = async (tradeId, userId) => {
  return Trade.findOne({ _id: tradeId, user: userId });
};

/**
 * Delete a trade
 */
const deleteTrade = async (tradeId, userId) => {
  return Trade.findOneAndDelete({ _id: tradeId, user: userId });
};

/**
 * Get all trades for a user (for exports/analytics)
 */
const getAllTrades = async (userId, filters = {}) => {
  const query = { user: userId };
  if (filters.startDate || filters.endDate) {
    query.exitDate = {};
    if (filters.startDate) query.exitDate.$gte = new Date(filters.startDate);
    if (filters.endDate) query.exitDate.$lte = new Date(filters.endDate);
  }
  return Trade.find(query).sort('-exitDate');
};

module.exports = {
  createTrade,
  updateTrade,
  getTrades,
  getTradeById,
  deleteTrade,
  getAllTrades,
};
