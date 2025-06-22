export interface Passenger {
  passengerId: number;
  bookingId: number;
  name: string;
  age: number;
  gender: string;
  idProof: string;
}

export interface Booking {
  bookingId: number;
  userId: number;
  username: string;
  trainId: number;
  trainName: string;
  source: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  fareTypeId: number;
  classType: string;
  price: number;
  journeyDate: string;
  bookingDate: string;
  totalFare: number;
  status: string;
  passengers: Passenger[];
}
