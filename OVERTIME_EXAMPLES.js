// OVERTIME WORKFLOW - USAGE EXAMPLES
// Complete examples showing how to use all new overtime components and utilities

// ============================================
// 1. OVERTIME CALCULATION UTILITIES
// ============================================

import { 
  calculateOvertimeBreakdown,
  calculatePayroll,
  validateHours,
  validateNotes,
  formatHours 
} from '../utils/overtimeCalculations';

// Example 1: Calculate overtime for a week
const weeklyHours = 45; // 5 hours overtime
const hourlyRate = 20;

const overtimeData = calculateOvertimeBreakdown(weeklyHours, hourlyRate);
console.log(overtimeData);
// Output: {
//   regularHours: 40,
//   overtimeHours: 5,
//   regularPay: 800,
//   overtimePay: 150,
//   totalPay: 950
// }

// Example 2: Calculate full payroll with taxes
const payroll = calculatePayroll(40, 5, 20, true, true);
// Output: {
//   regularPay: 800,
//   overtimePay: 150,
//   subtotal: 950,
//   socialSecurityTax: 58.9,
//   medicareTax: 13.775,
//   totalDeductions: 72.675,
//   netPay: 877.325
// }

// Example 3: Validation
validateHours(45); // true
validateHours(-5); // false
validateHours(Infinity); // false

validateNotes("This is a note"); // true
validateNotes("x".repeat(501)); // false (too long)

formatHours(45.75); // "45h 45m"

// ============================================
// 2. PAYSTUB DISPLAY COMPONENT
// ============================================

import PaystubDisplay from '../component/PaystubDisplay';

function PaystubExample() {
  return (
    <PaystubDisplay 
      employeeName="John Doe"
      employeeEmail="john@company.com"
      regularHours={40}
      overtimeHours={5}
      regularPay={800}
      overtimePay={150}
      totalPay={950}
      socialSecurityTax={58.90}
      medicareTax={13.78}
      totalDeductions={72.68}
      netPay={877.32}
      notes="Worked on Q1 inventory project"
      weekStart="2024-01-15"
      weekEnd="2024-01-21"
      applySS={true}
      applyMedicare={true}
    />
  );
}

// ============================================
// 3. OVERTIME SUMMARY COMPONENT
// ============================================

import OvertimeSummary from '../component/OvertimeSummary';

function SummaryExample() {
  return (
    <OvertimeSummary
      totalHours={45}
      regularHours={40}
      overtimeHours={5}
      regularPay={800}
      overtimePay={150}
      totalPay={950}
      period="January 15-21, 2024"
      employeeName="John Doe"
      hourlyRate={20}
    />
  );
}

// ============================================
// 4. DAILY TIME CARD COMPONENT
// ============================================

import DailyTimeCard from '../component/DailyTimeCard';

function DailyTimeCardExample() {
  const dayData = {
    entries: [
      { in: "09:00", out: "13:00" },
      { in: "14:00", out: "18:30" }
    ],
    breakMinutes: 30,
    notes: "Regular workday"
  };

  return (
    <DailyTimeCard
      date="2024-01-15"
      dayData={dayData}
      hourlyRate={20}
      onDayDataChange={(newData) => console.log(newData)}
      onNotesChange={(newNotes) => console.log(newNotes)}
      compact={false}
    />
  );
}

// ============================================
// 5. TIME CARD ENTRY COMPONENT
// ============================================

import TimeCardEntry from '../component/TimeCardEntry';

function TimeCardEntryExample() {
  const entry = { in: "09:00", out: "17:30" };

  return (
    <TimeCardEntry
      entry={entry}
      dayHours={8.5}
      hourlyRate={20}
      onEntryChange={(index, newEntry) => console.log(newEntry)}
      onRemove={(index) => console.log('Remove entry', index)}
      index={0}
    />
  );
}

// ============================================
// 6. COMPLETE TIMESHEET INTEGRATION
// ============================================

import Timesheet from '../pages/Timesheet';

// The Timesheet component now handles:
// - Overtime calculation automatically
// - Notes input fields (day-by-day and global)
// - Visual highlighting for overtime days
// - Updated paystub with overtime breakdown
// - Tax controls
// - Complete payroll data in API calls

// Example data structure saved:
const timesheetData = {
  employeeId: 1,
  name: "John Doe",
  email: "john@company.com",
  rate: 20,
  weekStart: "2024-01-15",
  weekEnd: "2024-01-21",
  times: {
    "2024-01-15": {
      entries: [
        { in: "09:00", out: "17:30" }
      ],
      breakMinutes: 30,
      notes: "Regular workday"
    },
    "2024-01-16": {
      entries: [
        { in: "08:00", out: "18:00" }
      ],
      breakMinutes: 60,
      notes: "Inventory count"
    }
  },
  notes: {
    "2024-01-15": "Regular workday",
    "2024-01-16": "Inventory count"
  },
  totalHours: 45,
  regularHours: 40,
  overtimeHours: 5,
  totalPay: 950,
  regularPay: 800,
  overtimePay: 150,
  globalNotes: "Q1 inventory project completion"
};

