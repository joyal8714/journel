const router = require('express').Router();
const ctrl = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/summary', ctrl.getSummary);
router.get('/monthly', ctrl.getMonthlyPerformance);
router.get('/equity-curve', ctrl.getEquityCurve);
router.get('/strategies', ctrl.getStrategyPerformance);
router.get('/sectors', ctrl.getSectorPerformance);
router.get('/ai-insights', ctrl.getAIInsights);

module.exports = router;
