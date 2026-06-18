import { BillSegment, RateSchedule, CueRental, BillingSession } from '../types';
import { parseTimeStr, isTimeInRange, calculateDuration, generateId } from './time';
import { isBefore, isAfter, addDays, differenceInMinutes, min } from 'date-fns';

interface BillingResult {
  segments: BillSegment[];
  totalAmount: number;
  totalDuration: number;
}

export const calculateBillingSegments = (
  startTime: Date,
  endTime: Date,
  rateSchedules: RateSchedule[]
): BillingResult => {
  const segments: BillSegment[] = [];
  let totalAmount = 0;
  const totalDuration = calculateDuration(startTime, endTime);

  if (totalDuration === 0) {
    return { segments: [], totalAmount: 0, totalDuration: 0 };
  }

  const enabledRates = rateSchedules.filter(r => r.enabled !== false);
  const sortedRates = [...enabledRates].sort((a, b) => b.priority - a.priority);

  const getRateForTime = (time: Date): RateSchedule | null => {
    for (const rate of sortedRates) {
      if (isTimeInRange(time, rate.startTime, rate.endTime)) {
        return rate;
      }
    }
    return null;
  };

  const allSwitchTimes = [...new Set(
    enabledRates.flatMap(r => [r.startTime, r.endTime])
  )].sort();

  const getSwitchPoints = (start: Date, end: Date): Date[] => {
    const points: Set<number> = new Set([start.getTime(), end.getTime()]);
    let cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    
    while (cursor <= endDay) {
      for (const timeStr of allSwitchTimes) {
        const switchPoint = parseTimeStr(timeStr, cursor);
        if (switchPoint.getTime() > start.getTime() && switchPoint.getTime() < end.getTime()) {
          points.add(switchPoint.getTime());
        }
      }
      cursor = addDays(cursor, 1);
    }
    
    return Array.from(points)
      .sort((a, b) => a - b)
      .map(t => new Date(t));
  };

  const switchPoints = getSwitchPoints(startTime, endTime);

  for (let i = 0; i < switchPoints.length - 1; i++) {
    const segmentStart = switchPoints[i];
    const segmentEnd = switchPoints[i + 1];
    const duration = calculateDuration(segmentStart, segmentEnd);
    
    if (duration === 0) continue;

    const midTime = new Date((segmentStart.getTime() + segmentEnd.getTime()) / 2);
    let rate = getRateForTime(midTime);
    if (!rate) rate = getRateForTime(segmentStart);
    if (!rate) rate = getRateForTime(new Date(segmentEnd.getTime() - 1));
    if (!rate) continue;

    const amount = (duration / 60) * rate.ratePerHour;
    const roundedAmount = Math.round(amount * 100) / 100;

    const startDayOffset = segmentStart.getDate() !== startTime.getDate() 
      ? `(${segmentStart.getMonth() + 1}/${segmentStart.getDate()}) ` 
      : '';
    const endDayOffset = segmentEnd.getDate() !== startTime.getDate() 
      ? `(${segmentEnd.getMonth() + 1}/${segmentEnd.getDate()}) ` 
      : '';

    segments.push({
      id: generateId(),
      rateId: rate.id,
      rateName: rate.name,
      ratePerHour: rate.ratePerHour,
      startTime: startDayOffset + segmentStart.toTimeString().slice(0, 5),
      endTime: endDayOffset + segmentEnd.toTimeString().slice(0, 5),
      durationMinutes: duration,
      amount: roundedAmount,
      isPeak: rate.isPeak
    });

    totalAmount += roundedAmount;
  }

  return {
    segments,
    totalAmount: Math.round(totalAmount * 100) / 100,
    totalDuration
  };
};

export const calculateCueRentalFee = (
  cueRental: CueRental,
  totalMinutes: number
): number => {
  const hours = totalMinutes / 60;
  return Math.round(cueRental.feePerHour * hours * cueRental.quantity * 100) / 100;
};

export const calculateTotalCueRental = (
  cueRentals: CueRental[],
  totalMinutes: number
): number => {
  return cueRentals.reduce((total, rental) => {
    return total + calculateCueRentalFee(rental, totalMinutes);
  }, 0);
};

export const calculateVipDiscount = (
  totalAmount: number,
  discountRate: number
): number => {
  return Math.round(totalAmount * (1 - discountRate) * 100) / 100;
};

export const getCurrentRate = (
  rateSchedules: RateSchedule[],
  time: Date = new Date()
): RateSchedule | null => {
  const sortedRates = [...rateSchedules].sort((a, b) => b.priority - a.priority);
  for (const rate of sortedRates) {
    if (isTimeInRange(time, rate.startTime, rate.endTime)) {
      return rate;
    }
  }
  return null;
};

export const getNextRateChange = (
  rateSchedules: RateSchedule[],
  currentTime: Date = new Date()
): { time: Date; rate: RateSchedule } | null => {
  const switchTimes = rateSchedules.map(r => r.startTime);
  let nextTime: Date | null = null;

  for (const timeStr of switchTimes) {
    const switchPoint = parseTimeStr(timeStr, currentTime);
    if (isAfter(switchPoint, currentTime)) {
      if (!nextTime || isBefore(switchPoint, nextTime)) {
        nextTime = switchPoint;
      }
    }
  }

  if (!nextTime) {
    for (const timeStr of switchTimes) {
      const switchPoint = parseTimeStr(timeStr, addDays(currentTime, 1));
      if (!nextTime || isBefore(switchPoint, nextTime)) {
        nextTime = switchPoint;
      }
    }
  }

  if (nextTime) {
    const nextRate = getCurrentRate(rateSchedules, nextTime);
    if (nextRate) {
      return { time: nextTime, rate: nextRate };
    }
  }

  return null;
};

export const estimateCurrentCost = (
  session: BillingSession,
  rateSchedules: RateSchedule[],
  currentTime: Date = new Date()
): { tableFee: number; cueRentalFee: number; total: number; duration: number } => {
  const duration = calculateDuration(session.startTime, currentTime);
  const billingResult = calculateBillingSegments(session.startTime, currentTime, rateSchedules);
  const cueRentalFee = calculateTotalCueRental(session.cueRentals, duration);
  const total = billingResult.totalAmount + cueRentalFee;

  return {
    tableFee: billingResult.totalAmount,
    cueRentalFee,
    total: Math.round(total * 100) / 100,
    duration
  };
};

export const validateRateSchedule = (rate: RateSchedule, allRates: RateSchedule[]): boolean => {
  if (!rate.startTime || !rate.endTime || rate.ratePerHour <= 0) {
    return false;
  }

  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(rate.startTime) || !timeRegex.test(rate.endTime)) {
    return false;
  }

  return true;
};

export const roundToNearestMinute = (date: Date): Date => {
  const minutes = date.getMinutes();
  const roundedMinutes = Math.round(minutes);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), roundedMinutes, 0, 0);
};

export const roundUpToNearestMinute = (date: Date): Date => {
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const ms = date.getMilliseconds();
  
  if (seconds > 0 || ms > 0) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), minutes + 1, 0, 0);
  }
  return date;
};
