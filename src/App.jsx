import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Employees from "./pages/Employees";
import Timesheet from "./pages/Timesheet";

function App() {

  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Timesheet />} />
        <Route path="/addemployee" element={<Employees/>}/>

      </Routes>

    </BrowserRouter>
  );
}

export default App;