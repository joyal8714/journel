const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config/env');

const generateInsights = async (trades, stats) => {
  if (!config.geminiApiKey) {
    return { insights: ['AI insights unavailable - no API key configured.'] };
  }

  try {
    const genAI = new GoogleGenerativeAI(config.geminiApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const tradesSummary = trades.slice(0, 50).map(t => ({
      stock: t.stockName, type: t.tradeType, strategy: t.strategy,
      pl: t.profitLoss, ret: t.returnPercentage, status: t.status,
      holdDays: t.holdingDays, rr: t.riskRewardRatio, emotion: t.emotion,
      sector: t.sector,
    }));

    const prompt = `You are a professional swing trading coach. Analyze this trader's recent performance and provide 5-7 actionable insights.

Stats: ${JSON.stringify(stats)}
Recent trades: ${JSON.stringify(tradesSummary)}

Focus on:
1. Best performing strategies and when to use them
2. Overtrading or undertrading patterns
3. Risk management observations
4. Emotional/psychological patterns if available
5. Sector allocation advice
6. Specific improvement suggestions

Return as a JSON array of strings, each being one insight. Keep each insight to 1-2 sentences. Be specific with numbers.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const insights = JSON.parse(cleaned);
    return { insights: Array.isArray(insights) ? insights : [insights] };
  } catch (error) {
    console.error('AI Insights error:', error.message);
    return {
      insights: [
        `Win rate: ${stats.winRate}%. ${stats.winRate >= 50 ? 'Above average' : 'Focus on improving entry criteria'}.`,
        `Average gain (₹${stats.averageGain}) vs loss (₹${stats.averageLoss}). ${stats.averageGain > stats.averageLoss ? 'Good risk-reward' : 'Consider tighter stop losses'}.`,
        `Profit factor: ${stats.profitFactor}. ${stats.profitFactor >= 1.5 ? 'Solid edge' : 'Work on improving winners or cutting losers faster'}.`,
      ],
    };
  }
};

module.exports = { generateInsights };
