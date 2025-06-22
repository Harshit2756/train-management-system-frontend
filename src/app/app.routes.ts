import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';
import { AdminLayoutComponent } from './core/layout/admin/admin-layout.component';
import { LayoutComponent } from './core/layout/layout.component';
import { AdminComponent } from './features/admin/admin.component';
import { AdminProfileComponent } from './features/admin/profile/admin-profile.component';
import { TrainFormComponent } from './features/admin/train-form/train-form.component';
import { TrainManagementComponent } from './features/admin/train-management/train-management.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { BookingHistoryComponent } from './features/booking-history/booking-history.component';
import { BookingComponent } from './features/booking/booking.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { LandingComponent } from './features/landing/landing.component';
import { ProfileComponent } from './features/profile/profile.component';
import { TrainSearchComponent } from './features/train-search/train-search.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard, adminGuard],
    children: [
      { path: '', component: AdminComponent, pathMatch: 'full' },
      { path: 'trains', component: TrainManagementComponent },
      { path: 'trains/new', component: TrainFormComponent },
      { path: 'trains/edit/:id', component: TrainFormComponent },
      { path: 'profile', component: AdminProfileComponent },
    ],
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'train-search', component: TrainSearchComponent },
      { path: 'booking', component: BookingComponent },
      { path: 'booking-history', component: BookingHistoryComponent },
      { path: 'profile', component: ProfileComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
];
