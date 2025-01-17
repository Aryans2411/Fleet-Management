import Navigation from "../Components/dashboard/navigation";
import Footer from "../Components/Footer/Footer";
import { useState,useEffect } from "react";

export default function Vehicle() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [vehicleInfo, setVehicleInfo] = useState([]);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
      make: "",
      registrationnumber: "",
      fueltype: "",
      idealmileage: "",
  });
  const [formAnimation, setFormAnimation] = useState("opacity-100"); // for form fade-out animation

  useEffect(() => {
    getVehicleInfo();
  }, []);
  
  const getVehicleInfo = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/api/get_all_vehicles",
          {
            method: "GET",
          }
        );
  
        if (!response.ok) {
          throw new Error("Error fetching driver list");
        }
  
        const data = await response.json();
        setVehicleInfo(data); // Assuming data.rows contains the drivers
      } catch (error) {
        console.error("Failed to fetch vehicles:", error.message);
      }
    };
  
    // Handle input changes
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setSuccess("");
    try {
      const response = await fetch(
        "http://localhost:4000/api/vehicle_register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error registering vehicle");
      }

      const result = await response.json();
      console.log("Vehicle registered:", result);

      // Fetch updated driver list
      getVehicleInfo();

      // Reset form data
      setFormData({
        make: "",
        registrationnumber: "",
        fueltype: "",
        idealmileage: "",
      });
      setSuccess("Vehicle Added Successfully!");
      setTimeout(() => {
        setSuccess(null); // Remove success message after animation
      }, 3000); // Matches duration of animation

      // Fade out form and show success/error message
      setFormAnimation("opacity-0");
      setTimeout(() => {
        setIsFormOpen(false); // Hide form completely after animation
        setFormAnimation("opacity-100"); // Reset form animation state
      }, 300); // Duration of the fade-out effect
    } catch (error) {
      console.error("Error submitting form:", error.message);
      setErr(error.message || "Failed to add");
      setTimeout(() => {
        setErr(null); // Remove error message after animation
      }, 3000); // Matches duration of animation
    }
  };

  // Handle form close (cancel)
  const handleCancel = () => {
    setFormAnimation("opacity-0");
    setTimeout(() => {
      setIsFormOpen(false); // Hide form completely after animation
      setFormAnimation("opacity-100"); // Reset form animation state
    }, 300); // Duration of the fade-out effect
  };

  return (
    <div className="bg-gray-900 h-screen w-screen">
      <Navigation />
      <div className="mx-auto max-w-7xl">
        <div className="bg-gray-900 py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="sm:flex sm:items-center">
              <div className="sm:flex-auto">
                <h1 className="text-base font-semibold text-white">Users</h1>
                <p className="mt-2 text-sm text-gray-300">
                  A list of all the users in your account including their name,
                  title, email and role.
                </p>
              </div>
              <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                  {err && (
                    <div className="bg-red-100 border   border-red-400 text-red-700 px-4 py-2 rounded-lg mb-5 text-center justify-center animate-pulse opacity-100 transition-opacity duration-3000 ease-in-out">
                      {err}
                    </div>
                  )}
                  {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-lg mb-5 text-center justify-center animate-pulse opacity-100 transition-opacity duration-3000 ease-in-out">
                      {success}
                    </div>
                  )}
                <button
                  type="button"
                  onClick={() => setIsFormOpen(true)}
                  className="block rounded-md bg-indigo-500 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                >
                  Add Vehicle
                </button>
              </div>
            </div>
            {isFormOpen && (
              <div
                className={`mt-8 bg-gray-800 p-6 rounded-lg shadow-md transition-opacity duration-300 ease-in-out ${formAnimation}`}
              >
                <h2 className="text-lg font-semibold text-white mb-4">
                  Add New Vehicle
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-300"
                      htmlFor="make"
                    >
                      Model
                    </label>
                    <input
                      type="text"
                      id="make"
                      name="make"
                      value={formData.make}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md bg-gray-700 text-white border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
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
                      className="mt-1 block w-full rounded-md bg-gray-700 text-white border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
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
                      type="text"
                      id="fueltype"
                      name="fueltype"
                      value={formData.fueltype}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md bg-gray-700 text-white border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    >
                      <option value="" disabled>Select Fuel Type</option>
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                    </select>
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-300"
                      htmlFor="idealmileage"
                    >
                      Mileage
                    </label>
                    <input
                      type="number"
                      id="idealmileage"
                      name="idealmileage"
                      value={formData.idealmileage}
                      onChange={handleInputChange}
                      step={0.01}
                      className="mt-1 block w-full rounded-md bg-gray-700 text-white border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="mr-4 px-4 py-2 bg-gray-600 text-sm font-medium text-white rounded-md hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-500 text-sm font-medium text-white rounded-md hover:bg-indigo-400"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </div>
            )}
            <div className="mt-8 flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead>
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-0"
                        >
                          Model
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                        >
                          Registration Number
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                        >
                          Fuel Type
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                        >
                          Mileage
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {vehicleInfo && vehicleInfo.length > 0 ? (
                        vehicleInfo.map((vehicle, index) => (
                          <tr key={index}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-0">
                              {vehicle.make}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                              {vehicle.registrationnumber}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                              {vehicle.fueltype}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                              {vehicle.idealmileage}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className="text-center text-white py-4"
                          >
                            No Vehicles Found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
