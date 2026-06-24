import { useEffect, useState } from 'react';

const pad = (n: number) => String(n).padStart(2, '0');

export const formatLiveDateTime = (date: Date): string =>
  `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;

export const useLiveClock = (): string => {
  const [now, setNow] = useState(() => formatLiveDateTime(new Date()));

  useEffect(() => {
    const tick = () => setNow(formatLiveDateTime(new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return now;
};
