import React from 'react';

export default function PaystubDisplay({ 
  employeeName, 
  employeeEmail,
  regularHours,
  overtimeHours,
  regularPay,
  overtimePay,
  totalPay,
  socialSecurityTax,
  medicareTax,
  federalTax,
  totalDeductions,
  netPay,
  notes,
  weekStart,
  weekEnd,
  applySS,
  applyMedicare,
  applyFederalTax
}) {
  return (
    <div id="paystub" className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-6 text-blue-600">Paystub Summary</h2>

      {/* Employee Info */}
      <div className="mb-4 pb-4 border-b">
        <p><b>Name:</b> {employeeName}</p>
        <p><b>Email:</b> {employeeEmail}</p>
        {weekStart && weekEnd && (
          <p><b>Period:</b> {weekStart} to {weekEnd}</p>
        )}
      </div>

      {/* Hours Section */}
      <div className="mb-4 pb-4 border-b">
        <h3 className="font-semibold text-blue-600 mb-3">Hours Worked</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-3 rounded">
            <p className="text-gray-600 text-sm">Regular Hours</p>
            <p className="text-lg font-bold">{regularHours.toFixed(2)}h</p>
          </div>
          <div className="bg-orange-50 p-3 rounded border-2 border-orange-200">
            <p className="text-gray-600 text-sm">Overtime Hours (1.5x)</p>
            <p className="text-lg font-bold text-orange-600">{overtimeHours.toFixed(2)}h</p>
          </div>
        </div>
      </div>

      {/* Pay Breakdown */}
      <div className="mb-4 pb-4 border-b">
        <h3 className="font-semibold text-blue-600 mb-3">Pay Breakdown</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center bg-gray-50 p-3 rounded">
            <span className="text-gray-700">Regular Pay:</span>
            <span className="font-semibold">${regularPay.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center bg-orange-50 p-3 rounded border-l-4 border-orange-400">
            <span className="text-gray-700">Overtime Pay (1.5x):</span>
            <span className="font-semibold text-orange-600">${overtimePay.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Gross Pay */}
      <div className="mb-4 pb-4 border-b bg-blue-50 p-4 rounded">
        <p className="text-gray-600 text-sm">Gross Pay</p>
        <p className="text-3xl font-bold text-blue-600">${totalPay.toFixed(2)}</p>
      </div>

      {/* Deductions */}
      {(applySS || applyMedicare || applyFederalTax) && (
        <div className="mb-4 pb-4 border-b">
          <h3 className="font-semibold text-blue-600 mb-3">Deductions</h3>
          <div className="space-y-2">
            {applySS && (
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Social Security Tax (6.2%):</span>
                <span className="font-semibold">${socialSecurityTax.toFixed(2)}</span>
              </div>
            )}
            {applyMedicare && (
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Medicare Tax (1.45%):</span>
                <span className="font-semibold">${medicareTax.toFixed(2)}</span>
              </div>
            )}
            {applyFederalTax && federalTax > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Federal Withholding:</span>
                <span className="font-semibold">${federalTax.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center font-semibold text-lg">
              <span>Total Deductions:</span>
              <span>${totalDeductions.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Net Pay */}
      <div className="mb-4 pb-4 border-b bg-green-50 p-4 rounded">
        <p className="text-gray-600 text-sm">Net Pay</p>
        <p className="text-3xl font-bold text-green-600">${netPay.toFixed(2)}</p>
      </div>

      {/* Notes Section */}
      {notes && (
        <div className="mb-4 pb-4 border-b">
          <h3 className="font-semibold text-blue-600 mb-2">Notes</h3>
          <div className="bg-gray-50 p-3 rounded text-gray-700 text-sm whitespace-pre-wrap break-words">
            {notes}
          </div>
        </div>
      )}
    </div>
  );
}
