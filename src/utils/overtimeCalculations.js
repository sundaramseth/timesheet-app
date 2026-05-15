/**
 * Overtime Calculation Utilities
 * Regular: First 40 hours
 * Overtime: Hours > 40 at 1.5x rate
 */

export const calculateOvertimeBreakdown = (totalHours, hourlyRate) => {
  const REGULAR_HOURS_LIMIT = 40;
  
  const regularHours = Math.min(totalHours, REGULAR_HOURS_LIMIT);
  const overtimeHours = Math.max(0, totalHours - REGULAR_HOURS_LIMIT);
  
  const regularPay = regularHours * hourlyRate;
  const overtimePay = overtimeHours * hourlyRate * 1.5;
  
  return {
    regularHours: parseFloat(regularHours.toFixed(2)),
    overtimeHours: parseFloat(overtimeHours.toFixed(2)),
    regularPay: parseFloat(regularPay.toFixed(2)),
    overtimePay: parseFloat(overtimePay.toFixed(2)),
    totalPay: parseFloat((regularPay + overtimePay).toFixed(2))
  };
};

export const calculatePayroll = (regularHours, overtimeHours, hourlyRate, applySS, applyMedicare, applyFederalTax = false, federalTaxPercent = 0) => {
  const regularPay = regularHours * hourlyRate;
  const overtimePay = overtimeHours * hourlyRate * 1.5;
  const subtotal = regularPay + overtimePay;
  
  const socialSecurityTax = applySS ? (subtotal * 0.062).toFixed(2) : 0;
  const medicareTax = applyMedicare ? (subtotal * 0.0145).toFixed(2) : 0;
  const federalTax = applyFederalTax ? (subtotal * (federalTaxPercent / 100)).toFixed(2) : 0;
  const totalDeductions = parseFloat(socialSecurityTax) + parseFloat(medicareTax) + parseFloat(federalTax);
  const netPay = (subtotal - totalDeductions).toFixed(2);
  
  return {
    regularPay: parseFloat(regularPay.toFixed(2)),
    overtimePay: parseFloat(overtimePay.toFixed(2)),
    subtotal: parseFloat(subtotal.toFixed(2)),
    socialSecurityTax: parseFloat(socialSecurityTax),
    medicareTax: parseFloat(medicareTax),
    federalTax: parseFloat(federalTax),
    totalDeductions: parseFloat(totalDeductions.toFixed(2)),
    netPay: parseFloat(netPay)
  };
};

export const validateHours = (hours) => {
  return !isNaN(hours) && hours >= 0 && isFinite(hours);
};

export const validateNotes = (notes) => {
  return typeof notes === 'string' && notes.length <= 500;
};

export const formatHours = (h) => {
  if (!validateHours(h)) return '0h 0m';
  const hr = Math.floor(h);
  const min = Math.round((h - hr) * 60);
  return `${hr}h ${min}m`;
};
