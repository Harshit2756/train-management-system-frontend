import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { BookingHistoryComponent } from './booking-history.component';

const routes: Routes = [{ path: '', component: BookingHistoryComponent }];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    BookingHistoryComponent,
  ],
})
export class BookingHistoryModule {}
