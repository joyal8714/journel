const tradeService = require('../services/tradeService');
const multer = require('multer');
const path = require('path');
const config = require('../config/env');

// Multer config for screenshots
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, config.uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({
  storage,
  limits: { fileSize: config.maxFileSize },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    cb(ext && mime ? null : new Error('Only image files allowed'), ext && mime);
  },
}).single('screenshot');

exports.createTrade = async (req, res, next) => {
  try {
    const trade = await tradeService.createTrade(req.user._id, req.body);
    res.status(201).json({ success: true, data: trade });
  } catch (error) { next(error); }
};

exports.getTrades = async (req, res, next) => {
  try {
    const result = await tradeService.getTrades(req.user._id, req.query);
    res.json({ success: true, ...result });
  } catch (error) { next(error); }
};

exports.getTrade = async (req, res, next) => {
  try {
    const trade = await tradeService.getTradeById(req.params.id, req.user._id);
    if (!trade) return res.status(404).json({ success: false, message: 'Trade not found' });
    res.json({ success: true, data: trade });
  } catch (error) { next(error); }
};

exports.updateTrade = async (req, res, next) => {
  try {
    const trade = await tradeService.updateTrade(req.params.id, req.user._id, req.body);
    if (!trade) return res.status(404).json({ success: false, message: 'Trade not found' });
    res.json({ success: true, data: trade });
  } catch (error) { next(error); }
};

exports.deleteTrade = async (req, res, next) => {
  try {
    const trade = await tradeService.deleteTrade(req.params.id, req.user._id);
    if (!trade) return res.status(404).json({ success: false, message: 'Trade not found' });
    res.json({ success: true, message: 'Trade deleted' });
  } catch (error) { next(error); }
};

exports.uploadScreenshot = (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    try {
      const trade = await tradeService.updateTrade(req.params.id, req.user._id, { screenshot: req.file.filename });
      if (!trade) return res.status(404).json({ success: false, message: 'Trade not found' });
      res.json({ success: true, data: trade });
    } catch (error) { next(error); }
  });
};
