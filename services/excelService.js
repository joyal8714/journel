const ExcelJS = require('exceljs');
const { formatDate } = require('../helpers/formatters');
const { calculateSummaryStats } = require('../helpers/calculations');

/**
 * Generate a formatted Excel workbook from trade data
 */
const generateExcelReport = async (trades, userName = 'Trader') => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Swing Trading Journal';
  workbook.created = new Date();

  // --- Main Trades Sheet ---
  const sheet = workbook.addWorksheet('Trade Journal', {
    properties: { tabColor: { argb: '6366F1' } },
    views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }],
  });

  // Column definitions
  sheet.columns = [
    { header: '#', key: 'sno', width: 5 },
    { header: 'Stock', key: 'stockName', width: 14 },
    { header: 'Sector', key: 'sector', width: 12 },
    { header: 'Type', key: 'tradeType', width: 8 },
    { header: 'Entry Date', key: 'entryDate', width: 13 },
    { header: 'Exit Date', key: 'exitDate', width: 13 },
    { header: 'Entry Price', key: 'entryPrice', width: 12 },
    { header: 'Exit Price', key: 'exitPrice', width: 12 },
    { header: 'Qty', key: 'quantity', width: 8 },
    { header: 'Stop Loss', key: 'stopLoss', width: 11 },
    { header: 'Target', key: 'target', width: 11 },
    { header: 'Investment', key: 'totalInvestment', width: 14 },
    { header: 'P&L', key: 'profitLoss', width: 14 },
    { header: 'Return %', key: 'returnPercentage', width: 10 },
    { header: 'R:R Ratio', key: 'riskRewardRatio', width: 10 },
    { header: 'Days Held', key: 'holdingDays', width: 10 },
    { header: 'Strategy', key: 'strategy', width: 16 },
    { header: 'Status', key: 'status', width: 10 },
    { header: 'Emotion', key: 'emotion', width: 12 },
    { header: 'Remarks', key: 'remarks', width: 25 },
  ];

  // Style header row
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFF' }, size: 11 };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '6366F1' },
  };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
  headerRow.height = 25;

  // Add data rows
  trades.forEach((trade, index) => {
    const row = sheet.addRow({
      sno: index + 1,
      stockName: trade.stockName,
      sector: trade.sector || 'General',
      tradeType: trade.tradeType.toUpperCase(),
      entryDate: formatDate(trade.entryDate),
      exitDate: formatDate(trade.exitDate),
      entryPrice: trade.entryPrice,
      exitPrice: trade.exitPrice,
      quantity: trade.quantity,
      stopLoss: trade.stopLoss || '-',
      target: trade.target || '-',
      totalInvestment: trade.totalInvestment,
      profitLoss: trade.profitLoss,
      returnPercentage: trade.returnPercentage,
      riskRewardRatio: trade.riskRewardRatio,
      holdingDays: trade.holdingDays,
      strategy: trade.strategy || 'Manual',
      status: trade.status.toUpperCase(),
      emotion: trade.emotion || '-',
      remarks: trade.remarks || '',
    });

    // Color-code P&L column
    const plCell = row.getCell('profitLoss');
    if (trade.profitLoss > 0) {
      plCell.font = { color: { argb: '10B981' }, bold: true };
      plCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ECFDF5' } };
    } else if (trade.profitLoss < 0) {
      plCell.font = { color: { argb: 'EF4444' }, bold: true };
      plCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEF2F2' } };
    }

    // Color-code return % column
    const retCell = row.getCell('returnPercentage');
    if (trade.returnPercentage > 0) {
      retCell.font = { color: { argb: '10B981' } };
    } else if (trade.returnPercentage < 0) {
      retCell.font = { color: { argb: 'EF4444' } };
    }

    // Color-code status column
    const statusCell = row.getCell('status');
    if (trade.status === 'win') {
      statusCell.font = { color: { argb: '10B981' }, bold: true };
    } else if (trade.status === 'loss') {
      statusCell.font = { color: { argb: 'EF4444' }, bold: true };
    }

    // Format number cells
    ['entryPrice', 'exitPrice', 'totalInvestment', 'profitLoss'].forEach((col) => {
      row.getCell(col).numFmt = '#,##0.00';
    });
    row.getCell('returnPercentage').numFmt = '0.00"%"';

    // Alternate row colors
    if (index % 2 === 0) {
      row.eachCell({ includeEmpty: true }, (cell) => {
        if (!cell.fill || !cell.fill.fgColor || cell.fill.fgColor.argb === undefined) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F9FAFB' } };
        }
      });
    }
  });

  // Add borders to all data cells
  const totalRows = trades.length + 1;
  for (let row = 1; row <= totalRows; row++) {
    const r = sheet.getRow(row);
    r.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'E5E7EB' } },
        left: { style: 'thin', color: { argb: 'E5E7EB' } },
        bottom: { style: 'thin', color: { argb: 'E5E7EB' } },
        right: { style: 'thin', color: { argb: 'E5E7EB' } },
      };
    });
  }

  // --- Summary Section ---
  const stats = calculateSummaryStats(trades);
  const summaryStartRow = trades.length + 3;

  const summaryTitle = sheet.getRow(summaryStartRow);
  summaryTitle.getCell(1).value = '📊 SUMMARY';
  summaryTitle.getCell(1).font = { bold: true, size: 14, color: { argb: '6366F1' } };
  sheet.mergeCells(summaryStartRow, 1, summaryStartRow, 4);

  const summaryData = [
    ['Total Trades', stats.totalTrades],
    ['Total Wins', stats.totalWins],
    ['Total Losses', stats.totalLosses],
    ['Win Rate', `${stats.winRate}%`],
    ['Total P&L', stats.totalProfitLoss],
    ['Average Gain', stats.averageGain],
    ['Average Loss', stats.averageLoss],
    ['Average Return %', `${stats.averageReturn}%`],
    ['Profit Factor', stats.profitFactor],
    ['Avg Holding Days', stats.averageHoldingDays],
    ['Best Trade', stats.bestTrade ? `${stats.bestTrade.stockName} (₹${stats.bestTrade.profitLoss})` : 'N/A'],
    ['Worst Trade', stats.worstTrade ? `${stats.worstTrade.stockName} (₹${stats.worstTrade.profitLoss})` : 'N/A'],
  ];

  summaryData.forEach((item, idx) => {
    const row = sheet.getRow(summaryStartRow + 1 + idx);
    row.getCell(1).value = item[0];
    row.getCell(1).font = { bold: true, size: 10 };
    row.getCell(2).value = item[1];
    row.getCell(2).font = { size: 10 };

    if (typeof item[1] === 'number') {
      if (item[1] > 0 && item[0].includes('P&L')) {
        row.getCell(2).font = { color: { argb: '10B981' }, bold: true, size: 10 };
      } else if (item[1] < 0 && item[0].includes('P&L')) {
        row.getCell(2).font = { color: { argb: 'EF4444' }, bold: true, size: 10 };
      }
    }
  });

  return workbook;
};

module.exports = { generateExcelReport };
