# Overtime Workflow Implementation Guide

## Overview
Your timesheet application has been updated with comprehensive overtime support. The system automatically calculates:
- **Regular Hours**: First 40 hours per week
- **Overtime Hours**: Hours beyond 40 (paid at 1.5x rate)
- **Automatic Payroll Calculations**: Splits pay into regular and overtime components

## New Features

### 1. Overtime Calculation Engine (`overtimeCalculations.js`)
Core utility functions that handle all overtime logic:

```javascript
import { 
  calculateOvertimeBreakdown,
  calculatePayroll,
  validateHours,
  validateNotes,
  formatHours 
} from '../utils/overtimeCalculations';

// Calculate regular vs overtime hours for a week
const breakdown = calculateOvertimeBreakdown(totalHours, hourlyRate);
// Returns: { regularHours, overtimeHours, regularPay, overtimePay, totalPay }

// Full payroll with taxes
const payroll = calculatePayroll(regularHours, overtimeHours, rate, applySS, applyMedicare);
// Returns: { subtotal, taxes, netPay, ...}

// Validate input
validateHours(42.5); // true
validateNotes("text..."); // validates max 500 chars
```

**Logic:**
- If total hours ≤ 40: All hours are regular
- If total hours > 40: First 40 are regular, rest are overtime at 1.5x rate
- Overtime pay = overtimeHours × hourlyRate × 1.5

### 2. Updated Components

#### **Timesheet.jsx** - Main Entry Point
**New Features:**
- Daily notes textarea (max 500 chars per day)
- Global period notes
- Visual highlighting for overtime days (orange border)
- Overtime indicator showing hours > 40
- Updated paystub with overtime breakdown
- Tax control checkboxes (SS, Medicare)

**Usage:**
1. Select employee
2. Enter clock times
3. Add optional day notes
4. System automatically highlights days with overtime
5. View paystub summary showing regular/overtime split
6. Add period notes if needed
7. Save timesheet

**Overtime Display:**
- Days with overtime show orange warning: "⚠️ Overtime: 2.5h"
- Paystub clearly separates regular vs overtime pay
- Shows both regular and overtime pay calculations

#### **HistoryAllEmployee.jsx** - History & Analysis
**New Features:**
- Employee info card showing overtime summary grid:
  - Total Hours
  - Regular Hours
  - Overtime Hours (with orange highlight)
  - Total Earnings
  - Regular Pay / Overtime Pay / Gross Pay
- History table with overtime status column
- Orange highlighting for overtime entries
- Notes column showing day notes
- Responsive grid layout

**Data Shown:**
```
Date | Clock In | Clock Out | Hours | Status | Earnings | Notes
2024-01-15 | 09:00 | 17:30 | 8.5h | Regular | $85.00 | —
2024-01-16 | 08:00 | 18:00 | 10h | ⚠️ Overtime: 2h | $117.50 | Inventory
```

#### **EmployeeClock.jsx** - Employee Self-Service
**New Features:**
- Profile card shows overtime breakdown:
  - Total Hours
  - Regular Hours
  - Overtime Hours (highlighted in orange)
  - Regular Pay / Overtime Pay / Total Earnings
- Attendance history table with overtime indicators
- Orange highlighting for overtime entries
- Employees can see their own overtime metrics in real-time

**Real-Time Display:**
- Updates when employee clocks in/out
- Shows cumulative hours for the period
- Highlights any days with overtime

### 3. Reusable Components

#### **PaystubDisplay.jsx**
Complete paystub component showing:
- Employee info with period dates
- Hours worked (Regular & Overtime sections with styling)
- Pay breakdown (Regular, Overtime 1.5x, Gross)
- Deductions (SS 6.2%, Medicare 1.45%)
- Net pay
- Notes section
- Responsive grid layout

```jsx
<PaystubDisplay 
  employeeName="John Doe"
  employeeEmail="john@example.com"
  regularHours={40}
  overtimeHours={5}
  regularPay={400}
  overtimePay={112.50}
  totalPay={512.50}
  socialSecurityTax={31.78}
  medicareTax={7.43}
  totalDeductions={39.21}
  netPay={473.29}
  notes="Handled special project"
  applySS={true}
  applyMedicare={true}
/>
```

#### **OvertimeSummary.jsx**
Professional summary card showing:
- Total hours with breakdown
- Regular vs Overtime hours
- Pay breakdown
- Efficiency bar chart (Regular % vs Overtime %)
- High overtime warning (if > 20 hours)

```jsx
<OvertimeSummary
  totalHours={45}
  regularHours={40}
  overtimeHours={5}
  regularPay={400}
  overtimePay={112.50}
  totalPay={512.50}
  period="Jan 15-21, 2024"
  employeeName="John Doe"
  hourlyRate={10}
/>
```

#### **DailyTimeCard.jsx**
Individual day card showing:
- Date and day of week
- Hours breakdown (Regular & Overtime)
- Individual entries with times
- Break minutes
- Notes for the day
- Total pay for the day
- Compact or full view modes

#### **TimeCardEntry.jsx**
Individual time entry component with:
- Clock in/out times
- Entry duration
- Overtime calculation for entry
- Edit capability
- Remove button
- Expandable details view

### 4. Data Flow & Validation

**Validation Rules:**
- Hours must be non-negative and finite
- Notes max 500 characters
- Negative hours rejected with form validation
- Incomplete entries show warning status
- Break minutes must be non-negative

