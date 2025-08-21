
import { useState, useEffect } from 'react';

export const useCurrentTime = (): Date => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, []); // Empty dependency array ensures this effect runs only once on mount

  return currentTime;
};
