import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private apiUrl = '/api/booking';

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }),
  };

  constructor(private http: HttpClient) {}

  createBooking(bookingData: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      this.apiUrl,
      bookingData,
      this.httpOptions
    );
  }

  getBookingById(bookingId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/${bookingId}`,
      this.httpOptions
    );
  }

  cancelBooking(bookingId: string): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${this.apiUrl}/${bookingId}/cancel`,
      {},
      this.httpOptions
    );
  }

  getBookingStatus(pnr: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/booking_status/${pnr}`,
      this.httpOptions
    );
  }

  getTicketDetails(ticketId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/fetch_ticket_details/${ticketId}`,
      this.httpOptions
    );
  }

  makePayment(paymentData: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/payment`,
      paymentData,
      this.httpOptions
    );
  }

  getPaymentStatus(transactionId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/payment/status/${transactionId}`,
      this.httpOptions
    );
  }

  getAvailableSeats(params: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/seats/available`, {
      params,
      ...this.httpOptions,
    });
  }
}
