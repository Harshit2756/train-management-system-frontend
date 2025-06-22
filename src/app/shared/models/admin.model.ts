export interface AdminDashboardResponse {
  totalBookings: number;
  totalSales: number;
  confirmedBookings: number;
  cancelledBookings: number;
  activeTrains: number;
  inactiveTrains: number;
  totalTrains: number;
  totalUsers: number;
  totalPassengers: number;
}
