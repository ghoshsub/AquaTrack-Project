import React from "react";
import LottieComponent from "lottie-react";
import waterAnimationData from "../animation/waterAnimation.json";

// Handle ESM / CommonJS wrapper fallback for lottie-react
const Lottie = LottieComponent.default || LottieComponent;

export default function WaterAnimation() {
  return (
    <div 
      style={{ 
        width: "280px", 
        height: "280px", 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center" 
      }}
    >
      <Lottie 
        animationData={waterAnimationData} 
        loop={true} 
        style={{ width: "100%", height: "100%" }} 
      />
    </div>
  );
}
