import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import jsPDF from 'jspdf';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthService } from '../../core/services/auth.service';
import { BookingService } from '../../core/services/booking.service';
import { Booking } from '../../shared/models/booking.model';
import { FareType, Train } from '../../shared/models/train.model';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css'],
})
export class BookingComponent implements OnInit {
  bookingStep: 'details' | 'review' | 'confirmation' = 'details';
  bookingForm!: FormGroup;
  train!: Train;
  fare!: FareType;
  journeyDate!: string;
  confirmedBooking: Booking | null = null;
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private bookingService: BookingService,
    private authService: AuthService
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.train = navigation.extras.state['train'];
      this.fare = navigation.extras.state['fare'];
      this.journeyDate = navigation.extras.state['journeyDate'];
    }
  }

  ngOnInit(): void {
    if (!this.train) {
      this.router.navigate(['/trains']);
      return;
    }

    this.bookingForm = this.fb.group({
      passengers: this.fb.array(
        [this.createPassengerFormGroup()],
        [Validators.required, Validators.maxLength(10)]
      ),
    });
  }

  createPassengerFormGroup(): FormGroup {
    return this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
        ],
      ],
      age: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
      gender: ['MALE', Validators.required],
      idProof: ['', [Validators.required, Validators.pattern('^\\d{12}$')]],
    });
  }

  get passengers(): FormArray {
    return this.bookingForm.get('passengers') as FormArray;
  }

  addPassenger(): void {
    if (this.passengers.length < 10) {
      this.passengers.push(this.createPassengerFormGroup());
    }
  }

  removePassenger(index: number): void {
    if (this.passengers.length > 1) {
      this.passengers.removeAt(index);
    }
  }

  nextStep(): void {
    if (this.bookingForm.valid) {
      this.bookingStep = 'review';
    } else {
      this.bookingForm.markAllAsTouched();
    }
  }

  previousStep(): void {
    if (this.bookingStep === 'review') {
      this.bookingStep = 'details';
    }
  }

  get totalFare(): number {
    return (this.passengers?.length || 0) * (this.fare?.price || 0);
  }

  confirmBooking(): void {
    if (!this.bookingForm.valid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const user = this.authService.getUser();
    if (!user) {
      this.errorMessage = 'You must be logged in to book a ticket.';
      this.isLoading = false;
      return;
    }

    const bookingRequest: Booking = {
      userId: user.userId,
      trainId: this.train.trainId,
      fareTypeId: this.fare.fareTypeId,
      journeyDate: this.journeyDate,
      totalFare: this.totalFare,
      passengers: this.passengers.value,
      bookingId: 0,
      username: user.username,
      trainName: this.train.trainName,
      source: this.train.source,
      destination: this.train.destination,
      departureTime: this.train.departureTime,
      arrivalTime: this.train.arrivalTime,
      classType: this.fare.classType,
      price: this.fare.price,
      bookingDate: new Date().toISOString(),
      status: 'CONFIRMED',
    };

    this.bookingService
      .createBooking(bookingRequest)
      .pipe(
        catchError((err) => {
          this.errorMessage =
            err.error?.message || 'An unknown error occurred during booking.';
          this.isLoading = false;
          return of(null);
        })
      )
      .subscribe((response) => {
        this.isLoading = false;
        if (response) {
          this.confirmedBooking = response;
          this.bookingStep = 'confirmation';
        }
      });
  }

  downloadTicket(): void {
    if (!this.confirmedBooking) return;

    const doc = new jsPDF();
    const booking = this.confirmedBooking;

    // Header
    doc.setFontSize(22);
    doc.text('Train Ticket', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Booking ID: ${booking.bookingId}`, 20, 30);
    doc.text(
      `Booking Date: ${new Date(booking.bookingDate).toLocaleDateString()}`,
      190,
      30,
      { align: 'right' }
    );

    // Train Details
    doc.setFontSize(16);
    doc.text('Journey Details', 20, 50);
    doc.setFontSize(12);
    doc.text(`Train: ${booking.trainName} (#${booking.trainId})`, 20, 60);
    doc.text(`From: ${booking.source}`, 20, 70);
    doc.text(`To: ${booking.destination}`, 20, 80);
    doc.text(
      `Date: ${new Date(booking.journeyDate).toLocaleDateString()}`,
      20,
      90
    );
    doc.text(
      `Departure: ${booking.departureTime.slice(
        0,
        5
      )} | Arrival: ${booking.arrivalTime.slice(0, 5)}`,
      20,
      100
    );
    doc.text(`Class: ${booking.classType}`, 20, 110);

    // Passengers
    doc.setFontSize(16);
    doc.text('Passengers', 20, 130);
    let y = 140;
    booking.passengers.forEach((p, i) => {
      doc.setFontSize(12);
      doc.text(`${i + 1}. ${p.name} (Age: ${p.age}, ${p.gender})`, 20, y);
      y += 10;
    });

    // Fare
    doc.setFontSize(16);
    doc.text('Fare Details', 20, y + 10);
    doc.setFontSize(12);
    doc.text(`Total Fare: ${booking.totalFare.toFixed(2)} INR`, 20, y + 20);

    doc.save(`ticket-${booking.bookingId}.pdf`);
  }
}
