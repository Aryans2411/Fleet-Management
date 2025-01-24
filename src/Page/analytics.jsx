import React, { useState } from "react";
import axios from "axios";
import Navigation from "../Components/dashboard/navigation";
import Footer from "../Components/Footer/Footer";

export default function Analytics() {
  // State to manage form data with all specified parameters
  const [formData, setFormData] = useState({
    engine_rpm: '',
    lub_oil_pressure: '',
    fuel_pressure: '',
    coolant_pressure: '',
    lub_oil_temp: '',
    coolant_temp: '',
    fuel_type: '',
    mileage: '',
    fuel_consumption_rate: '',
    engine_runtime: '',
    temperature_difference: ''
  });

  // State for managing form submission and results
  const [predictionResult, setPredictionResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle input changes for all form fields
  const handleInputChange = (e) => {
  const { name, value } = e.target;
  
  // Debugging: Log the input details
  console.log('Input Change:', { name, value });

  // Special handling for fuel_type
  if (name === 'fuel_type') {
    // Convert fuel type to numerical representation
    const fuelTypeValue = value === 'petrol' ? 0.0 : 
                          value === 'diesel' ? 1.0 : 
                          value;
    
    setFormData(prevState => ({
      ...prevState,
      [name]: value, // Keep the string value for display
      [`${name}_numeric`]: fuelTypeValue // Store numeric value separately
    }));
  } else {
    // Default handling for other inputs
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  }
};

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setPredictionResult(null);

    try {
      // Prepare data for submission with parsed float values
      const submissionData = {
      engine_rpm: parseFloat(formData.engine_rpm),
      lub_oil_pressure: parseFloat(formData.lub_oil_pressure),
      fuel_pressure: parseFloat(formData.fuel_pressure),
      coolant_pressure: parseFloat(formData.coolant_pressure),
      lub_oil_temp: parseFloat(formData.lub_oil_temp),
      coolant_temp: parseFloat(formData.coolant_temp),
      fuel_type: formData.fuel_type === 'petrol' ? 0.0 : 1.0,
      mileage: parseFloat(formData.mileage),
      fuel_consumption_rate: parseFloat(formData.fuel_consumption_rate),
      engine_runtime: parseFloat(formData.engine_runtime),
      temperature_difference: parseFloat(formData.temperature_difference)
    };

      // Send POST request to prediction endpoint
      const response = await axios.post('http://localhost:5001/predict', submissionData);
      
      // Update state with prediction results
      setPredictionResult(response.data);
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
        <h1 className="text-3xl font-bold mb-6 text-center">Predictive Maintenance Analysis</h1>
        
        <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-lg">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Engine RPM */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Engine RPM
              </label>
              <input
                type="number"
                name="engine_rpm"
                value={formData.engine_rpm}
                onChange={handleInputChange}
                step="0.01"
                className="w-full bg-gray-700 text-white rounded-md border-gray-600 focus:ring-indigo-500"
                placeholder="Enter Engine RPM"
                required
              />
            </div>

            {/* Lub Oil Pressure */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Lubricant Oil Pressure
              </label>
              <input
                type="number"
                name="lub_oil_pressure"
                value={formData.lub_oil_pressure}
                onChange={handleInputChange}
                step="0.01"
                className="w-full bg-gray-700 text-white rounded-md border-gray-600 focus:ring-indigo-500"
                placeholder="Enter Lub Oil Pressure"
                required
              />
            </div>

            {/* Fuel Pressure */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Fuel Pressure
              </label>
              <input
                type="number"
                name="fuel_pressure"
                value={formData.fuel_pressure}
                onChange={handleInputChange}
                step="0.01"
                className="w-full bg-gray-700 text-white rounded-md border-gray-600 focus:ring-indigo-500"
                placeholder="Enter Fuel Pressure"
                required
              />
            </div>

            {/* Coolant Pressure */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Coolant Pressure
              </label>
              <input
                type="number"
                name="coolant_pressure"
                value={formData.coolant_pressure}
                onChange={handleInputChange}
                step="0.01"
                className="w-full bg-gray-700 text-white rounded-md border-gray-600 focus:ring-indigo-500"
                placeholder="Enter Coolant Pressure"
                required
              />
            </div>

            {/* Lub Oil Temperature */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Lubricant Oil Temperature
              </label>
              <input
                type="number"
                name="lub_oil_temp"
                value={formData.lub_oil_temp}
                onChange={handleInputChange}
                step="0.01"
                className="w-full bg-gray-700 text-white rounded-md border-gray-600 focus:ring-indigo-500"
                placeholder="Enter Lub Oil Temp"
                required
              />
            </div>

            {/* Coolant Temperature */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Coolant Temperature
              </label>
              <input
                type="number"
                name="coolant_temp"
                value={formData.coolant_temp}
                onChange={handleInputChange}
                step="0.01"
                className="w-full bg-gray-700 text-white rounded-md border-gray-600 focus:ring-indigo-500"
                placeholder="Enter Coolant Temp"
                required
              />
            </div>
            {/* Fuel Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Fuel Type
              </label>
              <select
                name="fuel_type"
                value={formData.fuel_type}
                onChange={handleInputChange}
                className="w-full bg-gray-700 text-white rounded-md border-gray-600 focus:ring-indigo-500"
                required
              >
                <option value="">Select Fuel Type</option>
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
              </select>
            </div>

            {/* Mileage */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mileage
              </label>
              <input
                type="number"
                name="mileage"
                value={formData.mileage}
                onChange={handleInputChange}
                step="0.01"
                className="w-full bg-gray-700 text-white rounded-md border-gray-600 focus:ring-indigo-500"
                placeholder="Enter Mileage"
                required
              />
            </div>

            {/* Fuel Consumption Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Fuel Consumption Rate
              </label>
              <input
                type="number"
                name="fuel_consumption_rate"
                value={formData.fuel_consumption_rate}
                onChange={handleInputChange}
                step="0.01"
                className="w-full bg-gray-700 text-white rounded-md border-gray-600 focus:ring-indigo-500"
                placeholder="Enter Fuel Consumption Rate"
                required
              />
            </div>

            {/* Engine Runtime */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Engine Runtime
              </label>
              <input
                type="number"
                name="engine_runtime"
                value={formData.engine_runtime}
                onChange={handleInputChange}
                step="0.01"
                className="w-full bg-gray-700 text-white rounded-md border-gray-600 focus:ring-indigo-500"
                placeholder="Enter Engine Runtime"
                required
              />
            </div>

            {/* Temperature Difference */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Temperature Difference
              </label>
              <input
                type="number"
                name="temperature_difference"
                value={formData.temperature_difference}
                onChange={handleInputChange}
                step="0.01"
                className="w-full bg-gray-700 text-white rounded-md border-gray-600 focus:ring-indigo-500"
                placeholder="Enter Temperature Difference"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6 text-center">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-md transition duration-300 disabled:opacity-50"
            >
              {isLoading ? "Processing..." : "Get Maintenance Prediction"}
            </button>
          </div>
        </form>

        {/* Prediction Result Display */}
        {predictionResult && (
          <div className="mt-6 bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Prediction Results</h2>
            <pre className="bg-gray-700 p-4 rounded text-sm overflow-x-auto">
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