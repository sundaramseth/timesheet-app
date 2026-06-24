import React, { useEffect, useState, useCallback } from "react";
import Topbar from "../component/Topbar";
import { api } from "../services/api";
import { calculateOvertimeBreakdown } from "../utils/overtimeCalculations";

function HistoryAllEmployee() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalHours, setTotalHours] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [regularHours, setRegularHours] = useState(0);
  const [overtimeHours, setOvertimeHours] = useState(0);
  const [regularPay, setRegularPay] = useState(0);
  const [overtimePay, setOvertimePay] = useState(0);
  const [ytdData, setYtdData] = useState(null);
  const [ytdloading, setYtdLoading] = useState(false);

  const loadEmployees = async () => {
    try {
      const data = await api.getEmployees();
      console.log("Loaded employees:", data);
      if (Array.isArray(data)) {
        setEmployees(data);
      } else {
        console.error("Employees data is not an array:", data);
        setEmployees([]);
      }
    } catch (err) {
      console.error("Error loading employees:", err);
    }
  };

const loadHistory = useCallback(async () => {

  if (!selectedEmployee) return;

  setLoading(true);

  try {

    const res = await api.getEmployeeYTD({
      employeeId: selectedEmployee.id,
      startDate,
      endDate
    });

    console.log("YTD Response:", res);

    if (!res || !res.history) {

      setHistoryData([]);
      setFilteredHistory([]);

      setTotalHours(0);
      setTotalEarnings(0);

      setRegularHours(0);
      setOvertimeHours(0);

      setRegularPay(0);
      setOvertimePay(0);

      return;
    }

    const history = [];

    let totalH = 0;
    let totalRegularHours = 0;
    let totalOvertimeHours = 0;

    let totalRegularPay = 0;
    let totalOvertimePay = 0;

    res.history.forEach(row => {

      const times = row.times || {};

      Object.keys(times).forEach(date => {

        const dayData = times[date];

        if (!dayData?.entries) return;

        dayData.entries.forEach(entry => {

          if (!entry.in || !entry.out) return;

          const start = new Date(`2024-01-01T${entry.in}`);

          let end = new Date(`2024-01-01T${entry.out}`);

          if (end < start) {
            end.setDate(end.getDate() + 1);
          }

          const hours =
            (end - start) /
            (1000 * 60 * 60);

          const earnings =
            hours *
            parseFloat(selectedEmployee.rate);

          history.push({
            date,
            in: entry.in,
            out: entry.out,
            hours,
            earnings,
            notes: dayData.notes || ""
          });

          totalH += hours;
        });

      });

      totalRegularHours += Number(row.regularHours || 0);

      totalOvertimeHours += Number(row.overtimeHours || 0);

      totalRegularPay += Number(row.regularPay || 0);

      totalOvertimePay += Number(row.overtimePay || 0);

    });

    history.sort(
      (a, b) =>
        new Date(a.date) -
        new Date(b.date)
    );

    setHistoryData(history);

    setFilteredHistory(history);

    setTotalHours(totalH);

    setRegularHours(totalRegularHours);

    setOvertimeHours(totalOvertimeHours);

    setRegularPay(totalRegularPay);

    setOvertimePay(totalOvertimePay);

    setTotalEarnings(
      totalRegularPay +
      totalOvertimePay
    );

  } catch (err) {

    console.error(err);

  } finally {

    setLoading(false);

  }

}, [
  selectedEmployee,
  startDate,
  endDate
]);

  const filterHistory = useCallback(() => {
    let filtered = historyData;
    if (startDate) {
      filtered = filtered.filter((item) => item.date >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter((item) => item.date <= endDate);
    }
    setFilteredHistory(filtered);
    setPage(1);
  }, [historyData, startDate, endDate]);

  useEffect(() => {
    loadEmployees();
  }, []);

 useEffect(() => {

  if (
    selectedEmployee &&
    startDate &&
    endDate
  ) {

    loadHistory();

  }

}, [
  selectedEmployee,
  startDate,
  endDate,
  loadHistory
]);

  useEffect(() => {
    filterHistory();
  }, [historyData, startDate, endDate, filterHistory]);

  const paginatedHistory = filteredHistory.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );
  const totalPages = Math.ceil(filteredHistory.length / pageSize);

