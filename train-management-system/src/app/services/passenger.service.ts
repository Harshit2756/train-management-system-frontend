import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class PassengerService {
  private apiUrl = '/api/user/passengers';

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  getPassengers(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(this.apiUrl, this.httpOptions);
  }

  addPassenger(passengerData: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.apiUrl, passengerData, this.httpOptions);
  }

  getPassengerById(passengerId: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${passengerId}`, this.httpOptions);
  }

  updatePassenger(passengerId: number, passengerData: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/${passengerId}`, passengerData, this.httpOptions);
  }

  deletePassenger(passengerId: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${passengerId}`, this.httpOptions);
  }
} 