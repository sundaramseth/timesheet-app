import React, { useEffect, useState, useCallback } from 'react';
import Topbar from '../component/Topbar';
import { api } from '../services/api';

function HistoryAllEmployee() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalHours, setTotalHours] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);

  const loadEmployees = async () => {
    try {
      const data = await api.getEmployees();
      console.log('Loaded employees:', data);
      if (Array.isArray(data)) {
        setEmployees(data);
      } else {
        console.error('Employees data is not an array:', data);
        setEmployees([]);
      }
    } catch (err) {
      console.error('Error loading employees:', err);
    }
  };

  const loadHistory = useCallback(async () => {
    console.log('Loading history for employee:', selectedEmployee);
    setLoading(true);
    try {
      const res = await api.getEmployeeTimesheet({ employeeId: selectedEmployee.id });
      console.log('API response:', res);
      if (res?.times) {
        const history = [];
        let totalH = 0;
        Object.keys(res.times).forEach(date => {
          const dayData = res.times[date];
          if (dayData?.entries) {
            dayData.entries.forEach(entry => {
              if (entry.in && entry.out) {
                const start = new Date(`2024-01-01T${entry.in}`);
                let end = new Date(`2024-01-01T${entry.out}`);
                if (end < start) end.setDate(end.getDate() + 1);
                const hours = (end - start) / (1000 * 60 * 60) - ((dayData.breakMinutes || 0) / 60) / dayData.entries.length; // approximate break per entry
                totalH += hours;
                const earnings = hours * parseFloat(selectedEmployee.rate);
                history.push({
                  date,
                  in: entry.in,
                  out: entry.out,
                  hours,
                  earnings
                });
              }
            });
          }
        });
        console.log('Processed history:', history);
        setHistoryData(history);
        setTotalHours(totalH);
        setTotalEarnings(totalH * parseFloat(selectedEmployee.rate));
      } else {
        console.log('No times data in response');
      }
    } catch (err) {
      console.error('Error loading history:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedEmployee]);

  const filterHistory = useCallback(() => {
    let filtered = historyData;
    if (startDate) {
      filtered = filtered.filter(item => item.date >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(item => item.date <= endDate);
    }
    setFilteredHistory(filtered);
    setPage(1);
  }, [historyData, startDate, endDate]);

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    console.log('Selected employee changed:', selectedEmployee);
    if (selectedEmployee) {
      loadHistory();
    } else {
      setHistoryData([]);
      setFilteredHistory([]);
      setTotalHours(0);
      setTotalEarnings(0);
    }
  }, [selectedEmployee, loadHistory]);

  useEffect(() => {
    filterHistory();
  }, [historyData, startDate, endDate, filterHistory]);

  const paginatedHistory = filteredHistory.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filteredHistory.length / pageSize);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <Topbar />
      </header>

      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Employee Timesheet History</h1>

        {/* Employee Selector */}
        <div className="bg-white p-4 rounded-xl shadow mb-6">
          <label className="block text-sm font-medium mb-2">Select Employee</label>
          <select
            value={selectedEmployee?.id || ''}
            onChange={(e) => {
              const emp = employees.find(emp => String(emp.id) === e.target.value);
              setSelectedEmployee(emp);
            }}
            className="w-full p-2 border rounded"
          >
            <option value="">Select an employee</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
        </div>

        {selectedEmployee && (
          <>
            {/* Date Filters */}
            <div className="bg-white p-4 rounded-xl shadow mb-6">
              <div className="flex gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="p-2 border rounded"
                  />
                </div>
              </div>
            </div>

            {/* Employee Info */}
            <div className="bg-white p-4 rounded-xl shadow mb-6">
              <h2 className="text-lg font-bold mb-2">{selectedEmployee.name}</h2>
              <p className="text-gray-500 mb-1">Rate: ${selectedEmployee.rate}/hr</p>
              <p className="text-gray-500 mb-1">Total Hours: {totalHours.toFixed(2)}</p>
              <p className="text-gray-500 mb-1">Total Earnings: ${totalEarnings.toFixed(2)}</p>
            </div>

            {/* History Table */}
            <div className="bg-white p-4 rounded-xl shadow">
              <h2 className="text-lg font-bold mb-4">Clock History</h2>
              {loading ? (
                <p>Loading...</p>
              ) : (
                <>
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Date</th>
                        <th className="text-left p-2">Clock In</th>
                        <th className="text-left p-2">Clock Out</th>
                        <th className="text-left p-2">Hours</th>
                        <th className="text-left p-2">Earnings</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedHistory.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{item.date}</td>
                          <td className="p-2">{item.in}</td>
                          <td className="p-2">{item.out}</td>
                          <td className="p-2">{item.hours.toFixed(2)}</td>
                          <td className="p-2">${item.earnings.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Pagination */}
                  <div className="flex justify-between items-center mt-4">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span>Page {page} of {totalPages}</span>
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
