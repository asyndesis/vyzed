"use client";

import { useEffect, useState } from "react";

export function ScrollingVerb() {
  const verbs = [
    "learn with",
    "support",
    "grow with",
    "connect with",
    "mentor",
    "teach",
    "help",
  ];
  const [currentVerb, setCurrentVerb] = useState(0);

  useEffect(() => {
    // Set up the interval to change verbs
    const interval = setInterval(() => {
      setCurrentVerb((prev) => (prev + 1) % verbs.length);
    }, 2000);

    // Clean up on unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="inline-flex align-baseline overflow-hidden h-[1.3em] min-w-[120px] mx-1 relative">
      {/* Container with fade effects */}
      <span className="absolute inset-0 pointer-events-none">
        <span className="absolute top-0 left-0 right-0 h-[30%] bg-gradient-to-b from-background to-transparent z-10"></span>
        <span className="absolute bottom-0 left-0 right-0 h-[30%] bg-gradient-to-t from-background to-transparent z-10"></span>
      </span>

      {/* The verb container */}
      <span
        className="inline-flex flex-col h-[calc(1.3em*7)] transition-transform duration-500 ease-in-out"
        style={{ transform: `translateY(calc(-${currentVerb} * 1.3em))` }}
      >
        {verbs.map((verb) => (
          <span
            key={verb}
            className="h-[1.3em] bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-500 to-indigo-500"
          >
            {verb}
          </span>
        ))}
      </span>
    </span>
  );
}
