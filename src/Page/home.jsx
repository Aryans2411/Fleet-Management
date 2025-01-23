import React, { useState, useEffect } from "react";
import Navigation from "../Components/dashboard/navigation";
import Footer from "../Components/Footer/Footer";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
export default function Home() {
  const [driversFreq, setDriverFreq] = useState(0);
  const [vehiclesFreq, setVehicleFreq] = useState(0);
  const [actvvehicle, setActvehicle] = useState(0);
  const [maintv, setmainv] = useState(0);
  const [tripInfo, setTripInfo] = useState([]);

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
    maintenance_vehicle();
    getTripInfo();
  }, []);

  const customIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    shadowSize: [41, 41],
  });

  const MapClickHandler = ({ onMapClick }) => {
    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;
        onMapClick(lat, lng);
      },
    });
    return null;
  };

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
      // console.log("total vehicles", vehiclesFreq);
      // console.log("active vehicle", actvvehicle);
    } catch (error) {
      console.error("Failed to fetch active vehicles", error);
    }
  };

  const maintenance_vehicle = async () => {
    try {
      const response = await fetch(
        "http://localhost:4000/api/get_total_maintenance_vehicles",
        {
          method: "GET",
        }
      );
      if (!response.ok)
        throw new Error("Error in fetching total active vehicles");

      const data = await response.json();
      setmainv(data);
      console.log("total vehicles", vehiclesFreq);
      console.log("active vehicle", actvvehicle);
    } catch (error) {
      console.error("Failed to fetch active vehicles", error);
    }
  };

  const getTripInfo = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/get_all_trips", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Error fetching trip list");
      }

      const data = await response.json();
      console.log(data);
      setTripInfo(data);
    } catch (error) {
      console.error("Failed to fetch trips:", error.message);
    }
  };

  const RoutingMachine = ({ from, to, color = "#0000ff" }) => {
    // Added color prop with default value
    const map = useMap();
    const [routingControl, setRoutingControl] = useState(null);

    useEffect(() => {
      if (!map || !from || !to) return;

      try {
        // Remove existing routing control if it exists
        if (routingControl) {
          map.removeControl(routingControl);
        }

        // Create new routing control with dynamic color
        const control = L.Routing.control({
          waypoints: [L.latLng(from[0], from[1]), L.latLng(to[0], to[1])],
          routeWhileDragging: false,
          addWaypoints: false,
          draggableWaypoints: false,
          fitSelectedRoutes: false,
          showAlternatives: false,
          lineOptions: {
            styles: [{ color: color, opacity: 0.6, weight: 4 }], // Use dynamic color here
          },
          createMarker: () => null, // Disable default markers
        })
          .on("routingerror", function (e) {
            console.log("Routing error:", e);
          })
          .addTo(map);

        setRoutingControl(control);

        // Cleanup function
        return () => {
          if (map && control) {
            try {
              control.getPlan().setWaypoints([]);
              map.removeControl(control);
              // Clean up any remaining routing layers
              map.eachLayer((layer) => {
                if (layer._routing) {
                  map.removeLayer(layer);
                }
              });
            } catch (error) {
              console.log("Cleanup error:", error);
            }
          }
        };
      } catch (error) {
        console.log("Routing control error:", error);
      }
    }, [map, from, to, color]); // Added color to dependency array

    return null;
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
            <p className="text-3xl font-bold text-orange-400">{maintv}</p>
          </div>
        </div>
        <div className="card">
          <div className="p-6 bg-gray-800 text-white rounded-xl shadow-lg hover:scale-105 transition-transform cursor-pointer">
            <h3 className="text-xl font-semibold mb-2">Unused Vehicles</h3>
            <p className="text-3xl font-bold text-purple-400">
              {vehiclesFreq - actvvehicle - maintv}
            </p>
          </div>
        </div>
        <div className="p-6 bg-gray-800 text-white rounded-xl shadow-lg hover:scale-105 transition-transform cursor-pointer">
          <h3 className="text-xl font-semibold mb-2">Drivers</h3>
          <p className="text-3xl font-bold text-blue-400">{driversFreq}</p>
        </div>
      </div>
      <div className="flex justify-center  mb-12 mt-6 ">
        <MapContainer
          style={{ height: "75vh", width: "95%" }}
          center={[12.9716, 77.5946]}
          zoom={12.5}
          key={tripInfo.length} // Force re-render when trips change
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {tripInfo.map((trip, index) => {
            const pathColors = [
              "#FF5733",
              "#33FF57",
              "#3357FF",
              "#FF33A1",
              "#FF8C00",
            ]; // List of colors
            const color = pathColors[index % pathColors.length]; // Cycle through colors

            return (
              trip.startlatitude &&
              trip.startlongitude &&
              trip.endlatitude &&
              trip.endlongitude && (
                <React.Fragment key={index}>
                  <Marker
                    position={[trip.startlatitude, trip.startlongitude]}
                    icon={customIcon}
                  >
                    <Popup>
                      Trip Start Point
                      <br />
                      Start: {trip.startlatitude}, {trip.startlongitude}
                      <br />
                      Distance: {trip.distancetravelled} km
                    </Popup>
                  </Marker>
                  <Marker
                    position={[trip.endlatitude, trip.endlongitude]}
                    icon={customIcon}
                  >
                    <Popup>
                      Trip End Point
                      <br />
                      End: {trip.endlatitude}, {trip.endlongitude}
                      <br />
                      Distance: {trip.distancetravelled} km
                    </Popup>
                  </Marker>
                  <RoutingMachine
                    from={[trip.startlatitude, trip.startlongitude]}
                    to={[trip.endlatitude, trip.endlongitude]}
                    color={color} // Pass the unique color for this route
                  />
                </React.Fragment>
              )
            );
          })}
        </MapContainer>
      </div>
      <Footer />
    </div>
  );
}
