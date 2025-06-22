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
  arrivalTime: string;
  status: string;
  scheduleDays: string[];
  fareTypes: FareType[];
}

export interface TrainRequest {
  trainName: string;
  source: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  status: 'ACTIVE' | 'INACTIVE' | 'CANCELLED';
  scheduleDays: string[];
  fareTypes: {
    classType: ClassType;
    price: number;
    seatsAvailable: number;
  }[];
}
