
import React from 'react';

interface ClockProps {
  time: Date;
}

const formatTimePart = (num: number): string => num.toString().padStart(2, '0');

const timeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
});

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

export const Clock: React.FC<ClockProps> = ({ time }) => {
  const formattedTime = timeFormatter.format(time);
  const formattedDate = dateFormatter.format(time);

  return (
    <div className="flex flex-col items-center justify-center select-none cursor-default">
      <div className="font-mono text-8xl sm:text-9xl md:text-[12rem] lg:text-[16rem] xl:text-[20rem] font-bold text-gray-100 tracking-wider">
        {formattedTime}
      </div>
      <div className="font-sans text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl text-gray-400 uppercase tracking-widest mt-4">
        {formattedDate}
      </div>
    </div>
  );
};
