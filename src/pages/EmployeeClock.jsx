import { useEffect, useState } from "react";
import { api } from "../services/api";
import Topbar from "../component/Topbar";
import { calculateOvertimeBreakdown } from "../utils/overtimeCalculations";

export default function EmployeeClock() {
  const [employee, setEmployee] = useState(null);
  const [logs, setLogs] = useState([]);
  const [now, setNow] = useState(new Date());

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filteredLogs, setFilteredLogs] = useState([]);

  const [loadingLogs, setLoadingLogs] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
    const [loadingAction2, setLoadingAction2] = useState(false);

  const [todayLog, setTodayLog] = useState({});

  // ✅ FETCH LOGS
  const fetchLogs = async (empId) => {
    setLoadingLogs(true);
    const res = await api.getEmployeeTimesheet({ employeeId: empId });

    if (res?.times) {
      const arr = Object.keys(res.times).map(date => ({
        date,
        ...res.times[date]
      }));

     setLogs(
      arr.sort((a, b) => new Date(b.date) - new Date(a.date))
    );

      const today = new Date().toLocaleDateString("en-CA");
      setTodayLog(res.times[today] || {});
    }

    setLoadingLogs(false);
  };

  useEffect(() => {
    const emp = JSON.parse(localStorage.getItem("user"));
    setEmployee(emp);
    fetchLogs(emp?.empId);

    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ✅ CLOCK IN
  const handleClockIn = async () => {
    setLoadingAction(true);

    await api.clockIn({
      employeeId: employee.empId,
      name: employee.name,
      email: employee.email,
      rate: employee.rate
    });

    await fetchLogs(employee.empId);
    setLoadingAction(false);
  };

  // ✅ CLOCK OUT
  const handleClockOut = async () => {
    setLoadingAction2(true);

    await api.clockOut({
      employeeId: employee.empId
    });

    await fetchLogs(employee.empId);
    setLoadingAction2(false);
  };

const calculateDayHours = (day) => {
  if (!day?.entries) return 0;

  return day.entries.reduce((sum, e) => {
    if (!e.in || !e.out) return sum;

    const start = new Date(`2024-01-01T${e.in}`);
    let end = new Date(`2024-01-01T${e.out}`);

    if (end < start) end.setDate(end.getDate() + 1);

    return sum + (end - start) / (1000 * 60 * 60);
  }, 0);
};

  // ✅ FILTER
const applyFilter = () => {
  if (!startDate || !endDate) return alert("Select dates");

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start > end) return alert("Invalid range");

  const filtered = logs.filter((l) => {
    const logDate = new Date(l.date);
    return logDate >= start && logDate <= end;
  });

  if (filtered.length === 0) {
  alert("No records found");
}

  setFilteredLogs(filtered);
};

const resetFilter = () => {
  setStartDate("");
  setEndDate("");
  setFilteredLogs([]);
};

  useEffect(() => {
    setFilteredLogs(logs);
  }, [logs]);

const activeLogs = startDate && endDate ? filteredLogs : logs;

const totalHours = activeLogs.reduce(
  (sum, log) => sum + calculateDayHours(log),
  0
);

// Calculate overtime breakdown
const overtimeData = calculateOvertimeBreakdown(totalHours, employee?.rate || 0);
const totalEarning = overtimeData.totalPay;

  // ✅ BUTTON STATE LOGIC
const lastEntry = todayLog?.entries?.[todayLog.entries.length - 1];

const isClockedIn = lastEntry?.in && !lastEntry?.out;
const isClockedOut = lastEntry?.out;
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600">
      <Topbar />

      <div className="max-w-5xl mx-auto p-4">

        {/* ✅ PROFILE CARD */}
        <div className="bg-white rounded-2xl shadow-lg p-5 flex flex-col md:flex-row justify-between gap-4">

          {/* LEFT */}
          <div>
            <h2 className="text-xl font-bold">{employee?.name}</h2>
            <p className="text-gray-500">${employee?.rate}/hr</p>
            <p className="text-sm mt-1">{now.toLocaleString()}</p>

            <div className="mt-3 text-sm">
          <p><strong>Clock In:</strong> {lastEntry?.in || "-"}</p>
          <p><strong>Clock Out:</strong> {lastEntry?.out || "-"}</p>
            </div>

            <div className="mt-3 text-sm">
              <p><strong>Total Hours:</strong> {totalHours.toFixed(2)}h</p>
              <p><strong>Regular Hours:</strong> {overtimeData.regularHours.toFixed(2)}h</p>
              <p><strong>Overtime Hours:</strong> <span className={overtimeData.overtimeHours > 0 ? "text-orange-600 font-bold" : ""}>{overtimeData.overtimeHours.toFixed(2)}h</span></p>
              <p className="mt-2"><strong>Regular Pay:</strong> ${overtimeData.regularPay.toFixed(2)}</p>
              <p><strong>Overtime Pay (1.5x):</strong> <span className={overtimeData.overtimePay > 0 ? "text-orange-600 font-bold" : ""}>${overtimeData.overtimePay.toFixed(2)}</span></p>
              <p className="mt-2 text-lg font-bold"><strong>Total Earnings:</strong> ${totalEarning.toFixed(2)}</p>
            </div>
          </div>

          {/* RIGHT BUTTONS */}
          <div className="flex flex-col gap-3 justify-center">

            <button
              onClick={handleClockIn}
              disabled={loadingAction || isClockedIn}
              className={`px-5 py-2 rounded-lg text-white font-medium cursor-pointer ${
                isClockedIn
                  ? "bg-gray-400"
                  : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {loadingAction ? "Processing..." : "Clock In"}
            </button>

            <button
              onClick={handleClockOut}
              disabled={loadingAction2 || !isClockedIn || isClockedOut}
              className={`px-5 py-2 rounded-lg text-white font-medium cursor-pointer ${
                !isClockedIn
                  ? "bg-gray-400"
                  : "bg-red-500 hover:bg-red-600"
              }`}
            >
              {loadingAction2 ? "Processing..." : "Clock Out"}
            </button>
          </div>
        </div>

        {/* ✅ FILTER */}
        <div className="bg-white mt-5 p-4 rounded-xl shadow flex flex-col md:flex-row gap-3 items-end">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border p-2 rounded w-full"
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border p-2 rounded w-full"
          />

          <button onClick={applyFilter} className="bg-blue-600 text-white px-4 py-2 rounded w-full md:w-auto cursor-pointer">
            Filter
          </button>

          <button onClick={resetFilter} className="bg-gray-500 text-white px-4 py-2 rounded w-full md:w-auto cursor-pointer">
            Reset
          </button>
        </div>

        {/* ✅ TABLE */}
        <div className="bg-white mt-5 p-4 rounded-xl shadow overflow-x-auto">
          <h3 className="font-semibold mb-3">Attendance History</h3>

          {loadingLogs ? (
            <div className="text-center py-10">Loading data...</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2">In</th>
                  <th className="p-2">Out</th>
                  <th className="p-2">Hours</th>
                  <th className="p-2">Earnings</th>
                </tr>
              </thead>

              <tbody>
                {activeLogs.map((log, i) => {
                  const hours = calculateDayHours(log);
                  const dayOvertimeData = calculateOvertimeBreakdown(hours, employee?.rate || 0);
                  const hasOvertime = dayOvertimeData.overtimeHours > 0;
                  const rowClass = hasOvertime ? "bg-orange-50" : "";

                  return (
                    <tr key={i} className={`border-b text-center ${rowClass}`}>
                      <td className="p-2 text-left">{log.date}</td>
                    <td>
                    {log.entries?.length
                      ? log.entries.map((e, idx) => (
                          <div key={idx}>{e.in || "-"}</div>
                        ))
                      : "-"}
                  </td>

                  <td>
                    {log.entries?.length
                      ? log.entries.map((e, idx) => (
                          <div key={idx}>{e.out || "-"}</div>
                        ))
                      : "-"}
                  </td>
                      <td className="font-semibold">{hours.toFixed(2)} Hr {hasOvertime && <span className="text-orange-600 text-xs ml-1">(OT: {dayOvertimeData.overtimeHours.toFixed(2)}h)</span>}</td>
                      <td>${dayOvertimeData.totalPay.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}