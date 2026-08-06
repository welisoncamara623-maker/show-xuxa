"use client";

import { useEffect, useRef, useState } from "react";

type RemainingTime = {
  totalSeconds: number;
  minutes: number;
  seconds: number;
  formatted: string;
  expired: boolean;
};

type PixExpirationTimerProps = {
  expiresAt: string;
  onExpire: () => void;
};

function getRemainingTime(expiresAt: string, now = Date.now()): RemainingTime {
  const expirationTimestamp = new Date(expiresAt).getTime();

  if (!Number.isFinite(expirationTimestamp)) {
    return {
      totalSeconds: 0,
      minutes: 0,
      seconds: 0,
      formatted: "00:00",
      expired: true,
    };
  }

  const remainingMilliseconds = Math.max(0, expirationTimestamp - now);
  const totalSeconds = Math.max(0, Math.ceil(remainingMilliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;

  return {
    totalSeconds,
    minutes,
    seconds,
    formatted,
    expired: totalSeconds <= 0,
  };
}

export function PixExpirationTimer({
  expiresAt,
  onExpire,
}: PixExpirationTimerProps) {
  const [now, setNow] = useState(() => Date.now());
  const onExpireRef = useRef(onExpire);
  const hasExpiredRef = useRef(false);
  const remaining = getRemainingTime(expiresAt, now);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [expiresAt]);

  useEffect(() => {
    if (!remaining.expired || hasExpiredRef.current) {
      return;
    }

    hasExpiredRef.current = true;
    onExpireRef.current();
  }, [remaining.expired]);

  useEffect(() => {
    hasExpiredRef.current = false;
  }, [expiresAt]);

  return (
    <p className="text-[0.9rem] leading-6 text-slate-500" aria-live="off">
      Este Pix expira em{" "}
      <time dateTime={expiresAt} className="font-semibold text-slate-700">
        {remaining.formatted}
      </time>
    </p>
  );
}
