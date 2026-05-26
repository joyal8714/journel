const router = require('express').Router();
const { exportExcel, exportPDF } = require('../controllers/exportController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/excel', exportExcel);
router.get('/pdf', exportPDF);

module.exports = router;
