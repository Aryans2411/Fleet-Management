import React from "react";
import { useNavigate } from "react-router-dom";

export const LandingPage = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleSignupClick = () => {
    navigate("/signup");
  };

  return (
    <div className="bg-black h-screen w-full flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-gray-900 via-black to-gray-900"></div>
      <h1 className="text-white text-3xl md:text-5xl lg:text-6xl font-bold text-center relative z-20 mb-8">
        Welcome to your Fleet Management Application
      </h1>
      <div className="flex space-x-4 relative z-20">
        <button
          onClick={handleLoginClick}
          className="px-6 py-3 text-white bg-transparent border border-white hover:bg-white hover:text-black font-semibold rounded-md shadow-lg transition"
        >
          Login
        </button>
        <button
          onClick={handleSignupClick}
          className="px-6 py-3 text-white bg-transparent border border-white hover:bg-white hover:text-black font-semibold rounded-md shadow-lg transition"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
