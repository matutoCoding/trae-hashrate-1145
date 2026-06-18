import { useState, useEffect, useCallback, useRef } from 'react';
import { differenceInSeconds, differenceInMinutes } from 'date-fns';

interface UseTimerOptions {
  startTime?: Date;
  autoStart?: boolean;
  onTick?: (elapsedSeconds: number) => void;
}

interface UseTimerReturn {
  elapsedSeconds: number;
  elapsedMinutes: number;
  formattedTime: string;
  isRunning: boolean;
  start: () => void;
  stop: () => void;
  reset: (newStartTime?: Date) => void;
}

export const useTimer = ({
  startTime,
  autoStart = true,
  onTick
}: UseTimerOptions = {}): UseTimerReturn => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(autoStart);
  const startRef = useRef<Date>(startTime || new Date());
  const intervalRef = useRef<number | null>(null);
  const onTickRef = useRef(onTick);

  useEffect(() => {
    onTickRef.current = onTick;
  }, [onTick]);

  const updateElapsed = useCallback(() => {
    const now = new Date();
    const elapsed = differenceInSeconds(now, startRef.current);
    setElapsedSeconds(elapsed);
    onTickRef.current?.(elapsed);
  }, []);

  const start = useCallback(() => {
    if (isRunning) return;
    setIsRunning(true);
  }, [isRunning]);

  const stop = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback((newStartTime?: Date) => {
    startRef.current = newStartTime || new Date();
    setElapsedSeconds(0);
    if (autoStart) {
      setIsRunning(true);
    }
  }, [autoStart]);

  useEffect(() => {
    if (startTime) {
      startRef.current = startTime;
      updateElapsed();
    }
  }, [startTime]);

  useEffect(() => {
    if (isRunning) {
      updateElapsed();
      intervalRef.current = window.setInterval(updateElapsed, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    elapsedSeconds,
    elapsedMinutes: Math.floor(elapsedSeconds / 60),
    formattedTime: formatTime(elapsedSeconds),
    isRunning,
    start,
    stop,
    reset
  };
};

export const useCountdown = (
  targetDate: Date,
  onComplete?: () => void
): { remainingSeconds: number; formattedTime: string; isExpired: boolean } => {
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const onCompleteRef = useRef(onComplete);
  const hasCalledCompleteRef = useRef(false);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    hasCalledCompleteRef.current = false;
    const update = () => {
      const now = new Date();
      const remaining = Math.max(0, differenceInSeconds(targetDate, now));
      setRemainingSeconds(remaining);
      
      if (remaining <= 0 && !hasCalledCompleteRef.current) {
        hasCalledCompleteRef.current = true;
        onCompleteRef.current?.();
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    remainingSeconds,
    formattedTime: formatTime(remainingSeconds),
    isExpired: remainingSeconds <= 0
  };
};
