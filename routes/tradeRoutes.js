const router = require('express').Router();
const { createTrade, getTrades, getTrade, updateTrade, deleteTrade, uploadScreenshot } = require('../controllers/tradeController');
const { protect } = require('../middleware/auth');
const { validate, tradeSchema } = require('../middleware/validate');

router.use(protect);

router.route('/')
  .post(validate(tradeSchema), createTrade)
  .get(getTrades);

router.route('/:id')
  .get(getTrade)
  .put(updateTrade)
  .delete(deleteTrade);

router.post('/:id/screenshot', uploadScreenshot);

module.exports = router;
