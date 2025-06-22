import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { AuthService } from '../../core/services/auth.service';
import { BookingService } from '../../core/services/booking.service';
import { TrainService } from '../../core/services/train.service';
import { Booking } from '../../shared/models/booking.model';

export const differentStationsValidator: ValidatorFn = (
  control: AbstractControl
): { [key: string]: any } | null => {
  const source = control.get('source');
  const destination = control.get('destination');
  return source &&
    destination &&
    source.value &&
    destination.value &&
    source.value === destination.value
    ? { sameStation: true }
    : null;
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  quickSearchForm!: FormGroup;
  recentBookings$!: Observable<Booking[]>;
  sources$!: Observable<string[]>;
  destinations$!: Observable<string[]>;
  popularDestinations: { from: string; to: string }[] = [];
  minDate!: string;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private bookingService: BookingService,
    private trainService: TrainService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const today = new Date();
    const month = ('0' + (today.getMonth() + 1)).slice(-2);
    const day = ('0' + today.getDate()).slice(-2);
    this.minDate = `${today.getFullYear()}-${month}-${day}`;

    const user = this.authService.getUser();
    if (user && user.userId) {
      this.recentBookings$ = this.bookingService
        .getBookingsByUserId(user.userId)
        .pipe(
          catchError(() => of([])) // On error, return empty array
        );
    } else {
      this.recentBookings$ = of([]);
    }

    const locations$ = this.trainService.getLocations().pipe(
      tap(({ sources, destinations }) => {
        this.generatePopularDestinations(sources, destinations);
      }),
      catchError(() => {
        this.popularDestinations = [];
        return of({ sources: [], destinations: [] });
      })
    );

    this.sources$ = locations$.pipe(map((data) => data.sources));
    this.destinations$ = locations$.pipe(map((data) => data.destinations));

    this.quickSearchForm = this.fb.group(
      {
        source: ['', Validators.required],
        destination: ['', Validators.required],
        journeyDate: [this.minDate, Validators.required],
      },
      { validators: differentStationsValidator }
    );
  }

  private generatePopularDestinations(
    sources: string[],
    destinations: string[]
  ): void {
    if (sources.length === 0 || destinations.length === 0) {
      this.popularDestinations = [];
      return;
    }

    const shuffledSources = this.shuffleArray([...sources]);
    const shuffledDestinations = this.shuffleArray([...destinations]);
    const pairs = new Set<string>();
    const popular: { from: string; to: string }[] = [];

    let i = 0;
    while (popular.length < 3 && i < shuffledSources.length * 2) {
      const from = shuffledSources[i % shuffledSources.length];
      const to = shuffledDestinations[i % shuffledDestinations.length];
      const pairKey = `${from}->${to}`;

      if (from !== to && !pairs.has(pairKey)) {
        pairs.add(pairKey);
        popular.push({ from, to });
      }
      i++;
    }

    this.popularDestinations = popular;
  }

  private shuffleArray(array: any[]): any[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  selectPopularDestination(from: string, to: string): void {
    const journeyDate =
      this.quickSearchForm.get('journeyDate')?.value || this.minDate;
    this.router.navigate(['/trains'], {
      queryParams: { source: from, destination: to, date: journeyDate },
    });
  }

  searchTrains(): void {
    if (this.quickSearchForm.valid) {
      const { source, destination, journeyDate } = this.quickSearchForm.value;
      this.router.navigate(['/trains'], {
        queryParams: { source, destination, date: journeyDate },
      });
    } else {
      this.quickSearchForm.markAllAsTouched();
    }
  }
}
