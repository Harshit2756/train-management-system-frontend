import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class TrainAdminService {
  private apiUrl = '/api/train/admin';

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  addTrain(trainData: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/trains`, trainData, this.httpOptions);
  }

  updateTrain(trainId: number, trainData: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/trains/${trainId}`, trainData, this.httpOptions);
  }

  deleteTrain(trainId: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/trains/${trainId}`, this.httpOptions);
  }

  createSchedule(scheduleData: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/schedule`, scheduleData, this.httpOptions);
  }

  updateSchedule(scheduleId: number, scheduleData: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/schedule/${scheduleId}`, scheduleData, this.httpOptions);
  }

  uploadActiveTrains(file: File): Observable<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/active_trains/upload`, formData);
  }

  bulkUploadTrains(trains: any[]): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/trains/bulkupload/json`, trains, this.httpOptions);
  }
} 