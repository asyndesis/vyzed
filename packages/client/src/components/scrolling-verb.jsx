
import { useEffect, useState } from "react";

export function ScrollingVerb({ verbs = [] }) {
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
    <span className="inline-flex align-baseline overflow-hidden h-[1.3em] min-w-[120px] relative z-[0]">
      {/* The verb container */}
      <span
        className="inline-flex flex-col h-[calc(1.3em*7)] transition-transform duration-500 ease-in-out"
        style={{ transform: `translateY(calc(-${currentVerb} * 1.3em))` }}
      >
        {verbs.map((verb) => (
          <span
            key={verb}
            className="h-[1.3em] text-muted-foreground"
          >
            {verb}
          </span>
        ))}
      </span>
    </span>
  );
}
