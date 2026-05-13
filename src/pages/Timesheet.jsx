import { useEffect, useState } from "react";
import { api } from "../services/api";
import Topbar from "../component/Topbar";
import PaystubDisplay from "../component/PaystubDisplay";
import { 
  calculateOvertimeBreakdown, 
  calculatePayroll, 
  validateNotes,
  formatHours 
} from "../utils/overtimeCalculations";

export default function Timesheet() {

/* ================= STATE ================= */

const [employees, setEmployees] = useState([]);
const [selectedEmp, setSelectedEmp] = useState(null);

const [weekDates, setWeekDates] = useState([]);
const [manualTimes, setManualTimes] = useState({});
const [notesData, setNotesData] = useState({});

const [saveTimeLoader, setSaveTimeLoader] = useState(false);
const [downloadLoader, setDownloadLoader] = useState(false);
const [previewLoader, setPreviewLoader] = useState(false);
const [sendEmailLoader, setSendEmailLoader] = useState(false);

const [applySS, setApplySS] = useState(true);
const [applyMedicare, setApplyMedicare] = useState(true);

const [rangeStart, setRangeStart] = useState("");
const [rangeEnd, setRangeEnd] = useState("");
const [globalNotes, setGlobalNotes] = useState("");



const [loading,setLoading] = useState(false);

/* ================= DATE ================= */

function formatDateLocal(d) {
  const date = new Date(d);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/* ================= WEEK ================= */

function getWeekDates() {
  const today = new Date();
  const day = today.getDay();

  const sunday = new Date(today);
  sunday.setDate(today.getDate() - day);

  const week = [];
  for (let i = 0; i < 7; i++) {
    let d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    week.push(d);
  }
  return week;
}

/* ================= LOAD ================= */

useEffect(() => {
  if (!selectedEmp) return;

async function loadTimes() {

  const res = await api.getEmployeeTimesheet({
    employeeId: selectedEmp.id
  });

  if (res) {

    let filtered = {};

    if (rangeStart && rangeEnd) {

      Object.keys(res.times || {}).forEach(date => {

        if (date >= rangeStart && date <= rangeEnd) {
          filtered[date] = res.times[date];
        }

      });

      setManualTimes(filtered);

    } else {

      setManualTimes(res.times || {});
    }

    // RESTORE NOTES
    setGlobalNotes(res.globalNotes || "");

    // RESTORE DAY NOTES
    setNotesData(res.notes || {});
  }
}

  loadTimes();
}, [selectedEmp, rangeStart, rangeEnd]);

useEffect(() => {
  async function init() {
    setLoading(true)
    const emp = await api.getEmployees();

    if (Array.isArray(emp)) {
      setEmployees(emp);
    } else {
      setEmployees([]);
    }

    setWeekDates(getWeekDates());
    setLoading(false)
  }
  init();
}, []);

/* ================= SELECT EMP ================= */

// ✅ FIXED RATE BUG
const RATE = selectedEmp ? parseFloat(selectedEmp.rate) : 0;

/* ================= TIME ================= */

// function updateClockIn(date, val) {
//   setManualTimes(prev => ({
//     ...prev,
//     [date]: { ...prev[date], in: val }
//   }));
// }

// function updateClockOut(date, val) {
//   setManualTimes(prev => ({
//     ...prev,
//     [date]: { ...prev[date], out: val }
//   }));
// }

// ✅ NEW BREAK BUTTON LOGIC
function addBreak(date) {
  setManualTimes(prev => ({
    ...prev,
    [date]: {
      ...prev[date],
      breakMinutes: (prev[date]?.breakMinutes || 0) + 15
    }
  }));
}

/* ================= CALC ================= */

function calculateDayHours(dayData) {
  if (!dayData?.entries) return 0;

  return dayData.entries.reduce((sum, entry) => {
    if (!entry.in || !entry.out) return sum;

    const start = new Date(`2024-01-01T${entry.in}`);
    let end = new Date(`2024-01-01T${entry.out}`);

    if (end < start) end.setDate(end.getDate() + 1);

    return sum + (end - start) / (1000 * 60 * 60);
  }, 0) - ((dayData.breakMinutes || 0) / 60);
}


/* ================= TOTAL ================= */

const totalHours = weekDates.reduce((sum, date) => {
  const key = formatDateLocal(date);
  return sum + calculateDayHours(manualTimes[key]);
}, 0);

// Calculate overtime breakdown
const overtimeData = calculateOvertimeBreakdown(totalHours, RATE);
const { regularHours, overtimeHours, regularPay, overtimePay, totalPay } = overtimeData;

/* ================= PAYROLL ================= */

const payrollData = calculatePayroll(regularHours, overtimeHours, RATE, applySS, applyMedicare);
const { 
  subtotal, 
  socialSecurityTax, 
  medicareTax, 
  totalDeductions, 
  netPay 
} = payrollData;

/* ================= SAVE ================= */

async function saveTimesheet() {
  if (!selectedEmp) {
    alert("Select employee first");
    return;
  }

  setSaveTimeLoader(true)

  await api.createTimesheet({
    employeeId: selectedEmp.id,
    name: selectedEmp.name,
    email: selectedEmp.email,
    rate: selectedEmp.rate,
    weekStart: formatDateLocal(weekDates[0]),
    weekEnd: formatDateLocal(weekDates[weekDates.length - 1]),
    times: manualTimes,
    notes: notesData,
    totalHours,
    regularHours,
    overtimeHours,
    totalPay,
    regularPay,
    overtimePay,
    globalNotes
  });

  setSaveTimeLoader(false)
  alert("Timesheet Saved!");
}

/* ================= PREVIEW PAYSTUB ================= */

async function previewPaystub() {
  if (!selectedEmp) return;

  setPreviewLoader(true);

  const res = await api.previewPaystub({
    name: selectedEmp.name,
    email: selectedEmp.email,
    rate: selectedEmp.rate,
    weekStart: rangeStart || formatDateLocal(weekDates[0]),
    weekEnd: rangeEnd || formatDateLocal(weekDates[weekDates.length - 1]),
    totalHours,
    regularHours,
    overtimeHours,
    regularPay,
    overtimePay,
    totalPay: subtotal,
    applySS,
    applyMedicare,
    filling_status: selectedEmp.filling_status,
    dependent: selectedEmp.depend,
    globalNotes: globalNotes
  });

  if (res.url) {
    window.open(res.url, "_blank");
  } else {
    alert("Failed to generate preview");
  }

  setPreviewLoader(false);
}

/* ================= DOWNLOAD PAYSTUB ================= */

async function downloadPaystub() {
  if (!selectedEmp) return;

  setDownloadLoader(true);

  const res = await api.downloadPaystub({
    name: selectedEmp.name,
    email: selectedEmp.email,
    rate: selectedEmp.rate,
    weekStart: rangeStart || formatDateLocal(weekDates[0]),
    weekEnd: rangeEnd || formatDateLocal(weekDates[weekDates.length - 1]),
    totalHours,
    regularHours,
    overtimeHours,
    regularPay,
    overtimePay,
    totalPay: subtotal,
    applySS,
    applyMedicare,
    filling_status: selectedEmp.filling_status,
    dependent: selectedEmp.depend,
    globalNotes: globalNotes
  });

  if (res.url) window.open(res.url);
  else alert("Failed");

  setDownloadLoader(false);
}

/* ================= EMAIL ================= */

async function sendPaystubEmail() {
  if (!selectedEmp) return;

  setSendEmailLoader(true);

  await api.sendPaystubEmail({
    name: selectedEmp.name,
    email: selectedEmp.email,
    rate: selectedEmp.rate,
    weekStart: rangeStart || formatDateLocal(weekDates[0]),
    weekEnd: rangeEnd || formatDateLocal(weekDates[weekDates.length - 1]),
    totalHours,
    regularHours,
    overtimeHours,
    regularPay,
    overtimePay,
    totalPay: subtotal,
    applySS,
    applyMedicare,
    filling_status: selectedEmp.filling_status,
    dependent: selectedEmp.depend,
    globalNotes: globalNotes
  });

  alert("Email sent!");
  setSendEmailLoader(false);
}


function applyDateRange() {
  if (!rangeStart || !rangeEnd) {
    alert("Select date range");
    return;
  }

  if (rangeStart > rangeEnd) {
    alert("Invalid date range");
    return;
  }

  // create dynamic date list
  let dates = [];
  let start = new Date(rangeStart);
  let end = new Date(rangeEnd);

  while (start <= end) {
    dates.push(new Date(start));
    start.setDate(start.getDate() + 1);
  }

  setWeekDates(dates);
}

/* ================= UI ================= */

return (
<div className="min-h-screen bg-gradient-to-b from-blue-400 to-blue-600">

<header className="bg-white shadow">
  <Topbar />
</header>

<div className="max-w-3xl mx-auto p-4">

<select
  onChange={(e) => {
    const emp = employees.find(x => String(x.id) === e.target.value); // ✅ FIXED
    setSelectedEmp(emp);
  }}
  className="p-3 rounded-lg w-full mb-4 font-semibold outline-0 bg-gray-200"
>
  <option>Select Employee</option>
  {employees.map(emp => (
    <option key={emp.id} value={emp.id}>
      {emp.name} (${emp.rate}/hr)
    </option>
  ))}
</select>


{selectedEmp && (
  <div className="bg-white p-4 rounded-xl shadow mb-4 flex flex-col md:flex-row gap-3">

    <input
      type="date"
      value={rangeStart}
      onChange={(e) => setRangeStart(e.target.value)}
      className="border p-2 rounded w-full"
    />

    <input
      type="date"
      value={rangeEnd}
      onChange={(e) => setRangeEnd(e.target.value)}
      className="border p-2 rounded w-full"
    />

    <button
      onClick={applyDateRange}
      className="bg-blue-600 text-white text-sm px-4 py-2 rounded w-full md:w-auto cursor-pointer"
    >
      Load Range
    </button>

  </div>
)}

{selectedEmp != null ? (
 <>
{loading ? (
  <p className="font-semibold text-white ">Loading TimeSheet...</p>
) : (
  <>
  {weekDates.map(date => {

  const key = formatDateLocal(date);
  const t = manualTimes[key] || { entries: [] };
  const dayNotes = notesData[key] || "";

  const hours = calculateDayHours(t);
  const dayOvertimeData = calculateOvertimeBreakdown(hours, RATE);
  const hasOvertime = dayOvertimeData.overtimeHours > 0;
  const earnings = hours > 0 ? (hours * RATE).toFixed(2) : "0.00";

  const day = date.toLocaleDateString("en-US",{ weekday:"long" });
  const fullDate = date.toLocaleDateString("en-US",{ day:"numeric", month:"long" });

  // Highlight row if has overtime
  const bgClass = hasOvertime ? "bg-orange-50 border-l-4 border-orange-400" : "bg-white";

  return (
    <div key={key} className={`${bgClass} rounded-xl shadow p-4 mb-4`}>

      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-blue-600 font-semibold">{day}</h3>
          <p className="text-gray-500 text-sm">{fullDate}</p>
          {hasOvertime && <p className="text-orange-600 text-xs font-semibold mt-1">⚠️ Overtime: {dayOvertimeData.overtimeHours.toFixed(2)}h</p>}
        </div>

        <div className="text-right">
          <p>{formatHours(hours)}</p>
          <p className="text-xs text-gray-500">
            Break: {t.breakMinutes || 0} min
          </p>
          <p className="text-blue-600 font-bold">${earnings}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-3">
      {t.entries?.map((entry, idx) => (
        <div key={idx} className="flex gap-2 mt-2">
          <input
            type="time"
            value={entry.in || ""}
            onChange={(e) => {
              const val = e.target.value;
              setManualTimes(prev => {
                const updated = { ...prev };
                updated[key].entries[idx].in = val;
                return updated;
              });
            }}
            className="border p-2 w-full rounded"
          />

          <input
            type="time"
            value={entry.out || ""}
            onChange={(e) => {
              const val = e.target.value;
              setManualTimes(prev => {
                const updated = { ...prev };
                updated[key].entries[idx].out = val;
                return updated;
              });
            }}
            className="border p-2 w-full rounded"
          />
        </div>
      ))}
        
      {/* Notes Field */}
      <textarea
        value={dayNotes}
        onChange={(e) => {
          const val = e.target.value;
          if (validateNotes(val)) {
            setNotesData(prev => ({
              ...prev,
              [key]: val
            }));
          }
        }}
        placeholder="Add notes for this day (optional)"
        className="border p-2 rounded w-full text-sm resize-none h-16"
      />
        
        <button
        onClick={() => {
          setManualTimes(prev => ({
            ...prev,
            [key]: {
              ...prev[key],
              entries: [...(prev[key]?.entries || []), { in: "", out: "" }]
            }
          }));
        }}
        className="bg-green-500 text-white px-2 py-2 rounded text-xs mt-2"
      >
        + Add Entry
      </button>

        <button
          onClick={()=>addBreak(key)}
          className="bg-blue-500 text-white px-2 py-2 rounded text-xs text-center cursor-pointer"
        > Break +15 min</button>


      </div>

    </div>
  );

})}
  </>
)}

<PaystubDisplay 
  employeeName={selectedEmp?.name}
  employeeEmail={selectedEmp?.email}
  regularHours={regularHours}
  overtimeHours={overtimeHours}
  regularPay={regularPay}
  overtimePay={overtimePay}
  totalPay={totalPay}
  socialSecurityTax={socialSecurityTax}
  medicareTax={medicareTax}
  totalDeductions={totalDeductions}
  netPay={netPay}
  notes={globalNotes}
  weekStart={rangeStart || formatDateLocal(weekDates[0])}
  weekEnd={rangeEnd || formatDateLocal(weekDates[weekDates.length - 1])}
  applySS={applySS}
  applyMedicare={applyMedicare}
/>

{/* Global Notes Section */}
<div className="bg-white p-6 rounded-xl shadow mt-6">
  <h2 className="text-lg font-bold mb-4">Period Notes</h2>
  <textarea
    value={globalNotes}
    onChange={(e) => {
      const val = e.target.value;
      if (validateNotes(val)) {
        setGlobalNotes(val);
      }
    }}
    placeholder="Add notes for this payroll period (max 500 characters)"
    className="border p-3 rounded w-full resize-none h-24 text-sm"
  />
  <p className="text-xs text-gray-500 mt-2">{globalNotes.length}/500 characters</p>
</div>

{/* Tax Controls */}
<div className="bg-white p-6 rounded-xl shadow mt-6">
  <h2 className="text-lg font-bold mb-4">Tax Settings</h2>
  <label className="flex items-center gap-2 mb-3 cursor-pointer">
    <input
      type="checkbox"
      checked={applySS}
      onChange={(e) => setApplySS(e.target.checked)}
      className="w-4 h-4 cursor-pointer"
    />
    <span className="flex-1">Apply Social Security Tax (6.2%)</span>
  </label>

  <label className="flex items-center gap-2 cursor-pointer">
    <input
      type="checkbox"
      checked={applyMedicare}
      onChange={(e) => setApplyMedicare(e.target.checked)}
      className="w-4 h-4 cursor-pointer"
    />
    <span className="flex-1">Apply Medicare Tax (1.45%)</span>
  </label>
</div>

<div className="flex flex-col gap-3 mt-6">

  <button 
    onClick={saveTimesheet} 
    disabled={saveTimeLoader}
    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-3 rounded w-full cursor-pointer font-semibold transition"
  >
    {saveTimeLoader ? "Saving..." : "Save Timesheet"}
  </button>

  <div className="grid grid-cols-2 gap-3">
    <button 
      onClick={previewPaystub} 
      disabled={previewLoader}
      className="bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white px-4 py-3 rounded cursor-pointer font-semibold transition"
    >
      {previewLoader ? "Generating..." : "Preview"}
    </button>

    <button 
      onClick={downloadPaystub} 
      disabled={downloadLoader}
      className="bg-blue-800 hover:bg-blue-900 disabled:bg-gray-400 text-white px-4 py-3 rounded cursor-pointer font-semibold transition"
    >
      {downloadLoader ? "Downloading..." : "Download"}
    </button>
  </div>

  <button 
    onClick={sendPaystubEmail} 
    disabled={sendEmailLoader}
    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-3 rounded w-full cursor-pointer font-semibold transition"
  >
    {sendEmailLoader ? "Sending..." : "Send Email"}
  </button>

</div>

</> 
):(
  <>
  <p className="text-white font-semibold text-center mt-10">Select an employee to view timesheet</p>
  </> 
)}

</div>
</div>
);
}