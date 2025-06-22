import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  startWith,
  Subject,
  takeUntil,
} from 'rxjs';
import {
  Notification,
  NotificationService,
} from '../../../core/services/notification.service';
import { TrainService } from '../../../core/services/train.service';
import { Train } from '../../../shared/models/train.model';

@Component({
  selector: 'app-train-management',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './train-management.component.html',
  styleUrls: ['./train-management.component.css'],
})
export class TrainManagementComponent implements OnInit, OnDestroy {
  private trains$ = new BehaviorSubject<Train[]>([]);
  filteredTrains$ = new BehaviorSubject<Train[]>([]);
  notification$: Observable<Notification | null>;

  searchTerm = new FormControl('');
  statusFilter = new FormControl('ALL');

  private destroy$ = new Subject<void>();

  constructor(
    private trainService: TrainService,
    private notificationService: NotificationService
  ) {
    this.notification$ = this.notificationService.notification$;
  }

  ngOnInit(): void {
    this.trainService.getAllTrains().subscribe((trains) => {
      this.trains$.next(trains);
    });

    combineLatest([
      this.trains$,
      this.searchTerm.valueChanges.pipe(startWith('')),
      this.statusFilter.valueChanges.pipe(startWith('ALL')),
    ])
      .pipe(
        map(([trains, searchTerm, status]) =>
          this.filterTrains(trains, searchTerm || '', status || 'ALL')
        ),
        takeUntil(this.destroy$)
      )
      .subscribe((filtered) => {
        this.filteredTrains$.next(filtered);
      });
  }

  ngOnDestroy(): void {
    this.notificationService.clear();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private filterTrains(
    trains: Train[],
    searchTerm: string,
    status: string
  ): Train[] {
    const lowerCaseSearch = searchTerm.toLowerCase();
    return trains.filter((train) => {
      const matchesSearch =
        train.trainName.toLowerCase().includes(lowerCaseSearch) ||
        train.source.toLowerCase().includes(lowerCaseSearch) ||
        train.destination.toLowerCase().includes(lowerCaseSearch) ||
        String(train.trainId).includes(lowerCaseSearch);

      const matchesStatus = status === 'ALL' || train.status === status;

      return matchesSearch && matchesStatus;
    });
  }

  toggleStatus(train: Train): void {
    const newStatus = train.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    if (
      confirm(
        `Are you sure you want to set the status of ${train.trainName} to ${newStatus}?`
      )
    ) {
      this.trainService
        .updateTrainStatus(train.trainId, newStatus)
        .subscribe((updatedTrain) => {
          const currentTrains = this.trains$.getValue();
          const index = currentTrains.findIndex(
            (t) => t.trainId === updatedTrain.trainId
          );
          if (index !== -1) {
            currentTrains[index] = updatedTrain;
            this.trains$.next([...currentTrains]);
          }
        });
    }
  }
}
