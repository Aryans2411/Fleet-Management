import logo from "./logo.svg";
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Example from "./dashboard.js";
import Vehicle from "./vehicle.js";
import Driver from "./driver.js";
import Analytics from "./analytics.js";
import Home from "./home.js";

function App() {
  return (
    <div className=" ">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/vehicle" element={<Vehicle />} />
          {/* Add routes for other pages as needed */}
          <Route path="/driver" element={<Driver />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
