import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TrainService {
  private apiUrl = '/api/train';

  constructor(private http: HttpClient) {}

  getAllTrains(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  searchTrains(params: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/search`, { params });
  }

  getTrainById(trainId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${trainId}`);
  }

  getSchedule(trainId: number, date: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/schedule/${trainId}/${date}`);
  }
}
