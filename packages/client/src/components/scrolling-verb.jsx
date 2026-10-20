import { useEffect, useState } from "react";

const LINE = 1.3; // em

// Cycles through verbs, sliding each one up into view
export function ScrollingVerb({ verbs }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % verbs.length), 2000);
    return () => clearInterval(id);
  }, [verbs.length]);

  return (
    <span className="relative inline-flex min-w-[120px] overflow-hidden align-baseline" style={{ height: `${LINE}em` }}>
      <span
        className="inline-flex flex-col transition-transform duration-500 ease-in-out"
        style={{ transform: `translateY(-${index * LINE}em)` }}
      >
        {verbs.map((verb) => (
          <span key={verb} className="text-muted-foreground" style={{ height: `${LINE}em` }}>
            {verb}
          </span>
        ))}
      </span>
    </span>
  );
}
