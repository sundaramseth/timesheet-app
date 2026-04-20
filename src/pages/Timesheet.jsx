import { useEffect, useState } from "react";
import { api } from "../services/api";
import Topbar from "../component/Topbar";

export default function Timesheet() {

/* ================= STATE ================= */

const [employees, setEmployees] = useState([]);
const [selectedEmp, setSelectedEmp] = useState(null);

const [weekDates, setWeekDates] = useState([]);
const [manualTimes, setManualTimes] = useState({});

const [saveTimeLoader, setSaveTimeLoader] = useState(false);
const [downloadLoader, setDownloadLoader] = useState(false);
const [previewLoader, setPreviewLoader] = useState(false);
const [sendEmailLoader, setSendEmailLoader] = useState(false);

const [applySS, setApplySS] = useState(true);
const [applyMedicare, setApplyMedicare] = useState(true);

const [rangeStart, setRangeStart] = useState("");
const [rangeEnd, setRangeEnd] = useState("");



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

  if (res?.times) {

    // ✅ FILTER BASED ON RANGE (if selected)
    let filtered = {};

    if (rangeStart && rangeEnd) {
      Object.keys(res.times).forEach(date => {
        if (date >= rangeStart && date <= rangeEnd) {
          filtered[date] = res.times[date];
        }
      });
      setManualTimes(filtered);
    } else {
      setManualTimes(res.times);
    }
  }
}

  loadTimes();
}, [selectedEmp]);

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

function formatHours(h) {
  const hr = Math.floor(h);
  const min = Math.round((h - hr) * 60);
  return `${hr}h ${min}m`;
}

/* ================= TOTAL ================= */

const totalHours = weekDates.reduce((sum, date) => {
  const key = formatDateLocal(date);
  return sum + calculateDayHours(manualTimes[key]);
}, 0);

const totalEarnings = totalHours * RATE;

/* ================= TAX & CALC ================= */

const subtotal = totalHours * RATE;

// Tax calculations (placeholder - backend handles actual calculation)
const socialSecurityTax = applySS ? (subtotal * 0.062).toFixed(2) : 0;
const medicareTax = applyMedicare ? (subtotal * 0.0145).toFixed(2) : 0;
const totalDeductions = parseFloat(socialSecurityTax) + parseFloat(medicareTax);
const netPay = (subtotal - totalDeductions).toFixed(2);

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
    weekEnd: formatDateLocal(weekDates[6]),
    times: manualTimes,
    totalHours,
    totalPay: totalEarnings
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
    totalPay: subtotal,
    applySS,
    applyMedicare,
    filling_status: selectedEmp.filling_status,
    dependent: selectedEmp.depend
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
    totalPay: subtotal,
    applySS,
    applyMedicare,
    filling_status: selectedEmp.filling_status,
    dependent: selectedEmp.depend
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
    totalPay: subtotal,
    applySS,
    applyMedicare,
    filling_status: selectedEmp.filling_status,
    dependent: selectedEmp.depend
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

  const hours = calculateDayHours(t);
  const earnings = hours > 0 ? (hours * RATE).toFixed(2) : "0.00";

  const day = date.toLocaleDateString("en-US",{ weekday:"long" });
  const fullDate = date.toLocaleDateString("en-US",{ day:"numeric", month:"long" });

  return (
    <div key={key} className="bg-white rounded-xl shadow p-4 mb-4">

      <div className="flex justify-between">
        <div>
          <h3 className="text-blue-600 font-semibold">{day}</h3>
          <p className="text-gray-500 text-sm">{fullDate}</p>
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

<div id="paystub" className="bg-white p-6 rounded-xl shadow mt-6">

  <h2 className="text-xl font-bold mb-4">Paystub Summary</h2>

  {/* Employee Info */}
  <div className="mb-4 pb-4 border-b">
    <p><b>Name:</b> {selectedEmp?.name}</p>
    <p><b>Email:</b> {selectedEmp?.email}</p>
  </div>

  {/* Hours & Rate Section */}
  <div className="mb-4 pb-4 border-b">
    <h3 className="font-semibold text-blue-600 mb-2">Earnings</h3>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-gray-600 text-sm">Total Hours</p>
        <p className="text-lg font-bold">{formatHours(totalHours)}</p>
      </div>
      <div>
        <p className="text-gray-600 text-sm">Hourly Rate</p>
        <p className="text-lg font-bold">${RATE.toFixed(2)}/hr</p>
      </div>
    </div>
  </div>

  {/* Subtotal */}
  <div className="mb-4 pb-4 border-b bg-blue-50 p-3 rounded">
    <p className="text-gray-600 text-sm">Subtotal</p>
    <p className="text-2xl font-bold text-blue-600">${subtotal.toFixed(2)}</p>
  </div>

  {/* Taxes Section */}
  <div className="mb-4 pb-4 border-b">
    <h3 className="font-semibold text-blue-600 mb-3">Deductions</h3>
    
    <label className="flex items-center gap-2 mb-3 cursor-pointer">
      <input
        type="checkbox"
        checked={applySS}
        onChange={(e) => setApplySS(e.target.checked)}
        className="w-4 h-4 cursor-pointer"
      />
      <span className="flex-1">Social Security (6.2%)</span>
      <span className="font-semibold">${socialSecurityTax}</span>
    </label>

    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={applyMedicare}
        onChange={(e) => setApplyMedicare(e.target.checked)}
        className="w-4 h-4 cursor-pointer"
      />
      <span className="flex-1">Medicare (1.45%)</span>
      <span className="font-semibold">${medicareTax}</span>
    </label>
  </div>

  {/* Net Pay */}
  <div className="bg-green-50 p-3 rounded">
    <p className="text-gray-600 text-sm">Net Pay</p>
    <p className="text-3xl font-bold text-green-600">${netPay}</p>
  </div>

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