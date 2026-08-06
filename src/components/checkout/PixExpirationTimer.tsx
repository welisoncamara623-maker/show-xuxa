"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type PixExpirationTimerProps = {
  expiresAt: string;
  onExpire: () => void;
};

function parseExpiresAt(value: string) {
  const date = new Date(value);

  return Number.isFinite(date.getTime()) ? date : null;
}

function formatRemainingTime(remainingMs: number) {
  const totalSeconds = Math.floor(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function PixExpirationTimer({
  expiresAt,
  onExpire,
}: PixExpirationTimerProps) {
  const expiresAtDate = useMemo(() => parseExpiresAt(expiresAt), [expiresAt]);
  const onExpireRef = useRef(onExpire);
  const hasExpiredRef = useRef(false);
  const [remainingMs, setRemainingMs] = useState(() => {
    if (!expiresAtDate) {
      return 0;
    }

    return Math.max(0, expiresAtDate.getTime() - Date.now());
  });

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (!expiresAtDate) {
      return;
    }

    hasExpiredRef.current = false;

    const updateRemaining = () => {
      const nextRemaining = Math.max(0, expiresAtDate.getTime() - Date.now());
      setRemainingMs(nextRemaining);

      if (nextRemaining === 0 && !hasExpiredRef.current) {
        hasExpiredRef.current = true;
        onExpireRef.current();
      }
    };

    updateRemaining();

    const intervalId = window.setInterval(updateRemaining, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [expiresAtDate]);

  const formattedTime = formatRemainingTime(remainingMs);

  return (
    <p className="text-[0.9rem] leading-6 text-slate-500" aria-live="off">
      Este Pix expira em{" "}
      <time dateTime={expiresAt} className="font-medium text-slate-700">
        {formattedTime}
      </time>
    </p>
  );
}
