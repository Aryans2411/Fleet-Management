import React from "react";
import Navigation from "../Components/dashboard/navigation";
import Footer from "../Components/Footer/Footer";
import { MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const LeafletMap = () => {
  const LocationMarker = () => {
    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;
        alert(`Latitude: ${lat}, Longitude: ${lng}`);
      },
    });

    return null;
  };

  return (
    <div className="flex justify-center items-center mt-10">
      <MapContainer
        className="w-full max-w-4xl h-96 rounded-lg shadow-md"
        center={[51.505, -0.09]}
        zoom={13}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <LocationMarker />
      </MapContainer>
    </div>
  );
};

export default function Trip() {
  return (
    <div>
      <Navigation />
      <h1 className="text-2xl font-bold text-center my-5">Interactive Map</h1>
      <LeafletMap />
      <Footer />
    </div>
  );
};