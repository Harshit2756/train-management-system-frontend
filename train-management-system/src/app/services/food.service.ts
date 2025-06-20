import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class FoodService {
  private apiUrl = '/api/food';

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  // Item endpoints
  getItems(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/items`, this.httpOptions);
  }

  addItem(itemData: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/items`, itemData, this.httpOptions);
  }

  // Order endpoints
  createOrder(orderData: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/orders`, orderData, this.httpOptions);
  }

  getOrderById(orderId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/orders/${orderId}`, this.httpOptions);
  }

  getOrderHistory(customerId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/orders/history/${customerId}`, this.httpOptions);
  }
} 