export enum ClassType {
  _1AC = '1AC',
  _2AC = '2AC',
  _3AC = '3AC',
  SL = 'SL',
  Sleeper_AC = 'Sleeper-AC',
  Sleeper_NonAC = 'Sleeper-NonAC',
  Seat = 'Seat',
}

export enum DaysOfWeek {
  MON = 'MON',
  TUE = 'TUE',
  WED = 'WED',
  THU = 'THU',
  FRI = 'FRI',
  SAT = 'SAT',
  SUN = 'SUN',
}

export interface FareType {
  fareTypeId: number;
  trainId: number;
  classType: ClassType;
  price: number;
  seatsAvailable: number;
}

export interface Train {
  trainId: number;
  trainName: string;
  source: string;
  destination: string;
  departureTime: string;
  journeyHours: number;
  journeyMinutes: number;
  status: string;
  scheduleDays: string[];
  fareTypes: FareType[];
  computedArrivalTime?: string;
  arrivalDayOffset?: number;
}

export interface TrainRequest {
  trainName: string;
  source: string;
  destination: string;
  departureTime: string;
  journeyHours: number;
  journeyMinutes: number;
  status: 'ACTIVE' | 'INACTIVE' | 'CANCELLED';
  scheduleDays: string[];
  fareTypes: {
    classType: ClassType;
    price: number;
    seatsAvailable: number;
  }[];
}

// Utility functions for computing arrival information
export function computeArrivalTime(
  departureTime: string,
  journeyHours: number,
  journeyMinutes: number
): string {
  const [hours, minutes] = departureTime.split(':').map(Number);
  const totalMinutes =
    hours * 60 + minutes + journeyHours * 60 + journeyMinutes;
  const arrivalHours = Math.floor(totalMinutes / 60) % 24;
  const arrivalMinutes = totalMinutes % 60;
  return `${arrivalHours.toString().padStart(2, '0')}:${arrivalMinutes
    .toString()
    .padStart(2, '0')}`;
}

export function computeArrivalDayOffset(
  departureTime: string,
  journeyHours: number,
  journeyMinutes: number
): number {
  const [hours, minutes] = departureTime.split(':').map(Number);
  const totalMinutes =
    hours * 60 + minutes + journeyHours * 60 + journeyMinutes;
  return Math.floor(totalMinutes / (24 * 60));
}
