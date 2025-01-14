import React, { useState, useEffect } from "react";
import Navigation from "../Components/dashboard/navigation";
import Footer from "../Components/Footer/Footer";
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
            <p className="text-3xl font-bold text-yellow-400">
              {dashboardData.totalVehicles}
            </p>
          </div>
        </div>
        <div className="card">
          <div className="p-6 bg-gray-800 text-white rounded-xl shadow-lg hover:scale-105 transition-transform cursor-pointer">
            <h3 className="text-xl font-semibold mb-2">Active Vehicles</h3>
            <p className="text-3xl font-bold text-teal-400">
              {dashboardData.activeVehicles}
            </p>
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
              {dashboardData.unusedVehicles}
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
