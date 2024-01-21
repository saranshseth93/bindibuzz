"use client";
import React from "react";
import Lottie from "lottie-react";
import nothing from "../../../../public/Animations/not-found.json";

const LottieWrapper = () => (
  <Lottie animationData={nothing} className="w-2/5" loop={true} />
);

export default LottieWrapper;
