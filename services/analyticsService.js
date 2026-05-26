const Trade = require('../models/Trade');
const { calculateSummaryStats } = require('../helpers/calculations');

/**
 * Get overall summary statistics
 */
const getSummary = async (userId) => {
  const trades = await Trade.find({ user: userId });
  return calculateSummaryStats(trades);
};

/**
 * Get monthly performance breakdown
 */
const getMonthlyPerformance = async (userId) => {
  const result = await Trade.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: {
          year: { $year: '$exitDate' },
          month: { $month: '$exitDate' },
        },
        totalPL: { $sum: '$profitLoss' },
        totalTrades: { $sum: 1 },
        wins: { $sum: { $cond: [{ $eq: ['$status', 'win'] }, 1, 0] } },
        losses: { $sum: { $cond: [{ $eq: ['$status', 'loss'] }, 1, 0] } },
        avgReturn: { $avg: '$returnPercentage' },
        totalInvestment: { $sum: '$totalInvestment' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return result.map((item) => ({
    month: `${months[item._id.month]} ${item._id.year}`,
    year: item._id.year,
    monthNum: item._id.month,
    totalPL: parseFloat(item.totalPL.toFixed(2)),
    totalTrades: item.totalTrades,
    wins: item.wins,
    losses: item.losses,
    winRate: parseFloat(((item.wins / item.totalTrades) * 100).toFixed(2)),
    avgReturn: parseFloat(item.avgReturn.toFixed(2)),
    totalInvestment: parseFloat(item.totalInvestment.toFixed(2)),
  }));
};

/**
 * Get equity curve data (cumulative P&L over time)
 */
const getEquityCurve = async (userId, initialCapital = 100000) => {
  const trades = await Trade.find({ user: userId }).sort('exitDate');

  let cumulative = initialCapital;
  const curve = [{ date: trades.length > 0 ? trades[0].entryDate : new Date(), capital: initialCapital, trade: 'Initial' }];

  trades.forEach((trade) => {
    cumulative += trade.profitLoss;
    curve.push({
      date: trade.exitDate,
      capital: parseFloat(cumulative.toFixed(2)),
      trade: trade.stockName,
      pl: trade.profitLoss,
    });
  });

  return curve;
};

/**
 * Get strategy-wise performance
 */
const getStrategyPerformance = async (userId) => {
  const result = await Trade.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: '$strategy',
        totalTrades: { $sum: 1 },
        totalPL: { $sum: '$profitLoss' },
        wins: { $sum: { $cond: [{ $eq: ['$status', 'win'] }, 1, 0] } },
        losses: { $sum: { $cond: [{ $eq: ['$status', 'loss'] }, 1, 0] } },
        avgReturn: { $avg: '$returnPercentage' },
        avgRiskReward: { $avg: '$riskRewardRatio' },
      },
    },
    { $sort: { totalPL: -1 } },
  ]);

  return result.map((item) => ({
    strategy: item._id || 'Unknown',
    totalTrades: item.totalTrades,
    totalPL: parseFloat(item.totalPL.toFixed(2)),
    wins: item.wins,
    losses: item.losses,
    winRate: parseFloat(((item.wins / item.totalTrades) * 100).toFixed(2)),
    avgReturn: parseFloat(item.avgReturn.toFixed(2)),
    avgRiskReward: parseFloat((item.avgRiskReward || 0).toFixed(2)),
  }));
};

/**
 * Get sector-wise performance
 */
const getSectorPerformance = async (userId) => {
  const result = await Trade.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: '$sector',
        totalTrades: { $sum: 1 },
        totalPL: { $sum: '$profitLoss' },
        wins: { $sum: { $cond: [{ $eq: ['$status', 'win'] }, 1, 0] } },
        avgReturn: { $avg: '$returnPercentage' },
      },
    },
    { $sort: { totalPL: -1 } },
  ]);

  return result.map((item) => ({
    sector: item._id || 'General',
    totalTrades: item.totalTrades,
    totalPL: parseFloat(item.totalPL.toFixed(2)),
    wins: item.wins,
    winRate: parseFloat(((item.wins / item.totalTrades) * 100).toFixed(2)),
    avgReturn: parseFloat(item.avgReturn.toFixed(2)),
  }));
};

module.exports = {
  getSummary,
  getMonthlyPerformance,
  getEquityCurve,
  getStrategyPerformance,
  getSectorPerformance,
};
