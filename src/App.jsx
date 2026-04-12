import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Employees from "./pages/Employees";
import Timesheet from "./pages/Timesheet";
import EmployeeClock from "./pages/EmployeeClock";
import HistoryAllEmployee from "./pages/HistoryAllEmployee";

function App() {

  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Login />} />
        <Route path="/employeeclock" element={<EmployeeClock/>}/>
        <Route path="/home" element={<Timesheet />} />
        <Route path="/addemployee" element={<Employees/>}/>
        <Route path="/historyallemployee" element={<HistoryAllEmployee/>}/>

      </Routes>

    </BrowserRouter>
  );
}

export default App;