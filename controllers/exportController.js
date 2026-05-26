const { generateExcelReport } = require('../services/excelService');
const { generatePDFReport } = require('../services/pdfService');
const tradeService = require('../services/tradeService');

exports.exportExcel = async (req, res, next) => {
  try {
    const trades = await tradeService.getAllTrades(req.user._id, req.query);
    const workbook = await generateExcelReport(trades, req.user.name);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=trading_journal_${Date.now()}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) { next(error); }
};

exports.exportPDF = async (req, res, next) => {
  try {
    const trades = await tradeService.getAllTrades(req.user._id, req.query);
    const doc = generatePDFReport(trades, req.user.name);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=trading_report_${Date.now()}.pdf`);
    doc.pipe(res);
    doc.end();
  } catch (error) { next(error); }
};
