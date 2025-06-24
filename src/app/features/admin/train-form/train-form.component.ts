import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';
import { TrainService } from '../../../core/services/train.service';
import {
  ClassType,
  DaysOfWeek,
  TrainRequest,
  computeArrivalDayOffset,
  computeArrivalTime,
} from '../../../shared/models/train.model';

@Component({
  selector: 'app-train-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './train-form.component.html',
  styleUrls: ['./train-form.component.css'],
})
export class TrainFormComponent implements OnInit {
  trainForm: FormGroup;
  daysOfWeek = Object.values(DaysOfWeek);
  classTypes = Object.values(ClassType);
  trainStatus = ['ACTIVE', 'INACTIVE'];
  isLoading = false;
  computedArrivalTime = '';
  arrivalDayOffset = 0;

  constructor(
    private fb: FormBuilder,
    private trainService: TrainService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.trainForm = this.fb.group(
      {
        trainName: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(100),
          ],
        ],
        source: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(100),
          ],
        ],
        destination: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(100),
          ],
        ],
        departureTime: ['', Validators.required],
        journeyHours: [
          0,
          [Validators.required, Validators.min(0), Validators.max(168)],
        ],
        journeyMinutes: [
          0,
          [Validators.required, Validators.min(0), Validators.max(59)],
        ],
        status: ['ACTIVE', Validators.required],
        scheduleDays: this.fb.array(
          [],
          [Validators.required, Validators.minLength(1)]
        ),
        fareTypes: this.fb.array([], Validators.required),
      },
      { validators: this.minimumJourneyDurationValidator }
    );

    // Watch for changes to compute arrival time
    this.trainForm.valueChanges.subscribe(() => {
      this.updateComputedArrivalTime();
    });
  }

  ngOnInit(): void {
    this.addFareType();
    this.updateComputedArrivalTime();
  }

  get fareTypes(): FormArray {
    return this.trainForm.get('fareTypes') as FormArray;
  }

  addFareType(): void {
    this.fareTypes.push(
      this.fb.group({
        classType: [ClassType.SL, Validators.required],
        price: ['', [Validators.required, Validators.min(0.01)]],
        seatsAvailable: ['', [Validators.required, Validators.min(1)]],
      })
    );
  }

  removeFareType(index: number): void {
    this.fareTypes.removeAt(index);
  }

  onCheckboxChange(e: Event): void {
    const scheduleDays: FormArray = this.trainForm.get(
      'scheduleDays'
    ) as FormArray;
    const input = e.target as HTMLInputElement;

    if (input.checked) {
      scheduleDays.push(this.fb.control(input.value));
    } else {
      const index = scheduleDays.controls.findIndex(
        (x) => x.value === input.value
      );
      scheduleDays.removeAt(index);
    }
  }

  private formatTime(time: string): string {
    if (!time) return '';
    return `${time}:00`;
  }

  onSubmit(): void {
    if (this.trainForm.invalid) {
      this.trainForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    const formValue = this.trainForm.value;
    const newTrain: TrainRequest = {
      ...formValue,
      departureTime: this.formatTime(formValue.departureTime),
    };
    this.trainService.createTrain(newTrain).subscribe({
      next: (createdTrain) => {
        this.notificationService.show(
          `Train '${createdTrain.trainName}' created successfully!`
        );
        this.isLoading = false;
        this.router.navigate(['/admin/trains']);
      },
      error: (err) => {
        this.notificationService.show(
          `Error: ${err.error?.message || 'Could not create train.'}`,
          'error'
        );
        this.isLoading = false;
        console.error('Error creating train:', err);
      },
    });
  }

  updateComputedArrivalTime(): void {
    const formValue = this.trainForm.value;

    // Reset computed values first
    this.computedArrivalTime = '';
    this.arrivalDayOffset = 0;

    // Only compute if all required fields are filled and valid
    if (
      formValue.departureTime &&
      formValue.journeyHours !== null &&
      formValue.journeyHours !== undefined &&
      formValue.journeyMinutes !== null &&
      formValue.journeyMinutes !== undefined &&
      !this.trainForm.errors?.['minimumJourneyDuration']
    ) {
      this.computedArrivalTime = computeArrivalTime(
        formValue.departureTime,
        formValue.journeyHours,
        formValue.journeyMinutes
      );
      this.arrivalDayOffset = computeArrivalDayOffset(
        formValue.departureTime,
        formValue.journeyHours,
        formValue.journeyMinutes
      );
    }
  }

  private minimumJourneyDurationValidator(
    form: FormGroup
  ): { [key: string]: boolean } | null {
    const journeyHours = form.get('journeyHours')?.value;
    const journeyMinutes = form.get('journeyMinutes')?.value;

    // Don't validate if either field is empty/null/undefined
    if (
      journeyHours === null ||
      journeyHours === undefined ||
      journeyMinutes === null ||
      journeyMinutes === undefined
    ) {
      return null;
    }

    // Convert to numbers if they're strings
    const hours = Number(journeyHours);
    const minutes = Number(journeyMinutes);

    // Check if conversion failed (NaN)
    if (isNaN(hours) || isNaN(minutes)) {
      return null;
    }

    const totalMinutes = hours * 60 + minutes;
    if (totalMinutes < 60) {
      return { minimumJourneyDuration: true };
    }

    return null;
  }
}
