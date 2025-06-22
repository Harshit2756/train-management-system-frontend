import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { TrainService } from '../../core/services/train.service';
import { Train } from '../../shared/models/train.model';

@Component({
  selector: 'app-train-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './train-search.component.html',
  styleUrls: ['./train-search.component.css'],
})
export class TrainSearchComponent implements OnInit {
  searchForm!: FormGroup;
  trains$: Observable<Train[]> = of([]);
  sources$!: Observable<string[]>;
  destinations$!: Observable<string[]>;
  minDate!: string;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private trainService: TrainService
  ) {}

  ngOnInit(): void {
    const today = new Date();
    const month = ('0' + (today.getMonth() + 1)).slice(-2);
    const day = ('0' + today.getDate()).slice(-2);
    this.minDate = `${today.getFullYear()}-${month}-${day}`;

    this.searchForm = this.fb.group({
      source: [''],
      destination: [''],
      journeyDate: [this.minDate],
    });

    this.sources$ = this.trainService
      .getLocations()
      .pipe(map((data) => data.sources));
    this.destinations$ = this.trainService
      .getLocations()
      .pipe(map((data) => data.destinations));

    this.route.queryParams.subscribe((params) => {
      if (params['source'] && params['destination'] && params['date']) {
        this.searchForm.patchValue({
          source: params['source'],
          destination: params['destination'],
          journeyDate: params['date'],
        });
        this.searchTrains();
      }
    });
  }

  searchTrains(): void {
    if (this.searchForm.valid) {
      const { source, destination, journeyDate } = this.searchForm.value;
      this.trains$ = this.trainService
        .searchTrains(source, destination, journeyDate)
        .pipe(catchError(() => of([])));

      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { source, destination, date: journeyDate },
        queryParamsHandling: 'merge',
      });
    }
  }

  bookTrain(train: Train, fare: any): void {
    this.router.navigate(['/bookings/new'], {
      state: {
        train,
        fare,
        journeyDate: this.searchForm.get('journeyDate')?.value,
      },
    });
  }
}
