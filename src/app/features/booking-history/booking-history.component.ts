import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import jsPDF from 'jspdf';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { catchError, map, startWith } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { BookingService } from '../../core/services/booking.service';
import { Booking } from '../../shared/models/booking.model';

@Component({
  selector: 'app-booking-history',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './booking-history.component.html',
  styleUrls: ['./booking-history.component.css'],
})
export class BookingHistoryComponent implements OnInit {
  private bookingsSubject = new BehaviorSubject<Booking[]>([]);
  bookings$ = this.bookingsSubject.asObservable();
  filteredBookings$: Observable<Booking[]>;
  searchControl = new FormControl('');

  constructor(
    private bookingService: BookingService,
    private authService: AuthService
  ) {
    this.filteredBookings$ = of([]);
  }

  ngOnInit(): void {
    this.loadBookings();

    this.filteredBookings$ = combineLatest([
      this.bookings$,
      this.searchControl.valueChanges.pipe(startWith('')),
    ]).pipe(
      map(([bookings, searchTerm]) => {
        if (!searchTerm) {
          return bookings;
        }
        return bookings.filter(
          (b) =>
            b.trainName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.destination.toLowerCase().includes(searchTerm.toLowerCase())
        );
      })
    );
  }

  loadBookings(): void {
    const user = this.authService.getUser();
    if (user && user.userId) {
      this.bookingService
        .getBookingsByUserId(user.userId)
        .pipe(catchError(() => of([])))
        .subscribe((bookings) => this.bookingsSubject.next(bookings));
    }
  }

  cancelBooking(bookingId: number): void {
    if (
      confirm(
        'Are you sure you want to cancel this booking? This action cannot be undone.'
      )
    ) {
      this.bookingService.cancelBooking(bookingId).subscribe({
        next: () => this.loadBookings(),
        error: (err) => {
          console.error('Failed to cancel booking', err);
          alert(
            err.error?.message ||
              'An error occurred while cancelling the booking.'
          );
        },
      });
    }
  }

  downloadTicket(booking: Booking): void {
    const doc = new jsPDF();

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
