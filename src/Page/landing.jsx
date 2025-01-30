"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, useSpring, useInView } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Footer from "../Components/Footer/Footer";
import { Carousel } from "../Components/ui/carousel";

const stats = [
  {
    value: 83,
    label: "Reduced time spent on inspections",
    company: "STANLEY STEEMER.",
  },
  {
    value: 48,
    label: "Saved on maintenance costs with Fleetio",
    company: "SMART WATT",
  },
  {
    value: 10,
    label: "Reduced time spent on fleet reports",
    company: "NEWKIRK ELECTRIC",
  },
];

const AnimatedNumber = ({ value, inView }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const springValue = useSpring(0, { stiffness: 100, damping: 10 });

  useEffect(() => {
    if (inView) {
      springValue.set(value); // Start animation when in view
    }
  }, [inView, springValue, value]);

  useEffect(() => {
    const updateDisplayValue = () =>
      setDisplayValue(Math.floor(springValue.get()));
    const interval = setInterval(updateDisplayValue, 50);

    return () => clearInterval(interval);
  }, [springValue]);

  return <span>{displayValue}</span>;
};

export function CarouselDemo() {
  const slideData = [
    {
      title: "Mystic Mountains",
      button: "Explore Component",
      src: "https://images.unsplash.com/photo-1494806812796-244fe51b774d?q=80&w=3534&auto=format&fit=crop",
    },
    {
      title: "Urban Dreams",
      button: "Explore Component",
      src: "https://images.unsplash.com/photo-1518710843675-2540dd79065c?q=80&w=3387&auto=format&fit=crop",
    },
    {
      title: "Neon Nights",
      button: "Explore Component",
      src: "https://images.unsplash.com/photo-1590041794748-2d8eb73a571c?q=80&w=3456&auto=format&fit=crop",
    },
    {
      title: "Desert Whispers",
      button: "Explore Component",
      src: "https://images.unsplash.com/photo-1679420437432-80cfbf88986c?q=80&w=3540&auto=format&fit=crop",
    },
  ];

  return (
    <div className="relative overflow-hidden w-full max-w-5xl py-16">
      <Carousel slides={slideData} />
    </div>
  );
}

export const LandingPage = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const navigate = useNavigate();

  const handleLoginClick = () => navigate("/login");
  const handleSignupClick = () => navigate("/signup");

  return (
    <div>
      <div className="relative flex flex-col items-center  bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        {/* Buttons aligned to the top right */}
        <div className="   items-center justify-center">
          <div className="absolute top-6 right-6 flex space-x-4 z-20">
            <button
              onClick={handleLoginClick}
              className="px-6 py-3 text-white border border-neutral-200 rounded-md shadow-lg transition hover:bg-gradient-to-br from-neutral-500 to-gray-700 hover:text-black"
            >
              Login
            </button>
            <button
              onClick={handleSignupClick}
              className="px-6 py-3 text-white border border-white rounded-md shadow-lg transition hover:bg-gradient-to-br from-neutral-500 to-gray-700 hover:text-black"
            >
              Sign Up
            </button>
          </div>

          {/* Fleetio Heading */}
          <div className="w-full text-center py-12">
            <h1 className="text-5xl font-extrabold text-white leading-tight">
              Fleetio.
            </h1>
            <h3 className="text-lg text-gray-400 font-light max-w-lg mx-auto mt-4">
              One-stop solution for all your fleet management needs, from driver
              assignments to vehicle maintenance updates.
            </h3>
          </div>

          {/* Carousel Section */}
          <CarouselDemo />

          {/* Animated Stats Section */}
          <div ref={ref} className="mx-2 max-w-4xl py-12">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center"
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className="border border-green-500 rounded-lg p-6 shadow-md bg-gray-800"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: index * 0.2, duration: 0.5 }}
                >
                  <h2 className="text-4xl font-bold text-white">
                    <AnimatedNumber value={stat.value} inView={isInView} />
                    {index === 2 ? "x" : "%"}
                  </h2>
                  <p className="text-gray-400 mt-2">{stat.label}</p>
                  <p className="text-gray-500 font-semibold mt-2">
                    {stat.company}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LandingPage;
