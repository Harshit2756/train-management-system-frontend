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
} from '../../../shared/models/train.model';
import { timeValidator } from '../../../shared/validators/time.validator';

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
        arrivalTime: ['', Validators.required],
        status: ['ACTIVE', Validators.required],
        scheduleDays: this.fb.array(
          [],
          [Validators.required, Validators.minLength(1)]
        ),
        fareTypes: this.fb.array([], Validators.required),
      },
      { validators: timeValidator() }
    );
  }

  ngOnInit(): void {
    this.addFareType();
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

    const formValue = this.trainForm.value;

    const newTrain: TrainRequest = {
      ...formValue,
      departureTime: this.formatTime(formValue.departureTime),
      arrivalTime: this.formatTime(formValue.arrivalTime),
    };

    this.trainService.createTrain(newTrain).subscribe({
      next: (createdTrain) => {
        this.notificationService.show(
          `Train '${createdTrain.trainName}' created successfully!`
        );
        this.router.navigate(['/admin/trains']);
      },
      error: (err) => {
        this.notificationService.show(
          `Error: ${err.error?.message || 'Could not create train.'}`,
          'error'
        );
        console.error('Error creating train:', err);
      },
    });
  }
}
