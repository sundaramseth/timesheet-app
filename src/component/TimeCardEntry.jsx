import React, { useState } from 'react';
import { calculateOvertimeBreakdown } from '../utils/overtimeCalculations';

export default function TimeCardEntry({ 
  entry, 
  dayHours,
  hourlyRate,
  onEntryChange,
  onRemove,
  index 
}) {
  const [showDetails, setShowDetails] = useState(false);
  
  const overtimeData = calculateOvertimeBreakdown(dayHours, hourlyRate);
  const hasOvertime = overtimeData.overtimeHours > 0;

  if (!entry.in || !entry.out) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
        <p className="text-sm text-yellow-700">⚠️ Incomplete Entry (Missing clock in/out)</p>
        <div className="flex gap-2 mt-2">
          <input
            type="time"
            value={entry.in || ""}
            onChange={(e) => onEntryChange(index, { ...entry, in: e.target.value })}
            placeholder="Clock In"
            className="border p-2 text-sm rounded flex-1"
          />
          <input
            type="time"
            value={entry.out || ""}
            onChange={(e) => onEntryChange(index, { ...entry, out: e.target.value })}
            placeholder="Clock Out"
            className="border p-2 text-sm rounded flex-1"
          />
          {onRemove && (
            <button
              onClick={() => onRemove(index)}
              className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    );
  }

  const entryHours = (() => {
    const start = new Date(`2024-01-01T${entry.in}`);
    let end = new Date(`2024-01-01T${entry.out}`);
    if (end < start) end.setDate(end.getDate() + 1);
    return (end - start) / (1000 * 60 * 60);
  })();

  const entryCost = entryHours * hourlyRate;

  return (
    <div className={`border p-3 rounded ${hasOvertime ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200'}`}>
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1">
          <div className="flex gap-2">
            <input
              type="time"
              value={entry.in}
              onChange={(e) => onEntryChange(index, { ...entry, in: e.target.value })}
              className="border p-1 text-sm rounded w-24"
            />
            <span className="text-gray-400 px-2 flex items-center">→</span>
            <input
              type="time"
              value={entry.out}
              onChange={(e) => onEntryChange(index, { ...entry, out: e.target.value })}
              className="border p-1 text-sm rounded w-24"
            />
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold">{entryHours.toFixed(2)}h</p>
          <p className="text-xs text-gray-600">${entryCost.toFixed(2)}</p>
          {hasOvertime && (
            <p className="text-xs text-orange-600 font-bold mt-1">
              OT: {overtimeData.overtimeHours.toFixed(2)}h
            </p>
          )}
        </div>
        {onRemove && (
          <button
            onClick={() => onRemove(index)}
            className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
          >
            ✕
          </button>
        )}
      </div>
      
      {onRemove && (
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-blue-600 mt-2 hover:underline"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      )}
      
      {showDetails && (
        <div className="mt-2 pt-2 border-t text-xs text-gray-600">
          <p>Regular: {Math.min(entryHours, 40).toFixed(2)}h @ ${hourlyRate}/hr = ${(Math.min(entryHours, 40) * hourlyRate).toFixed(2)}</p>
          {entryHours > 40 && (
            <p>Overtime: {(entryHours - 40).toFixed(2)}h @ ${(hourlyRate * 1.5).toFixed(2)}/hr = ${((entryHours - 40) * hourlyRate * 1.5).toFixed(2)}</p>
          )}
        </div>
      )}
    </div>
  );
}
