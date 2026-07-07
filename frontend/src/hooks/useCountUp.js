import { useEffect, useRef, useState } from "react";

/**
 * Animates a number counting up from 0 to `target` over `durationMs`.
 * Respects prefers-reduced-motion isn't handled here (numbers aren't
 * motion-sickness-inducing) but you can gate `start` on it if you want.
 */
export default function useCountUp(target, durationMs = 1600, start = true) {
  const [value, setValue] = useState(0);
  const rafRef = useRef();

  useEffect(() => {
    if (!start) return;
    const startTime = performance.now();

    function tick(now) {
      const progress = Math.min(1, (now - startTime) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, durationMs, start]);

  return value;
}
