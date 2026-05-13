import React from 'react';
import { calculateOvertimeBreakdown } from '../utils/overtimeCalculations';

export default function OvertimeSummary({
  totalHours,
  regularHours,
  overtimeHours,
  regularPay,
  overtimePay,
  totalPay,
  period,
  employeeName,
  hourlyRate
}) {
  const overtimePercentage = totalHours > 0 ? ((overtimeHours / totalHours) * 100).toFixed(1) : 0;
  const showWarning = overtimeHours > 20; // Highlight if more than 20 hours overtime

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl shadow-lg border border-blue-200">
      
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-blue-900">{employeeName}</h2>
        {period && <p className="text-sm text-gray-600 mt-1">{period}</p>}
        <p className="text-sm text-gray-700 mt-1">Rate: ${hourlyRate}/hr</p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        
        {/* Total Hours */}
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="text-gray-600 text-xs font-semibold">TOTAL HOURS</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{totalHours.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">hours</p>
        </div>

        {/* Regular Hours */}
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="text-gray-600 text-xs font-semibold">REGULAR</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{regularHours.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">@ ${hourlyRate}/hr</p>
        </div>

        {/* Overtime Hours */}
        <div className={`${showWarning ? 'bg-red-50 border border-red-200' : 'bg-white'} p-3 rounded-lg shadow-sm`}>
          <p className="text-gray-600 text-xs font-semibold">OVERTIME</p>
          <p className={`text-2xl font-bold mt-1 ${overtimeHours > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
            {overtimeHours.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {overtimeHours > 0 ? `${overtimePercentage}% of total` : 'No overtime'}
          </p>
        </div>

        {/* Total Pay */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-lg shadow-sm border border-green-200">
          <p className="text-gray-600 text-xs font-semibold">TOTAL PAY</p>
          <p className="text-2xl font-bold text-green-600 mt-1">${totalPay.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">gross pay</p>
        </div>

      </div>

      {/* Pay Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <p className="text-gray-600 text-xs font-semibold">REGULAR PAY</p>
          <p className="text-lg font-bold text-gray-800 mt-1">${regularPay.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">{regularHours.toFixed(2)}h × ${hourlyRate}</p>
        </div>

        <div className={`${overtimePay > 0 ? 'bg-orange-50 border-orange-200' : 'bg-gray-50'} p-3 rounded-lg border`}>
          <p className="text-gray-600 text-xs font-semibold">OVERTIME PAY</p>
          <p className={`text-lg font-bold mt-1 ${overtimePay > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
            ${overtimePay.toFixed(2)}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            {overtimeHours > 0 ? `${overtimeHours.toFixed(2)}h × $${(hourlyRate * 1.5).toFixed(2)}` : 'None'}
          </p>
        </div>

        {showWarning && (
          <div className="bg-red-50 p-3 rounded-lg border border-red-200">
            <p className="text-red-700 text-xs font-bold">⚠️ HIGH OVERTIME</p>
            <p className="text-lg font-bold text-red-600 mt-1">{overtimeHours.toFixed(2)}h</p>
            <p className="text-xs text-red-600 mt-1">above 40hrs/week threshold</p>
          </div>
        )}

      </div>

      {/* Efficiency Stats */}
      {totalHours > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-300">
          <p className="text-xs font-semibold text-gray-700 mb-2">EFFICIENCY</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all" 
              style={{ width: `${(regularHours / totalHours) * 100}%` }}
            />
            <div 
              className="bg-orange-500 h-2 rounded-r-full transition-all"
              style={{ 
                width: `${(overtimeHours / totalHours) * 100}%`,
                marginLeft: `${(regularHours / totalHours) * 100}%`,
                position: 'relative',
                bottom: '100%'
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>{((regularHours / totalHours) * 100).toFixed(0)}% Regular</span>
            <span>{((overtimeHours / totalHours) * 100).toFixed(0)}% Overtime</span>
          </div>
        </div>
      )}

    </div>
  );
}
