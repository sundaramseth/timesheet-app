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
const [sendEmailLoader, setSendEmailLoader] = useState(false);

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

function updateClockIn(date, val) {
  setManualTimes(prev => ({
    ...prev,
    [date]: { ...prev[date], in: val }
  }));
}

function updateClockOut(date, val) {
  setManualTimes(prev => ({
    ...prev,
    [date]: { ...prev[date], out: val }
  }));
}

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

function calculateHours(inTime, outTime, breakMinutes = 0) {
  if (!inTime || !outTime) return 0;

  const start = new Date(`2024-01-01T${inTime}`);
  let end = new Date(`2024-01-01T${outTime}`);

  // ✅ overnight fix
  if (end < start) {
    end.setDate(end.getDate() + 1);
  }

  let total = (end - start) / (1000 * 60 * 60);

  // ✅ subtract break
  total -= breakMinutes / 60;

  return total > 0 ? Number(total.toFixed(2)) : 0;
}

function formatHours(h) {
  const hr = Math.floor(h);
  const min = Math.round((h - hr) * 60);
  return `${hr}h ${min}m`;
}

/* ================= TOTAL ================= */

const totalHours = weekDates.reduce((sum, date) => {
  const key = formatDateLocal(date);
  const t = manualTimes[key] || {};
  return sum + calculateHours(t.in, t.out, t.breakMinutes);
}, 0);

const totalEarnings = totalHours * RATE;

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

/* ================= PDF ================= */

async function downloadPaystub() {
setDownloadLoader(true)

const res = await api.downloadPaystub({
  name: selectedEmp.name,
  email: selectedEmp.email,
  rate: selectedEmp.rate,
  weekStart:formatDateLocal(weekDates[0]),
  weekEnd:formatDateLocal(weekDates[6]),
  totalHours,
  totalPay:totalEarnings,
  filling_status:selectedEmp.filling_status,
  dependent:selectedEmp.depend
});

if (res.url) window.open(res.url);
else alert("Failed");

setDownloadLoader(false)
}

/* ================= EMAIL ================= */

async function sendPaystubEmail() { 
  if (!selectedEmp) return;

  setSendEmailLoader(true)

  await api.sendPaystubEmail({
    name: selectedEmp.name,
    email: selectedEmp.email,
    rate: selectedEmp.rate,
    weekStart: formatDateLocal(weekDates[0]),
    weekEnd: formatDateLocal(weekDates[6]),
    totalHours,
    totalPay: totalEarnings,
    filling_status:selectedEmp.filling_status,
    dependent:selectedEmp.depend
  });

  alert("Email sent!");
  setSendEmailLoader(false)
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

{loading ? (
  <p className="font-semibold text-white ">Loading TimeSheet...</p>
) : (
  <>
  {weekDates.map(date => {

  const key = formatDateLocal(date);
  const t = manualTimes[key] || {};

  const hours = calculateHours(t.in, t.out, t.breakMinutes);
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

      <div className="flex gap-3 mt-3">
        <input
          type="time"
          value={t.in || ""}
          onChange={(e)=>updateClockIn(key,e.target.value)}
          className="border p-2 w-full rounded"
        />

        <input
          type="time"
          value={t.out || ""}
          onChange={(e)=>updateClockOut(key,e.target.value)}
          className="border p-2 w-full rounded"
        />

        {/* ✅ ONLY CHANGE IN UI */}
        <button
          onClick={()=>addBreak(key)}
          className="bg-blue-500 text-white px-2 py-1 rounded text-xs text-center"
        > Break<br/>
          15&nbsp;min
        </button>

      </div>

    </div>
  );

})}
  </>
)}

<div id="paystub" className="bg-white p-6 rounded-xl shadow mt-6">

  <h2 className="text-xl font-bold mb-3">Paystub Summary</h2>

  <p><b>Name:</b> {selectedEmp?.name}</p>
  <p><b>Email:</b> {selectedEmp?.email}</p>
  <p><b>Rate:</b> ${RATE}/hr</p>

  <hr className="my-3"/>

  <p><b>Total Hours:</b> {formatHours(totalHours)}</p>
  <p><b>Total Pay:</b> ${totalEarnings.toFixed(2)}</p>

</div>

<div className="flex flex-col md:flex-row gap-3 mt-6">

  <button onClick={saveTimesheet} className="bg-green-600 text-white px-4 py-3 rounded w-full">
   {saveTimeLoader? "Saving..." :"Save Timesheet"}
  </button>

  <button onClick={downloadPaystub} className="bg-blue-800 text-white px-4 py-3 rounded w-full">
   {downloadLoader?"Downloading...":"Download PDF"} 
  </button>

  <button onClick={sendPaystubEmail} className="bg-purple-600 text-white px-4 py-3 rounded w-full">
   {sendEmailLoader?"Sending Email...": "Send Email"}
  </button>

</div>

</div>
</div>
);
}