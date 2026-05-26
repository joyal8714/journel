const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    stockName: {
      type: String,
      required: [true, 'Stock name is required'],
      trim: true,
      uppercase: true,
    },
    sector: {
      type: String,
      trim: true,
      default: 'General',
    },
    tradeType: {
      type: String,
      enum: ['long', 'short'],
      required: [true, 'Trade type is required'],
    },
    entryDate: {
      type: Date,
      required: [true, 'Entry date is required'],
    },
    exitDate: {
      type: Date,
      required: [true, 'Exit date is required'],
    },
    entryPrice: {
      type: Number,
      required: [true, 'Entry price is required'],
      min: [0, 'Entry price must be positive'],
    },
    exitPrice: {
      type: Number,
      required: [true, 'Exit price is required'],
      min: [0, 'Exit price must be positive'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    stopLoss: {
      type: Number,
      min: [0, 'Stop loss must be positive'],
    },
    target: {
      type: Number,
      min: [0, 'Target must be positive'],
    },
    strategy: {
      type: String,
      trim: true,
      default: 'Manual',
    },
    status: {
      type: String,
      enum: ['win', 'loss', 'breakeven'],
      required: [true, 'Status is required'],
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [500, 'Remarks cannot exceed 500 characters'],
    },
    // Auto-calculated fields
    totalInvestment: { type: Number, default: 0 },
    profitLoss: { type: Number, default: 0 },
    returnPercentage: { type: Number, default: 0 },
    riskRewardRatio: { type: Number, default: 0 },
    holdingDays: { type: Number, default: 0 },
    // Advanced fields
    screenshot: { type: String, default: '' },
    emotion: {
      type: String,
      enum: ['confident', 'fearful', 'greedy', 'calm', 'anxious', 'neutral', ''],
      default: '',
    },
    psychology: { type: String, trim: true, default: '' },
    tags: [{ type: String, trim: true }],
  },
  {
    timestamps: true,
  }
);

// Index for common queries
tradeSchema.index({ user: 1, exitDate: -1 });
tradeSchema.index({ user: 1, strategy: 1 });
tradeSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('Trade', tradeSchema);
