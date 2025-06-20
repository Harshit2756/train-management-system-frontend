export interface Train {
    trainId: number;
    trainNumber: string;
    trainName: string;
    trainType: string;
    totalSeats: number;
    acSeats: number;
    sleeperSeats: number;
    generalSeats: number;
    status: string;
  }
  
  export interface Schedule {
    scheduleId: number;
    trainId: number;
    travelDate: string;
    availableAcSeats: number;
    availableSleeperSeats: number;
    availableGeneralSeats: number;
    status: string;
  }
  
  export interface ApiResponse {
    success: boolean;
    message: string;
    code: string;
    data: any;
    timestamp: string;
  } 