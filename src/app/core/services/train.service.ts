import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../src/environments/environment';
import { Train, TrainRequest } from '../../shared/models/train.model';

export interface Stations {
  sourceStations: string[];
  destinationStations: string[];
}

@Injectable({
  providedIn: 'root',
})
export class TrainService {
  private apiUrl = `${environment.apiUrl}/trains`;

  constructor(private http: HttpClient) {}

  getAllTrains(): Observable<Train[]> {
    return this.http.get<Train[]>(this.apiUrl);
  }

  getLocations(): Observable<{ sources: string[]; destinations: string[] }> {
    return this.http.get<Stations>(`${this.apiUrl}/stations`).pipe(
      map((data) => ({
        sources: data.sourceStations,
        destinations: data.destinationStations,
      }))
    );
  }

  searchTrains(
    source: string,
    destination: string,
    journeyDate: string
  ): Observable<Train[]> {
    const searchRequest = { source, destination, journeyDate };
    return this.http.post<Train[]>(`${this.apiUrl}/search`, searchRequest);
  }

  createTrain(train: TrainRequest): Observable<Train> {
    return this.http.post<Train>(this.apiUrl, train);
  }

  updateTrain(trainId: number, train: TrainRequest): Observable<Train> {
    return this.http.put<Train>(`${this.apiUrl}/${trainId}`, train);
  }

  updateTrainStatus(
    trainId: number,
    status: 'ACTIVE' | 'INACTIVE'
  ): Observable<Train> {
    return this.http.put<Train>(
      `${this.apiUrl}/${trainId}/status?status=${status}`,
      {}
    );
  }
}
