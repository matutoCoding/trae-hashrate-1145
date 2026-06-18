import { format, parse, differenceInMinutes, addMinutes, isBefore, isAfter, setHours, setMinutes } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export const formatTime = (date: Date): string => {
  return format(date, 'HH:mm');
};

export const formatDateTime = (date: Date): string => {
  return format(date, 'yyyy-MM-dd HH:mm', { locale: zhCN });
};

export const formatDate = (date: Date): string => {
  return format(date, 'yyyy-MM-dd', { locale: zhCN });
};

export const formatDuration = (minutes: number): string => {
  const safeMinutes = Math.max(0, Math.floor(minutes));
  const hours = Math.floor(safeMinutes / 60);
  const mins = safeMinutes % 60;
  if (hours > 0) {
    return `${hours}小时${mins > 0 ? mins + '分钟' : ''}`;
  }
  return `${mins}分钟`;
};

export const formatDurationMs = (ms: number): string => {
  const minutes = Math.max(0, Math.floor(ms / 60000));
  return formatDuration(minutes);
};

export const formatDurationShort = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

export const parseTimeStr = (timeStr: string, baseDate: Date = new Date()): Date => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return setMinutes(setHours(baseDate, hours), minutes);
};

export const isTimeInRange = (time: Date, startTime: string, endTime: string): boolean => {
  const start = parseTimeStr(startTime, time);
  const end = parseTimeStr(endTime, time);
  
  if (isBefore(end, start)) {
    return isAfter(time, start) || isBefore(time, end);
  }
  return (isAfter(time, start) || time.getTime() === start.getTime()) && 
         (isBefore(time, end) || time.getTime() === end.getTime());
};

export const getNextSwitchTime = (currentTime: Date, switchTimes: string[]): Date | null => {
  const todaySwitches = switchTimes.map(t => parseTimeStr(t, currentTime));
  const tomorrowSwitches = switchTimes.map(t => {
    const d = parseTimeStr(t, currentTime);
    d.setDate(d.getDate() + 1);
    return d;
  });
  
  const allSwitches = [...todaySwitches, ...tomorrowSwitches].sort((a, b) => a.getTime() - b.getTime());
  
  for (const switchTime of allSwitches) {
    if (isAfter(switchTime, currentTime)) {
      return switchTime;
    }
  }
  return null;
};

export const calculateDuration = (startTime: Date, endTime: Date): number => {
  return Math.max(0, differenceInMinutes(endTime, startTime));
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const getCurrentPeriod = (): 'morning' | 'afternoon' | 'evening' | 'night' => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 24) return 'evening';
  return 'night';
};
