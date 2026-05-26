const analyticsService = require('../services/analyticsService');
const aiService = require('../services/aiService');
const Trade = require('../models/Trade');
const { calculateSummaryStats } = require('../helpers/calculations');
const mongoose = require('mongoose');

exports.getSummary = async (req, res, next) => {
  try {
    const stats = await analyticsService.getSummary(req.user._id);
    res.json({ success: true, data: stats });
  } catch (error) { next(error); }
};

exports.getMonthlyPerformance = async (req, res, next) => {
  try {
    const data = await analyticsService.getMonthlyPerformance(
      new mongoose.Types.ObjectId(req.user._id)
    );
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.getEquityCurve = async (req, res, next) => {
  try {
    const capital = req.user.settings?.defaultCapital || 100000;
    const data = await analyticsService.getEquityCurve(req.user._id, capital);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.getStrategyPerformance = async (req, res, next) => {
  try {
    const data = await analyticsService.getStrategyPerformance(
      new mongoose.Types.ObjectId(req.user._id)
    );
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.getSectorPerformance = async (req, res, next) => {
  try {
    const data = await analyticsService.getSectorPerformance(
      new mongoose.Types.ObjectId(req.user._id)
    );
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.getAIInsights = async (req, res, next) => {
  try {
    const trades = await Trade.find({ user: req.user._id }).sort('-exitDate').limit(50);
    const stats = calculateSummaryStats(trades);
    const data = await aiService.generateInsights(trades, stats);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};
