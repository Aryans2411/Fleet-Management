import React, { useState, useEffect } from "react";
import Navigation from "../Components/dashboard/navigation";
import Footer from "../Components/Footer/Footer";
export default function Home() {
  const [driversFreq, setDriverFreq] = useState(0);
  const [vehiclesFreq, setVehicleFreq] = useState(0);
  const [actvvehicle, setActvehicle] = useState(0);

  const [dashboardData, setDashboardData] = useState({
    profit: 0,
    revenue: 0,
    cost: 0,
    totalVehicles: 0,
    activeVehicles: 0,
    vehiclesInMaintenance: 0,
    unusedVehicles: 0,
    drivers: 0,
  });

  useEffect(() => {
    drivernumber();
    vehiclesnumber();
    actvehicle();
  }, []);

  const drivernumber = async () => {
    try {
      const response = await fetch(
        "http://localhost:4000/api/get_totaldriver",
        {
          method: "GET",
        }
      );
      if (!response.ok) {
        throw new Error("Error in fetching total frequency of drivers");
      }
      const data = await response.json();
      setDriverFreq(data);
      //  console.log(driversFreq);
    } catch (error) {
      console.error("Failed to fetch drivers frequency:", error.message);
    }
  };
  const vehiclesnumber = async () => {
    try {
      const response = await fetch(
        "http://localhost:4000/api/get_totalvehicles",
        {
          method: "GET",
        }
      );
      if (!response.ok) {
        throw new Error("Error in fetching total frequency of vehicles");
      }
      const data = await response.json();
      setVehicleFreq(data);
    } catch (error) {
      console.error("Failed to fetch vehicles frequency:", error);
    }
  };

  const actvehicle = async () => {
    try {
      const response = await fetch(
        "http://localhost:4000/api/get_active_vehicle",
        {
          method: "GET",
        }
      );
      if (!response.ok)
        throw new Error("Error in fetching total active vehicles");

      const data = await response.json();
      setActvehicle(data);
      console.log("total vehicles", vehiclesFreq);
      console.log("active vehicle", actvvehicle);
    } catch (error) {
      console.error("Failed to fetch active vehicles", error);
    }
  };
  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black min-h-screen flex flex-col">
      <Navigation />
      <div className="mt-6 p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Dashboard Cards */}
        <div className="card">
          <div className="p-6 bg-gray-800 text-white rounded-xl shadow-lg hover:scale-105 transition-transform cursor-pointer">
            <h3 className="text-xl font-semibold mb-2">Profit</h3>
            <p className="text-3xl font-bold text-green-400">
              {dashboardData.profit}
            </p>
          </div>
        </div>
        <div className="card">
          <div className="p-6 bg-gray-800 text-white rounded-xl shadow-lg hover:scale-105 transition-transform cursor-pointer">
            <h3 className="text-xl font-semibold mb-2">Revenue</h3>
            <p className="text-3xl font-bold text-blue-400">
              {dashboardData.revenue}
            </p>
          </div>
        </div>
        <div className="card">
          <div className="p-6 bg-gray-800 text-white rounded-xl shadow-lg hover:scale-105 transition-transform cursor-pointer">
            <h3 className="text-xl font-semibold mb-2">Cost</h3>
            <p className="text-3xl font-bold text-red-400">
              {dashboardData.cost}
            </p>
          </div>
        </div>
        <div className="card">
          <div className="p-6 bg-gray-800 text-white rounded-xl shadow-lg hover:scale-105 transition-transform cursor-pointer">
            <h3 className="text-xl font-semibold mb-2">Total Vehicles</h3>
            <p className="text-3xl font-bold text-yellow-400">{vehiclesFreq}</p>
          </div>
        </div>
        <div className="card">
          <div className="p-6 bg-gray-800 text-white rounded-xl shadow-lg hover:scale-105 transition-transform cursor-pointer">
            <h3 className="text-xl font-semibold mb-2">Active Vehicles</h3>
            <p className="text-3xl font-bold text-teal-400">{actvvehicle}</p>
          </div>
        </div>
        <div className="card">
          <div className="p-6 bg-gray-800 text-white rounded-xl shadow-lg hover:scale-105 transition-transform cursor-pointer">
            <h3 className="text-xl font-semibold mb-2">
              Vehicles in Maintenance
            </h3>
            <p className="text-3xl font-bold text-orange-400">
              {dashboardData.vehiclesInMaintenance}
            </p>
          </div>
        </div>
        <div className="card">
          <div className="p-6 bg-gray-800 text-white rounded-xl shadow-lg hover:scale-105 transition-transform cursor-pointer">
            <h3 className="text-xl font-semibold mb-2">Unused Vehicles</h3>
            <p className="text-3xl font-bold text-purple-400">
              {vehiclesFreq - actvvehicle}
            </p>
          </div>
        </div>
        <div className="p-6 bg-gray-800 text-white rounded-xl shadow-lg hover:scale-105 transition-transform cursor-pointer">
          <h3 className="text-xl font-semibold mb-2">Drivers</h3>
          <p className="text-3xl font-bold text-blue-400">{driversFreq}</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
