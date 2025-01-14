import React, { useState, useEffect } from "react";

import Navigation from "../Components/dashboard/navigation";

export default function Home() {
  const [dashboardData, setDashboardData] = useState({
    profit: 0,
    revenue: 0,
    cost: 0,
    totalVehicles: 0,
    activeVehicles: 0,
    vehiclesInMaintenance: 0,
    unusedVehicles: 0,
  });

  useEffect(() => {
    fetch("/api/dashboard")
      .then((response) => response.json())
      .then((data) => setDashboardData(data))
      .catch((error) => console.error("Error fetching dashboard data:", error));
  }, []);

  return (
    <div className="bg-black max-h-screen">
      <Navigation />
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ">
        {/* Dashboard Cards */}
        <div className="card">
          <div className="p-4 bg-gray-800 text-white rounded-md shadow-md hover:bg-gray-700 cursor-pointer">
            <h3 className="text-lg font-semibold">Profit</h3>
            <p className="text-2xl">{dashboardData.profit}</p>
          </div>
        </div>
        <div className="card">
          <div className="p-4 bg-gray-800 text-white rounded-md shadow-md hover:bg-gray-700 cursor-pointer">
            <h3 className="text-lg font-semibold">Revenue</h3>
            <p className="text-2xl">{dashboardData.revenue}</p>
          </div>
        </div>
        <div className="card">
          <div className="p-4 bg-gray-800 text-white rounded-md shadow-md hover:bg-gray-700 cursor-pointer">
            <h3 className="text-lg font-semibold">Cost</h3>
            <p className="text-2xl">{dashboardData.cost}</p>
          </div>
        </div>
        <div className="card">
          <div className="p-4 bg-gray-800 text-white rounded-md shadow-md hover:bg-gray-700 cursor-pointer">
            <h3 className="text-lg font-semibold">Total Vehicle</h3>
            <p className="text-2xl">{dashboardData.totalVehicles}</p>
          </div>
        </div>
        <div className="card">
          <div className="p-4 bg-gray-800 text-white rounded-md shadow-md hover:bg-gray-700 cursor-pointer">
            <h3 className="text-lg font-semibold">Active Vehicles</h3>
            <p className="text-2xl">{dashboardData.activeVehicles}</p>
          </div>
        </div>
        <div className="card">
          <div className="p-4 bg-gray-800 text-white rounded-md shadow-md hover:bg-gray-700 cursor-pointer">
            <h3 className="text-lg font-semibold">Vehicles in Maintenance</h3>
            <p className="text-2xl">{dashboardData.vehiclesInMaintenance}</p>
          </div>
        </div>
        <div className="card">
          <div className="p-4 bg-gray-800 text-white rounded-md shadow-md hover:bg-gray-700 cursor-pointer">
            <h3 className="text-lg font-semibold">Unused Vehicle</h3>
            <p className="text-2xl">{dashboardData.unusedVehicles}</p>
          </div>
        </div>
      </div>
      <div></div>
    </div>
  );
}
