const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const messages = error.details.map((detail) => detail.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages,
      });
    }
    next();
  };
};

// Validation schemas
const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const tradeSchema = Joi.object({
  stockName: Joi.string().trim().required(),
  sector: Joi.string().trim().allow(''),
  tradeType: Joi.string().valid('long', 'short').required(),
  entryDate: Joi.date().required(),
  exitDate: Joi.date().required(),
  entryPrice: Joi.number().positive().required(),
  exitPrice: Joi.number().positive().required(),
  quantity: Joi.number().integer().min(1).required(),
  stopLoss: Joi.number().positive().allow(0, null),
  target: Joi.number().positive().allow(0, null),
  strategy: Joi.string().trim().allow(''),
  status: Joi.string().valid('win', 'loss', 'breakeven').required(),
  remarks: Joi.string().trim().max(500).allow(''),
  emotion: Joi.string().valid('confident', 'fearful', 'greedy', 'calm', 'anxious', 'neutral', '').allow(''),
  psychology: Joi.string().trim().allow(''),
  tags: Joi.array().items(Joi.string().trim()),
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  tradeSchema,
};
