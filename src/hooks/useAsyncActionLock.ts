import { useRef, useState } from "react";

export default function useAsyncActionLock() {
  const inFlightRef = useRef(false);
  const [isRunning, setIsRunning] = useState(false);

  const runWithLock = async <T,>(action: () => Promise<T>) => {
    if (inFlightRef.current) {
      return undefined;
    }

    inFlightRef.current = true;
    setIsRunning(true);

    try {
      return await action();
    } finally {
      inFlightRef.current = false;
      setIsRunning(false);
    }
  };

  return { isRunning, runWithLock };
}
