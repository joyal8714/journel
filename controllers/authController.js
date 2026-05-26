const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      data: { user: { id: user._id, name: user.name, email: user.email, settings: user.settings }, token },
    });
  } catch (error) { next(error); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const token = generateToken(user._id);
    res.json({
      success: true,
      data: { user: { id: user._id, name: user.name, email: user.email, settings: user.settings }, token },
    });
  } catch (error) { next(error); }
};

exports.getMe = async (req, res, next) => {
  try {
    res.json({ success: true, data: { id: req.user._id, name: req.user.name, email: req.user.email, settings: req.user.settings } });
  } catch (error) { next(error); }
};

exports.updateSettings = async (req, res, next) => {
  try {
    const { defaultCapital, currency, darkMode, name } = req.body;
    const user = req.user;
    if (name) user.name = name;
    if (defaultCapital !== undefined) user.settings.defaultCapital = defaultCapital;
    if (currency) user.settings.currency = currency;
    if (darkMode !== undefined) user.settings.darkMode = darkMode;
    await user.save();
    res.json({ success: true, data: { id: user._id, name: user.name, email: user.email, settings: user.settings } });
  } catch (error) { next(error); }
};
