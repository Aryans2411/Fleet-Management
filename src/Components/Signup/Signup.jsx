import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phonenumber: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:4000/signUpPost", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Signup failed");
      }

      // Navigate to login page upon success
      navigate("/login");
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="bg-black min-h-screen flex items-center justify-center overflow-hidden relative">
        <div className="absolute inset-0"></div>
        <div className="bg-transparent p-6 rounded-lg shadow-md relative z-10 max-w-md w-full">
          <h2 className="text-2xl font-bold text-center mb-4 text-white">
            Sign up
          </h2>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="signupform">
            <div className="mb-4">
              <label htmlFor="name" className="block text-white font-bold mb-1">
                Name
              </label>
              <input
                className="bg-transparent text-white px-2 py-2 border rounded-lg focus:ring-2 focus:ring-white"
                type="text"
                name="name"
                id="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-white font-bold mb-1"
              >
                Email
              </label>
              <input
                className="bg-transparent text-white px-2 py-2 border rounded-lg focus:ring-2 focus:ring-white"
                type="email"
                name="email"
                id="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-white font-bold mb-1"
              >
                Password
              </label>
              <input
                className="bg-transparent text-white px-2 py-2 border rounded-lg focus:ring-2 focus:ring-white"
                type="password"
                name="password"
                id="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-white font-medium mb-1"
                htmlFor="phonenumber"
              >
                Phone Number
              </label>
              <input
                className="w-full px-4 py-2 text-white border bg-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
                type="text"
                name="phonenumber"
                id="phonenumber"
                placeholder="Phone Number"
                value={formData.phonenumber}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-4">
              <button
                type="submit"
                className="text-white border rounded-lg px-2 py-1 mt-2 bg-transparent hover:bg-white hover:text-black transition duration-200"
              >
                Register
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