// ============================================
// 7. HISTORY WITH OVERTIME
// ============================================

import HistoryAllEmployee from '../pages/HistoryAllEmployee';

// The HistoryAllEmployee component now displays:
// - Employee info card with overtime summary
// - Grid showing: Total Hours, Regular, Overtime, Total Earnings
// - History table with Status column
// - Orange highlighting for overtime entries
// - Notes column for day notes

// Example: Filtering with overtime
const filteredHistory = [
  {
    date: "2024-01-15",
    in: "09:00",
    out: "17:30",
    hours: 8.5,
    earnings: 170,
    notes: "Regular workday"
  },
  {
    date: "2024-01-16",
    in: "08:00",
    out: "18:00",
    hours: 10, // This will show as overtime
    earnings: 200, // Calculated: 8*20 + 2*20*1.5 = 160+60 = 220
    notes: "Inventory count"
  }
];

// ============================================
// 8. EMPLOYEE CLOCK WITH OVERTIME
// ============================================

import EmployeeClock from '../pages/EmployeeClock';

// The EmployeeClock component now shows:
// - Profile card with overtime breakdown
// - Real-time total hours calculation
// - Regular vs Overtime hours display
// - Regular vs Overtime pay breakdown
// - Attendance history with overtime indicators

// Example: Employee sees real-time overtime info
// When employee has worked 45 hours in the period:
// - Total Hours: 45h
// - Regular Hours: 40h
// - Overtime Hours: 5h (highlighted in orange)
// - Regular Pay: $800
// - Overtime Pay: $150 (highlighted in orange)
// - Total Earnings: $950

// ============================================
// 9. ADVANCED: CUSTOM OVERTIME LOGIC
// ============================================

// If you need to modify overtime rules:

// Option 1: Create a custom calculation function
function customOvertimeCalculation(totalHours, hourlyRate, customThreshold = 40) {
  const regularHours = Math.min(totalHours, customThreshold);
  const overtimeHours = Math.max(0, totalHours - customThreshold);
  
  // Could implement different multiplier (e.g., 2x after 50 hours)
  const overtimeMultiplier = overtimeHours > 10 ? 2 : 1.5;
  
  return {
    regularHours,
    overtimeHours,
    regularPay: regularHours * hourlyRate,
    overtimePay: overtimeHours * hourlyRate * overtimeMultiplier,
    totalPay: (regularHours * hourlyRate) + (overtimeHours * hourlyRate * overtimeMultiplier)
  };
}

// Option 2: For double-time after 50 hours
function tieredOvertimeCalculation(totalHours, hourlyRate) {
  const regular40 = Math.min(totalHours, 40);
  const overtime40to50 = Math.max(0, Math.min(totalHours - 40, 10));
  const doubleTime50plus = Math.max(0, totalHours - 50);
  
  return {
    regularHours: regular40,
    overtimeHours: overtime40to50 + doubleTime50plus,
    regularPay: regular40 * hourlyRate,
    overtimePay: (overtime40to50 * hourlyRate * 1.5) + (doubleTime50plus * hourlyRate * 2),
    totalPay: (regular40 * hourlyRate) + (overtime40to50 * hourlyRate * 1.5) + (doubleTime50plus * hourlyRate * 2)
  };
}

// ============================================
// 10. STATE MANAGEMENT PATTERN
// ============================================

import { useState } from 'react';

