import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Employees from "./pages/Employees";
import Timesheet from "./pages/Timesheet";
import EmployeeClock from "./pages/EmployeeClock";

function App() {

  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Login />} />
        <Route path="/employeeclock" element={<EmployeeClock/>}/>
        <Route path="/home" element={<Timesheet />} />
        <Route path="/addemployee" element={<Employees/>}/>

      </Routes>

    </BrowserRouter>
  );
}

export default App;