const generateYTD = async () => {

  const res =
    await api.getEmployeeYTD({

      employeeId:
        selectedEmployee.id,

      startDate,

      endDate
    });

  if (!res) return;

  const gross =
    Number(res.grossPay || 0);

  const ss =
    gross * 0.062;

  const medicare =
    gross * 0.0145;

  const deductions =
    ss + medicare;

  const net =
    gross - deductions;

  setYtdData({

    totalHours:
      res.totalHours,

    regularHours:
      res.regularHours,

    overtimeHours:
      res.overtimeHours,

    regularPay:
      res.regularPay,

    overtimePay:
      res.overtimePay,

    gross,

    ss,

    medicare,

    deductions,

    net
  });
console.log("YTD DATA:", ytdData);
};

  const previewYTD = async () => {

  setYtdLoading(true);  

const totalHours =
  Number(ytdData?.totalHours || 0);

const regularHours =
  Number(ytdData?.regularHours || 0);

const overtimeHours =
  Number(ytdData?.overtimeHours || 0);

const regularPay =
  Number(ytdData?.regularPay || 0);

const overtimePay =
  Number(ytdData?.overtimePay || 0);
const payload = {

  name: selectedEmployee.name,
  email: selectedEmployee.email,
  rate: Number(selectedEmployee.rate),

  weekStart: startDate,
  weekEnd: endDate,

  totalHours,

  regularHours,

  overtimeHours,

  regularPay,

  overtimePay,

  globalNotes:
    `YTD Report (${startDate} - ${endDate})`,

  filling_status:
    selectedEmployee.filling_status,

  depend:
    selectedEmployee.depend,

  applySS: true,
  applyMedicare: true,

  applyFederalTax: false,
  federalTaxPercent: 0
};

  try {

   const newTab = window.open("", "_blank");

const result = await api.previewPaystub(payload);

if(result?.url){
   newTab.location.href = result.url;
}

    setYtdLoading(false);

  } catch (err) {

    console.error(
      "Preview failed",
      err
    );

    alert(
      "Unable to generate preview"
    );
  }
};

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <Topbar />
      </header>

      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Employee Timesheet History</h1>

        {/* Employee Selector */}
        <div className="bg-white p-4 rounded-xl shadow mb-6">
          <label className="block text-sm font-medium mb-2">
            Select Employee
          </label>
          <select
            value={selectedEmployee?.id || ""}
            onChange={(e) => {
              const emp = employees.find(
                (emp) => String(emp.id) === e.target.value,
              );
              setSelectedEmployee(emp);
            }}
            className="w-full p-2 border rounded"
          >
            <option value="">Select an employee</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </select>
        </div>

        {selectedEmployee && (
          <>
            {/* Date Filters */}
            <div className="bg-white p-4 rounded-xl shadow mb-6">
              <div className="flex gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="p-2 border rounded"
                  />
                </div>
              </div>

              <div className="mt-4 ">
                <button
  onClick={() => {

    loadHistory();

    generateYTD();

  }}

                  className="px-4 py-2 bg-green-600 text-white rounded cursor-pointer hover:bg-green-700"
                >
                  Generate YTD
                </button>
              </div>
            </div>

            {/* Employee Info */}
            <div className="bg-white p-6 rounded-xl shadow mb-6">
              <h2 className="text-lg font-bold mb-4">
                {selectedEmployee.name}
              </h2>
              <p className="text-gray-600 mb-1">
                <b>Rate:</b> ${selectedEmployee.rate}/hr
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-xs text-gray-600">Total Hours</p>
                  <p className="text-lg font-bold text-blue-600">
                    {totalHours.toFixed(2)}h
                  </p>
                </div>
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-xs text-gray-600">Regular Hours</p>
                  <p className="text-lg font-bold text-blue-600">
                    {regularHours.toFixed(2)}h
                  </p>
                </div>
                <div className="bg-orange-50 p-3 rounded border-l-4 border-orange-400">
                  <p className="text-xs text-gray-600">Overtime Hours</p>
                  <p className="text-lg font-bold text-orange-600">
                    {overtimeHours.toFixed(2)}h
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <p className="text-xs text-gray-600">Total Earnings</p>
                  <p className="text-lg font-bold text-green-600">
                    ${totalEarnings.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs text-gray-600">Regular Pay</p>
                  <p className="text-lg font-bold">${regularPay.toFixed(2)}</p>
                </div>
                <div className="bg-orange-50 p-3 rounded">
                  <p className="text-xs text-gray-600">Overtime Pay (1.5x)</p>
                  <p className="text-lg font-bold text-orange-600">
                    ${overtimePay.toFixed(2)}
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <p className="text-xs text-gray-600">Gross Pay</p>
                  <p className="text-lg font-bold text-green-600">
                    ${(regularPay + overtimePay).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* ytd */}
            {ytdData && (
              <div className="bg-green-50 p-6 rounded-xl shadow mb-6">
                <h2 className="font-bold text-xl mb-4">YTD Payroll Summary</h2>

                <p className="mb-2 flex items-center gap-2">
                  <b>Total Hours:</b>
                  {ytdData.totalHours.toFixed(2)}
                </p>

                <p className="mb-2 flex items-center gap-2">
                  <b>Regular Hours:</b>
                  {ytdData.regularHours.toFixed(2)}
                </p>

                <p className="mb-2 flex items-center gap-2">
                  <b>Overtime Hours:</b>
                  {ytdData.overtimeHours.toFixed(2)}
                </p>

                <p className="mb-2 flex items-center gap-2" >
                  <b>Gross Pay:</b> ${ytdData.gross.toFixed(2)}
                </p>

                <p className="mb-2 flex items-center gap-2">
                  <b>Social Security:</b> ${ytdData.ss.toFixed(2)}
                </p>

                <p className="mb-2 flex items-center gap-2">
                  <b>Medicare:</b> ${ytdData.medicare.toFixed(2)}
                </p>

                <p className="mb-2 flex items-center gap-2" >
                  <b>Net Pay:</b> ${ytdData.net.toFixed(2)}
                </p>
                <br/>
              <button
              onClick={previewYTD}
              className="bg-green-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-green-700"
            >
              {ytdloading ? (
                <span>Generating...</span>
              ) : (
                "Generate YTD Preview"
              )}
            </button>
              </div>
            )}

            {/* History Table */}
            <div className="bg-white p-4 rounded-xl shadow">
              <h2 className="text-lg font-bold mb-4">Clock History</h2>
              {loading ? (
                <p>Loading...</p>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left p-2 text-sm">Date</th>
                          <th className="text-left p-2 text-sm">Clock In</th>
                          <th className="text-left p-2 text-sm">Clock Out</th>
                          <th className="text-left p-2 text-sm">Hours</th>
                          <th className="text-left p-2 text-sm">Status</th>
                          <th className="text-left p-2 text-sm">Earnings</th>
                          <th className="text-left p-2 text-sm">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedHistory.map((item, index) => {
                          const overtimeData = calculateOvertimeBreakdown(
                            item.hours,
                            parseFloat(selectedEmployee.rate),
                          );
                          const isOvertime = overtimeData.overtimeHours > 0;
                          const rowClass = isOvertime
                            ? "bg-orange-50 border-l-4 border-orange-400"
                            : "";

                          return (
                            <tr key={index} className={`border-b ${rowClass}`}>
                              <td className="p-2 text-sm">{item.date}</td>
                              <td className="p-2 text-sm">{item.in}</td>
                              <td className="p-2 text-sm">{item.out}</td>
                              <td className="p-2 text-sm font-semibold">
                                {item.hours.toFixed(2)}h
                              </td>
                              <td className="p-2 text-sm">
                                {isOvertime ? (
                                  <span className="bg-orange-200 text-orange-800 px-2 py-1 rounded text-xs font-semibold">
                                    ⚠️ Overtime:{" "}
                                    {overtimeData.overtimeHours.toFixed(2)}h
                                  </span>
                                ) : (
                                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                    Regular
                                  </span>
                                )}
                              </td>
                              <td className="p-2 text-sm font-semibold">
                                ${item.earnings.toFixed(2)}
                              </td>
                              <td
                                className="p-2 text-sm text-gray-600 max-w-xs truncate"
                                title={item.notes}
                              >
                                {item.notes || "-"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="flex justify-between items-center mt-4">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span>
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                      className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default HistoryAllEmployee;