function TimesheetStateExample() {
  // State for timesheet data
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [weekDates, setWeekDates] = useState([]);
  const [manualTimes, setManualTimes] = useState({});
  const [notesData, setNotesData] = useState({});
  const [globalNotes, setGlobalNotes] = useState("");

  // Update entry time
  const handleUpdateEntry = (date, entryIndex, field, value) => {
    setManualTimes(prev => ({
      ...prev,
      [date]: {
        ...prev[date],
        entries: prev[date]?.entries?.map((e, idx) => 
          idx === entryIndex ? { ...e, [field]: value } : e
        ) || []
      }
    }));
  };

  // Update day notes
  const handleUpdateNotes = (date, notes) => {
    if (validateNotes(notes)) {
      setNotesData(prev => ({
        ...prev,
        [date]: notes
      }));
    }
  };

  // Calculate overtime for display
  const calculateDayOvertime = (date) => {
    const dayData = manualTimes[date];
    if (!dayData?.entries) return null;

    let hours = 0;
    dayData.entries.forEach(entry => {
      if (entry.in && entry.out) {
        const start = new Date(`2024-01-01T${entry.in}`);
        let end = new Date(`2024-01-01T${entry.out}`);
        if (end < start) end.setDate(end.getDate() + 1);
        hours += (end - start) / (1000 * 60 * 60);
      }
    });
    hours -= (dayData.breakMinutes || 0) / 60;

    return calculateOvertimeBreakdown(hours, selectedEmp?.rate || 0);
  };

  return (
    <div>
      {weekDates.map(date => {
        const dateStr = date.toISOString().split('T')[0];
        const overtime = calculateDayOvertime(dateStr);
        
        return (
          <div key={dateStr} className={overtime?.overtimeHours > 0 ? 'bg-orange-50' : 'bg-white'}>
            <h3>{date.toLocaleDateString()}</h3>
            {overtime && (
              <div>
                <p>Regular: {overtime.regularHours}h</p>
                <p>Overtime: {overtime.overtimeHours}h</p>
                <p>Pay: ${overtime.totalPay}</p>
              </div>
            )}
            <textarea
              value={notesData[dateStr] || ''}
              onChange={(e) => handleUpdateNotes(dateStr, e.target.value)}
              placeholder="Notes (max 500 chars)"
            />
          </div>
        );
      })}
    </div>
  );
}

// ============================================
// 11. API INTEGRATION PATTERN
// ============================================

// Updated API call structure
async function saveTimesheetWithOvertime(data) {
  const response = await api.createTimesheet({
    employeeId: data.employeeId,
    name: data.name,
    email: data.email,
    rate: data.rate,
    weekStart: data.weekStart,
    weekEnd: data.weekEnd,
    times: data.times,
    notes: data.notes, // Day-by-day notes
    globalNotes: data.globalNotes, // Period notes
    
    // Overtime data
    totalHours: data.totalHours,
    regularHours: data.regularHours,
    overtimeHours: data.overtimeHours,
    
    // Pay data
    totalPay: data.totalPay,
    regularPay: data.regularPay,
    overtimePay: data.overtimePay
  });

  return response;
}

// Download paystub with overtime
async function downloadPaystubWithOvertime(data) {
  const response = await api.downloadPaystub({
    name: data.name,
    email: data.email,
    rate: data.rate,
    weekStart: data.weekStart,
    weekEnd: data.weekEnd,
    
    // Include overtime breakdown
    regularHours: data.regularHours,
    overtimeHours: data.overtimeHours,
    regularPay: data.regularPay,
    overtimePay: data.overtimePay,
    
    // Include notes
    notes: data.notes,
    globalNotes: data.globalNotes,
    
    totalHours: data.totalHours,
    applySS: data.applySS,
    applyMedicare: data.applyMedicare,
    filling_status: data.filling_status,
    dependent: data.depend
  });

  return response;
}

// ============================================
// 12. TESTING OVERTIME CALCULATIONS
// ============================================

// Test cases for verification
const testCases = [
  {
    name: "Standard 40-hour week",
    hours: 40,
    rate: 20,
    expected: { regularHours: 40, overtimeHours: 0, totalPay: 800 }
  },
  {
    name: "5 hours overtime",
    hours: 45,
    rate: 20,
    expected: { regularHours: 40, overtimeHours: 5, totalPay: 950 }
  },
  {
    name: "Full overtime week (60 hours)",
    hours: 60,
    rate: 20,
    expected: { regularHours: 40, overtimeHours: 20, totalPay: 1400 }
  },
  {
    name: "Part-time week (20 hours)",
    hours: 20,
    rate: 20,
    expected: { regularHours: 20, overtimeHours: 0, totalPay: 400 }
  }
];

// Run tests
testCases.forEach(test => {
  const result = calculateOvertimeBreakdown(test.hours, test.rate);
  const passed = 
    result.regularHours === test.expected.regularHours &&
    result.overtimeHours === test.expected.overtimeHours &&
    result.totalPay === test.expected.totalPay;
  
  console.log(`${test.name}: ${passed ? '✓ PASSED' : '✗ FAILED'}`);
  if (!passed) console.log('Expected:', test.expected, 'Got:', result);
});

export {
  calculateOvertimeBreakdown,
  calculatePayroll,
  validateHours,
  validateNotes,
  formatHours,
  PaystubDisplay,
  OvertimeSummary,
  DailyTimeCard,
  TimeCardEntry,
  Timesheet,
  HistoryAllEmployee,
  EmployeeClock
};
