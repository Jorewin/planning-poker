import React, { useState, useEffect } from "react";

type Props = {
  timeRemaining: number;
  handleTimeout: () => void;
};

const Timer = ({ timeRemaining, handleTimeout }: Props) => {
  const [timeLeft, setTimeLeft] = useState(timeRemaining);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  useEffect(() => {
    if (timeLeft === 0) {
      handleTimeout();
    }
  }, [timeLeft]);

  return (
    <div className="bg-gray-100 p-4">
      <p className="text-gray-700 font-medium">Time Remaining: {timeLeft}</p>
    </div>
  );
};

export default Timer;
