import React from "react";

const LoadingAnimation = () => {
  return (
    <div className="bg-black h-screen w-full flex items-center justify-center">
      <div className="relative w-28 h-28">
        <div className="absolute w-28 h-12 mt-16 bg-gray-300 border-8 border-gray-300 animate-[abox1_4s_1s_ease-in-out_infinite]"></div>
        <div className="absolute w-12 h-12 bg-gray-300 border-8 border-gray-300 animate-[abox2_4s_1s_ease-in-out_infinite]"></div>
        <div className="absolute w-12 h-12 mt-0 ml-16 bg-gray-300 border-8 border-gray-300 animate-[abox3_4s_1s_ease-in-out_infinite]"></div>

        <style>
          {`
          @keyframes abox1 {
            0% { width: 7rem; height: 3rem; margin-top: 4rem; margin-left: 0; }
            12.5%, 25%, 37.5%, 62.5%, 87.5%, 100% { width: 3rem; height: 3rem; margin-top: 4rem; margin-left: 0; }
            75% { width: 3rem; height: 7rem; margin-top: 0; margin-left: 0; }
          }

          @keyframes abox2 {
            0%, 12.5%, 25%, 37.5% { width: 3rem; height: 3rem; margin-top: 0; margin-left: 0; }
            50% { width: 7rem; height: 3rem; margin-top: 0; margin-left: 0; }
            62.5%, 75%, 87.5%, 100% { width: 3rem; height: 3rem; margin-top: 0; margin-left: 4rem; }
          }

          @keyframes abox3 {
            0%, 12.5% { width: 3rem; height: 3rem; margin-top: 0; margin-left: 4rem; }
            25% { width: 3rem; height: 7rem; margin-top: 0; margin-left: 4rem; }
            37.5%, 50%, 62.5%, 75%, 87.5% { width: 3rem; height: 3rem; margin-top: 4rem; margin-left: 4rem; }
            100% { width: 7rem; height: 3rem; margin-top: 4rem; margin-left: 0; }
          }
        `}
        </style>
      </div>
    </div>
  );
};

export default LoadingAnimation;