**Overtime Threshold:**
- Fixed at 40 hours per week
- All hours > 40 automatically calculated as overtime
- Overtime multiplier: 1.5x

**Tax Calculations:**
- Social Security: 6.2% of gross pay
- Medicare: 1.45% of gross pay
- Toggleable via checkboxes
- Applied after overtime breakdown

## Integration with Backend

### API Updates Required
If using Google Apps Script backend, update these functions:

```javascript
// createTimesheet should store:
{
  times: {...},
  notes: {...},           // Day-by-day notes
  regularHours: 40,
  overtimeHours: 5,
  regularPay: 400,
  overtimePay: 112.50,
  totalPay: 512.50,
  globalNotes: "..."      // Period-level notes
}

// previewPaystub/downloadPaystub should include:
{
  regularHours,
  overtimeHours,
  regularPay,
  overtimePay,
  notes: {...},           // For display
  globalNotes: "..."
}
```

### Storage Format
```javascript
// Times object structure (GAS Sheet)
{
  "2024-01-15": {
    entries: [
      { in: "09:00", out: "17:30" },
      { in: "19:00", out: "20:00" }
    ],
    breakMinutes: 30,
    notes: "Optional day notes"
  },
  "2024-01-16": { ... }
}
```

## Usage Examples

### Example 1: Simple 40-Hour Week
- Mon-Fri: 8 hours each day
- Result: 40 regular hours, 0 overtime
- Pay: 40 × $20 = $800

### Example 2: Overtime Week
- Mon-Fri: 9 hours each day (45 total)
- Result: 40 regular hours, 5 overtime hours
- Pay: (40 × $20) + (5 × $20 × 1.5) = $800 + $150 = $950

### Example 3: With Notes
```
Day Notes: "Handled inventory, worked lunch"
Period Notes: "Q1 inventory count project"

Timesheet saved with complete notes trail
Visible on paystub and history reports
```

## Responsive Design

All components are fully responsive:
- **Mobile**: Single column, stacked layout, touch-friendly buttons
- **Tablet**: 2 columns, optimized spacing
- **Desktop**: Multi-column grids, full detail views

## Visual Indicators

- **Orange Highlight**: Days/entries with overtime (> 40 hours)
- **Green**: Regular work (≤ 40 hours)
- **Blue**: Regular pay sections
- **Orange**: Overtime pay sections
- **Red Warning**: High overtime (> 20 hours in period)

## File Structure

```
src/
├── utils/
│   └── overtimeCalculations.js     # Core calculation logic
├── component/
│   ├── PaystubDisplay.jsx          # Paystub component
│   ├── OvertimeSummary.jsx         # Summary card
│   ├── DailyTimeCard.jsx           # Day card component
│   └── TimeCardEntry.jsx           # Entry component
└── pages/
    ├── Timesheet.jsx               # Updated with overtime
    ├── HistoryAllEmployee.jsx      # Updated with overtime
    └── EmployeeClock.jsx           # Updated with overtime
```

## Next Steps

### Optional Enhancements
1. **Weekly Reports**: Email summary with overtime highlights
2. **Overtime Alerts**: Notify when approaching 40 hours
3. **Historical Analysis**: Track overtime trends
4. **Approval Workflow**: Manager review before finalization
5. **Export to Accounting**: CSV/PDF with overtime breakdown
6. **Bulk Timesheet Edit**: Edit multiple days at once
7. **Mobile App**: Native app for clock in/out with GPS
8. **API Integrations**: Connect to accounting software

### Configuration Options
Consider adding these as settings:
- Overtime threshold (currently 40)
- Overtime multiplier (currently 1.5x)
- Working days per week (currently calculated)
- Break policy (currently manual)
- Tax rates (currently hardcoded 6.2% / 1.45%)

## Testing Checklist

- [ ] Calculate 40 hours: should be all regular
- [ ] Calculate 42 hours: should be 40 regular + 2 overtime
- [ ] Verify overtime pay: 2 × rate × 1.5
- [ ] Test negative validation: should reject
- [ ] Test notes max length: should enforce 500 char
- [ ] Verify tax calculations: should be correct
- [ ] Check visual highlighting: orange for overtime days
- [ ] Test responsive design: mobile, tablet, desktop
- [ ] Verify paystub display: all fields show correctly
- [ ] Test history view: overtime indicator shows
- [ ] Test employee clock: overtime metrics display

## Support & Debugging

### Common Issues

**Overtime not calculating?**
- Ensure total hours > 40
- Check hourly rate is numeric
- Verify calculateOvertimeBreakdown is imported

**Notes not saving?**
- Check validateNotes passes (max 500 chars)
- Ensure notesData state is passed to API
- Verify backend stores notes field

**Highlighting not showing?**
- Check hasOvertime logic: overtimeHours > 0
- Verify CSS classes are applied
- Check Tailwind CSS is compiled

### Debug Mode
Add this to any component to log calculations:
```javascript
console.log('Overtime Data:', {
  totalHours,
  regularHours,
  overtimeHours,
  regularPay,
  overtimePay,
  totalPay
});
```

## Maintenance

Update overtime rules by modifying:
1. `REGULAR_HOURS_LIMIT` in `overtimeCalculations.js` (currently 40)
2. Tax rates in `calculatePayroll()` function
3. Highlight threshold in components

All components inherit from central calculations, so one change updates everywhere.
