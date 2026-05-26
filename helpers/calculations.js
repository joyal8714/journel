/**
 * Calculate trade metrics from trade data
 */
const calculateTradeMetrics = (trade) => {
  const { entryPrice, exitPrice, quantity, stopLoss, target, tradeType, entryDate, exitDate } = trade;

  const totalInvestment = entryPrice * quantity;

  let profitLoss;
  if (tradeType === 'long') {
    profitLoss = (exitPrice - entryPrice) * quantity;
  } else {
    profitLoss = (entryPrice - exitPrice) * quantity;
  }

  const returnPercentage = totalInvestment > 0 ? ((profitLoss / totalInvestment) * 100) : 0;

  let riskRewardRatio = 0;
  if (stopLoss && target) {
    if (tradeType === 'long') {
      const risk = entryPrice - stopLoss;
      const reward = target - entryPrice;
      riskRewardRatio = risk > 0 ? parseFloat((reward / risk).toFixed(2)) : 0;
    } else {
      const risk = stopLoss - entryPrice;
      const reward = entryPrice - target;
      riskRewardRatio = risk > 0 ? parseFloat((reward / risk).toFixed(2)) : 0;
    }
  }

  const entry = new Date(entryDate);
  const exit = new Date(exitDate);
  const holdingDays = Math.max(0, Math.ceil((exit - entry) / (1000 * 60 * 60 * 24)));

  return {
    totalInvestment: parseFloat(totalInvestment.toFixed(2)),
    profitLoss: parseFloat(profitLoss.toFixed(2)),
    returnPercentage: parseFloat(returnPercentage.toFixed(2)),
    riskRewardRatio,
    holdingDays,
  };
};

/**
 * Calculate summary statistics from an array of trades
 */
const calculateSummaryStats = (trades) => {
  if (!trades || trades.length === 0) {
    return {
      totalTrades: 0,
      totalWins: 0,
      totalLosses: 0,
      winRate: 0,
      totalProfitLoss: 0,
      totalInvestment: 0,
      averageGain: 0,
      averageLoss: 0,
      averageReturn: 0,
      bestTrade: null,
      worstTrade: null,
      averageHoldingDays: 0,
      profitFactor: 0,
    };
  }

  const totalTrades = trades.length;
  const wins = trades.filter((t) => t.status === 'win');
  const losses = trades.filter((t) => t.status === 'loss');
  const totalWins = wins.length;
  const totalLosses = losses.length;
  const winRate = parseFloat(((totalWins / totalTrades) * 100).toFixed(2));

  const totalProfitLoss = parseFloat(trades.reduce((sum, t) => sum + t.profitLoss, 0).toFixed(2));
  const totalInvestment = parseFloat(trades.reduce((sum, t) => sum + t.totalInvestment, 0).toFixed(2));

  const totalGains = wins.reduce((sum, t) => sum + t.profitLoss, 0);
  const totalLossAmount = Math.abs(losses.reduce((sum, t) => sum + t.profitLoss, 0));

  const averageGain = totalWins > 0 ? parseFloat((totalGains / totalWins).toFixed(2)) : 0;
  const averageLoss = totalLosses > 0 ? parseFloat((totalLossAmount / totalLosses).toFixed(2)) : 0;
  const averageReturn = parseFloat((trades.reduce((sum, t) => sum + t.returnPercentage, 0) / totalTrades).toFixed(2));

  const sorted = [...trades].sort((a, b) => b.profitLoss - a.profitLoss);
  const bestTrade = sorted[0];
  const worstTrade = sorted[sorted.length - 1];

  const averageHoldingDays = parseFloat((trades.reduce((sum, t) => sum + t.holdingDays, 0) / totalTrades).toFixed(1));

  const profitFactor = totalLossAmount > 0 ? parseFloat((totalGains / totalLossAmount).toFixed(2)) : totalGains > 0 ? Infinity : 0;

  return {
    totalTrades,
    totalWins,
    totalLosses,
    winRate,
    totalProfitLoss,
    totalInvestment,
    averageGain,
    averageLoss,
    averageReturn,
    bestTrade: bestTrade ? { stockName: bestTrade.stockName, profitLoss: bestTrade.profitLoss } : null,
    worstTrade: worstTrade ? { stockName: worstTrade.stockName, profitLoss: worstTrade.profitLoss } : null,
    averageHoldingDays,
    profitFactor,
  };
};

module.exports = { calculateTradeMetrics, calculateSummaryStats };
