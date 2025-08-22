
import React from 'react';

interface ClockProps {
  time: Date;
}

const timeFormatter = new Intl.DateTimeFormat('uk-UA', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
});

const dateFormatter = new Intl.DateTimeFormat('uk-UA', {
  weekday: 'short',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

export const Clock: React.FC<ClockProps> = ({ time }) => {
  const formattedTime = timeFormatter.format(time);
  const formattedDate = dateFormatter.format(time);

  return (
    <div className="flex flex-col items-center justify-center select-none cursor-default text-center">
      <div className="font-mono text-[clamp(4rem,17vw,20rem)] font-bold text-gray-100 tracking-wider leading-none">
        {formattedTime}
      </div>
      <div className="font-sans text-[clamp(1.25rem,2.5vw,3rem)] text-gray-400 uppercase tracking-widest mt-4">
        {formattedDate}
      </div>
    </div>
  );
};