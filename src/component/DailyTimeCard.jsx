import React from 'react';
import { calculateOvertimeBreakdown, formatHours, validateNotes } from '../utils/overtimeCalculations';

export default function DailyTimeCard({
  date,
  dayData,
  hourlyRate,
  onDayDataChange,
  onNotesChange,
  compact = false
}) {
  const entries = dayData?.entries || [];
  const breakMinutes = dayData?.breakMinutes || 0;
  const notes = dayData?.notes || '';

  // Calculate hours accounting for breaks
  let totalHours = 0;
  entries.forEach(entry => {
    if (entry.in && entry.out) {
      const start = new Date(`2024-01-01T${entry.in}`);
      let end = new Date(`2024-01-01T${entry.out}`);
      if (end < start) end.setDate(end.getDate() + 1);
      totalHours += (end - start) / (1000 * 60 * 60);
    }
  });
  totalHours -= (breakMinutes / 60);

  const overtimeData = calculateOvertimeBreakdown(totalHours, hourlyRate);
  const hasOvertime = overtimeData.overtimeHours > 0;
  const dayOfWeek = new Date(date).toLocaleDateString("en-US", { weekday: "short" });
  const dateStr = new Date(date).toLocaleDateString("en-US", { day: "numeric", month: "short" });

  const bgClass = hasOvertime 
    ? "bg-orange-50 border-l-4 border-orange-400" 
    : "bg-white border-l-4 border-gray-200";

  if (compact) {
    return (
      <div className={`${bgClass} rounded p-3 shadow-sm`}>
        <div className="flex justify-between items-center">
          <div>
            <p className="font-semibold">{dayOfWeek} {dateStr}</p>
            <p className="text-sm text-gray-600">{formatHours(totalHours)}</p>
          </div>
          <div className="text-right">
            <p className="font-bold">${overtimeData.totalPay.toFixed(2)}</p>
            {hasOvertime && (
              <p className="text-xs text-orange-600">OT: {overtimeData.overtimeHours.toFixed(2)}h</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${bgClass} rounded-xl shadow p-4`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-blue-600 font-semibold text-lg">{dayOfWeek}</h3>
          <p className="text-gray-500 text-sm">{dateStr}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-blue-600">{formatHours(totalHours)}</p>
          {hasOvertime && (
            <p className="text-orange-600 text-xs font-semibold mt-1">⚠️ Overtime: {overtimeData.overtimeHours.toFixed(2)}h</p>
          )}
        </div>
      </div>

      {/* Hours Breakdown */}
      <div className="grid grid-cols-2 gap-2 mb-3 text-sm bg-gray-50 p-2 rounded">
        <div>
          <p className="text-gray-600">Regular</p>
          <p className="font-semibold">{overtimeData.regularHours.toFixed(2)}h</p>
        </div>
        <div>
          <p className="text-gray-600">Overtime (1.5x)</p>
          <p className={`font-semibold ${hasOvertime ? 'text-orange-600' : ''}`}>
            {overtimeData.overtimeHours.toFixed(2)}h
          </p>
        </div>
        <div>
          <p className="text-gray-600">Regular Pay</p>
          <p className="font-semibold">${overtimeData.regularPay.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-gray-600">Overtime Pay</p>
          <p className={`font-semibold ${hasOvertime ? 'text-orange-600' : ''}`}>
            ${overtimeData.overtimePay.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Break Time */}
      {breakMinutes > 0 && (
        <p className="text-xs text-gray-500 mb-3">Break: {breakMinutes} min</p>
      )}

      {/* Entries */}
      <div className="space-y-2 mb-3">
        {entries.length === 0 ? (
          <p className="text-gray-400 text-sm">No entries</p>
        ) : (
          entries.map((entry, idx) => {
            if (!entry.in || !entry.out) {
              return (
                <div key={idx} className="bg-yellow-100 p-2 rounded text-xs text-yellow-800">
                  Entry {idx + 1}: Incomplete
                </div>
              );
            }

            const entryStart = new Date(`2024-01-01T${entry.in}`);
            let entryEnd = new Date(`2024-01-01T${entry.out}`);
            if (entryEnd < entryStart) entryEnd.setDate(entryEnd.getDate() + 1);
            const entryHours = (entryEnd - entryStart) / (1000 * 60 * 60);

            return (
              <div key={idx} className="bg-gray-100 p-2 rounded text-sm flex justify-between">
                <span>{entry.in} - {entry.out}</span>
                <span className="font-semibold">{entryHours.toFixed(2)}h</span>
              </div>
            );
          })
        )}
      </div>

      {/* Notes */}
      {notes && (
        <div className="bg-gray-50 p-2 rounded text-xs text-gray-700 mb-3 border-l-2 border-blue-400">
          <p className="font-semibold mb-1">Notes:</p>
          <p>{notes}</p>
        </div>
      )}

      {/* Pay Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 p-3 rounded border border-green-200">
        <div className="flex justify-between items-center">
          <span className="font-semibold">Total Pay</span>
          <span className="text-xl font-bold text-green-600">${overtimeData.totalPay.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
