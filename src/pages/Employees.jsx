import { useEffect, useState } from "react";
import { api } from "../services/api";
import Topbar from "../component/Topbar";

export default function Employees() {

  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    rate: "",
    filling_status: "",
    depend: ""
  });

  const [addEmpLoader,setAddEmpLoader] = useState(false);
  const [loading,setLoading] = useState(false);
  const [editEmp, setEditEmp] = useState(null);

const handleDelete = async (id) => {
  if (!confirm("Delete this employee?")) return;

  await api.deleteEmployee(id);
  loadEmployees();
};

const startEdit = (emp) => {
  setEditEmp(emp);
};

const saveEdit = async () => {
  await api.updateEmployee(editEmp);
  setEditEmp(null);
  loadEmployees();
};

const loadEmployees = async () => {
  try {
    setLoading(true);

    const data = await api.getEmployees();

   // console.log("EMP API RESPONSE:", data);

    if (Array.isArray(data)) {
      setEmployees(data);
    } else {
      console.error("Invalid employee response", data);
      setEmployees([]);
    }

  } catch (err) {
    console.error("API ERROR:", err);
    setEmployees([]);
  } finally {
    setLoading(false);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAddEmpLoader(true)
    await api.addEmployee(form);

    setForm({
      name: "",
      email: "",
      phone: "",
      rate: "",
      filling_status: "",
      depend: ""
    });

    loadEmployees();

    setAddEmpLoader(false);
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 to-blue-600">

      {/* HEADER */}
      <header className="bg-white shadow">
        <Topbar />
      </header>

      <div className="max-w-5xl mx-auto p-6">

        {/* ===== ADD EMPLOYEE CARD ===== */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-blue-600 mb-6">
            Add Employee
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col md:grid md:grid-cols-2 gap-4">

            <input
              type="text"
              placeholder="Full Name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />

            <input
              type="email"
              placeholder="Email Address"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />

            <input
              type="text"
              placeholder="Phone Number"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <input
              type="number"
              placeholder="Hourly Rate ($)"
              value={form.rate}
              onChange={e => setForm({ ...form, rate: e.target.value })}
              className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />

            <input
              type="text"
              placeholder="Filing Status (Single / Married)"
              value={form.filling_status}
              onChange={e => setForm({ ...form, filling_status: e.target.value })}
              className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <input
              type="number"
              placeholder="Dependents"
              value={form.depend}
              onChange={e => setForm({ ...form, depend: e.target.value })}
              className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <button
              type="submit"
              className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
            >
             {addEmpLoader?"Saving Employee...":"Add Employee"} 
            </button>
          </form>
        </div>

        {/* ===== EMPLOYEE TABLE ===== */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-blue-600 mb-6">
            Employee List
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">

              <thead>
                <tr className="bg-blue-100 text-blue-700">
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3 text-center">Rate</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Dependents</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
                
       <tbody>
  {loading ? (
    <tr>
      <td colSpan="7" className="text-center p-4">
        Loading Employees Data...
      </td>
    </tr>
  ) : employees.length > 0 ? (
    employees.map(emp => (
      <tr key={emp.id} className="border-b hover:bg-gray-50">
        {editEmp?.id === emp.id ? (
        <>
          <td className="p-3"><input value={editEmp.name} onChange={e => setEditEmp({...editEmp, name: e.target.value})} /></td>
          <td className="p-3"><input value={editEmp.email} onChange={e => setEditEmp({...editEmp, email: e.target.value})} /></td>
          <td className="p-3"><input value={editEmp.phone} onChange={e => setEditEmp({...editEmp, phone: e.target.value})} /></td>
          <td className="p-3"><input value={editEmp.rate} onChange={e => setEditEmp({...editEmp, rate: e.target.value})} className="text-center" /></td>
          <td className="p-3"><input value={editEmp.filling_status} onChange={e => setEditEmp({...editEmp, filling_status: e.target.value})} className="text-center"  /></td>
          <td className="p-3"><input value={editEmp.depend} onChange={e => setEditEmp({...editEmp, depend: e.target.value})} className="text-center"  /></td>

          <td className="flex flex-row gap-2 p-2">
            <button onClick={saveEdit} className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded cursor-pointer text-xs">Save</button>
            <button onClick={() => setEditEmp(null)} className="bg-gray-400 hover:bg-gray-500 text-white px-2 py-1 rounded cursor-pointer text-xs">Cancel</button>
          </td>
        </>
      ) : (
        <>
          <td className="p-3">{emp.name}</td>
          <td className="p-3">{emp.email}</td>
          <td className="p-3">{emp.phone}</td>
          <td className="p-3 text-center">${emp.rate}</td>
          <td className="p-3 text-center">{emp.filling_status}</td>
          <td className="p-3 text-center">{emp.depend}</td>

          <td className="flex flex-row gap-2 p-2">
            <button onClick={() => startEdit(emp)} className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded cursor-pointer text-xs">Edit</button>
            <button onClick={() => handleDelete(emp.id)} className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded cursor-pointer text-xs">Delete</button>
          </td>
        </>
      )}
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="6" className="text-center p-4 text-gray-500">
        No employees found
      </td>
    </tr>
  )}
        </tbody>
              


            </table>
          </div>
        </div>

      </div>
    </div>
  );
}