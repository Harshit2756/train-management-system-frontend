import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../src/environments/environment';
import {
  Train,
  TrainRequest,
  computeArrivalDayOffset,
  computeArrivalTime,
} from '../../shared/models/train.model';

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
    return this.http
      .get<Train[]>(this.apiUrl)
      .pipe(
        map((trains) =>
          trains.map((train) => this.enrichTrainWithComputedFields(train))
        )
      );
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
    return this.http
      .post<Train[]>(`${this.apiUrl}/search`, searchRequest)
      .pipe(
        map((trains) =>
          trains.map((train) => this.enrichTrainWithComputedFields(train))
        )
      );
  }

  createTrain(train: TrainRequest): Observable<Train> {
    return this.http
      .post<Train>(this.apiUrl, train)
      .pipe(
        map((createdTrain) => this.enrichTrainWithComputedFields(createdTrain))
      );
  }

  updateTrain(trainId: number, train: TrainRequest): Observable<Train> {
    return this.http
      .put<Train>(`${this.apiUrl}/${trainId}`, train)
      .pipe(
        map((updatedTrain) => this.enrichTrainWithComputedFields(updatedTrain))
      );
  }

  updateTrainStatus(
    trainId: number,
    status: 'ACTIVE' | 'INACTIVE'
  ): Observable<Train> {
    return this.http
      .put<Train>(`${this.apiUrl}/${trainId}/status?status=${status}`, {})
      .pipe(
        map((updatedTrain) => this.enrichTrainWithComputedFields(updatedTrain))
      );
  }

  private enrichTrainWithComputedFields(train: Train): Train {
    if (
      train.departureTime &&
      train.journeyHours !== undefined &&
      train.journeyMinutes !== undefined
    ) {
      return {
        ...train,
        computedArrivalTime: computeArrivalTime(
          train.departureTime,
          train.journeyHours,
          train.journeyMinutes
        ),
        arrivalDayOffset: computeArrivalDayOffset(
          train.departureTime,
          train.journeyHours,
          train.journeyMinutes
        ),
      };
    }
    return train;
  }
}
