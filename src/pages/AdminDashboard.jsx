import { useState, useEffect } from "react";
import { callAPI } from "../api";
//import { useNavigate } from "react-router-dom";
import Topbar from "../component/Topbar";

export default function AdminDashboard() {

  //const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [employee, setEmployee] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);

  // Load employees
  useEffect(() => {
    async function loadEmployees() {
      try {
       const res = await callAPI("getEmployees");

        console.log("Employees API:", res);

        if (Array.isArray(res)) {
          setEmployees(res);
        } else if (Array.isArray(res.data)) {
          setEmployees(res.data);
        } else {
          setEmployees([]);
        }

      } catch (err) {
        console.error("Employee load error:", err);
        setEmployees([]);
      }
    }

    loadEmployees();
  }, []);

  // Download Paystub
  async function downloadPDF() {

    if (!employee || !startDate || !endDate) {
      alert("Please select employee and dates");
      return;
    }

    setLoading(true);

    try {

      const res = await callAPI( "downloadPaystub",{
        employee,
        startDate,
        endDate
      });

      if (res.url) {
        window.open(res.url);
      } else {
        alert("Failed to generate PDF");
      }

    } catch (err) {
      console.error(err);
      alert("Error generating PDF");
    }

    setLoading(false);
  }

  // Send Email
  async function sendEmail() {

    if (!employee || !startDate || !endDate) {
      alert("Please select employee and dates");
      return;
    }

    setLoading2(true);

    try {

      const res = await callAPI("sendPaystubEmail",{
        employee,
        startDate,
        endDate
      });

      if (res.status) {
        alert("Email sent successfully!");
      } else {
        alert("Failed to send email");
      }

    } catch (err) {
      console.error(err);
      alert("Error sending email");
    }

    setLoading2(false);
  }
  
  // function logout(){
  // localStorage.removeItem("user");
  //   navigate("/");
  // }

  return (

    <div className="min-h-screen bg-gray-50">

      {/* Header */}

      <header className="bg-white shadow-sm border-b border-gray-200">

        <Topbar name={"Admin Dashboard"}/>

      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">

        <div className="px-4 py-6 sm:px-0">

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">

            <div className="px-4 py-5 sm:p-6">

              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Paystub Management</h3>

              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>

                <div>

                  <label htmlFor="employee" className="block text-sm font-medium text-gray-700">

                    Select Employee

                  </label>

                  <select

                    id="employee"

                    name="employee"

                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"

                    value={employee}

                    onChange={(e) => setEmployee(e.target.value)}

                  >

                    <option value="">Select Employee</option>

                    {Array.isArray(employees) &&

                      employees.map((e, i) => (

                        <option key={i} value={e.name || e}>

                          {e.name || e}

                        </option>

                      ))}

                  </select>

                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">

                  <div>

                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">

                      Pay Period Start

                    </label>

                    <input

                      type="date"

                      name="startDate"

                      id="startDate"

                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2"

                      value={startDate}

                      onChange={(e) => setStartDate(e.target.value)}

                    />

                  </div>

                  <div>

                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">

                      Pay Period End

                    </label>

                    <input

                      type="date"

                      name="endDate"

                      id="endDate"

                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2"

                      value={endDate}

                      onChange={(e) => setEndDate(e.target.value)}

                    />

                  </div>

                </div>

                <div className="flex flex-col sm:flex-row gap-4">

                  <button

                    type="button"

                    onClick={downloadPDF}

                    disabled={loading}

                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition duration-150 ease-in-out flex-1 justify-center"

                  >

                    {loading ? (

                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">

                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>

                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>

                      </svg>

                    ) : (

                      <svg className="-ml-1 mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">

                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />

                      </svg>

                    )}

                    {loading ? "Processing..." : "Download Paystub PDF"}

                  </button>

                  <button

                    type="button"

                    onClick={sendEmail}

                    disabled={loading2}

                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition duration-150 ease-in-out flex-1 justify-center"

                  >

                    {loading2 ? (

                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">

                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>

                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>

                      </svg>

                    ) : (

                      <svg className="-ml-1 mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">

                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />

                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />

                      </svg>

                    )}

                    {loading2 ? "Sending..." : "Send Email"}

                  </button>

                </div>

              </form>

            </div>

          </div>

        </div>

      </main>

    </div>

  );
}