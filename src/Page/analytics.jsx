import React, { useState } from "react";
import axios from "axios";
import Navigation from "../Components/dashboard/navigation";
import Footer from "../Components/Footer/Footer";

export default function Analytics() {
  // State to manage form visibility and animation
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formAnimation, setFormAnimation] = useState("");

  // State to manage form data
  const [formData, setFormData] = useState({
    make: "",
    registrationnumber: "",
    fueltype: "",
    idealmileage: "",
  });

  // State to manage prediction results
  const [predictionResult, setPredictionResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle input changes in the form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Toggle form visibility with smooth animation
  const toggleForm = () => {
    if (isFormOpen) {
      setFormAnimation("opacity-0");
      setTimeout(() => {
        setIsFormOpen(false);
        setFormAnimation("");
      }, 300);
    } else {
      setIsFormOpen(true);
      setFormAnimation("opacity-100");
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setPredictionResult(null);

    try {
      // Prepare data for submission
      const submissionData = {
        make: formData.make,
        registrationnumber: formData.registrationnumber,
        fueltype: formData.fueltype,
        idealmileage: parseFloat(formData.idealmileage)
      };

      // Send POST request to prediction endpoint
      const response = await axios.post('http://localhost:5001/predict', submissionData);
      
      // Update state with prediction results
      setPredictionResult(response.data);
      
      // Optional: Reset form after successful submission
      setFormData({
        make: "",
        registrationnumber: "",
        fueltype: "",
        idealmileage: "",
      });
    } catch (err) {
      // Handle any errors during submission
      setError(err.response?.data?.message || "An error occurred during prediction");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Vehicle Prediction Analytics</h1>
          <button 
            onClick={toggleForm}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
          >
            {isFormOpen ? "Close Form" : "Add New Vehicle"}
          </button>
        </div>

        {isFormOpen && (
          <div
            className={`mt-8 bg-gray-800 p-6 rounded-lg shadow-md transition-opacity duration-300 ease-in-out ${formAnimation}`}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  className="block text-sm font-medium text-gray-300"
                  htmlFor="make"
                >
                  Vehicle Model
                </label>
                <input
                  type="text"
                  id="make"
                  name="make"
                  value={formData.make}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md bg-gray-700 text-white border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                  placeholder="Enter vehicle model"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-gray-300"
                  htmlFor="registrationnumber"
                >
                  Registration Number
                </label>
                <input
                  type="text"
                  id="registrationnumber"
                  name="registrationnumber"
                  value={formData.registrationnumber}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md bg-gray-700 text-white border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                  placeholder="Enter registration number"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-gray-300"
                  htmlFor="fueltype"
                >
                  Fuel Type
                </label>
                <select
                  id="fueltype"
                  name="fueltype"
                  value={formData.fueltype}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md bg-gray-700 text-white border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="" disabled>
                    Select Fuel Type
                  </option>
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                </select>
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-gray-300"
                  htmlFor="idealmileage"
                >
                  Mileage (km/l)
                </label>
                <input
                  type="number"
                  id="idealmileage"
                  name="idealmileage"
                  value={formData.idealmileage}
                  onChange={handleInputChange}
                  step="0.01"
                  className="mt-1 block w-full rounded-md bg-gray-700 text-white border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                  placeholder="Enter vehicle mileage"
                />
              </div>

              <div className="flex justify-between items-center">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                >
                  {isLoading ? "Processing..." : "Get Prediction"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Prediction Result Display */}
        {predictionResult && (
          <div className="mt-6 bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Prediction Results</h2>
            <pre className="bg-gray-700 p-4 rounded">
              {JSON.stringify(predictionResult, null, 2)}
            </pre>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-6 bg-red-900 text-red-200 p-4 rounded-lg">
            <p>{error}</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}