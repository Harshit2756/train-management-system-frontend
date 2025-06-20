import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiResponse, Train } from '../../models/train.model';
import { LoginResponse } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { TrainAdminService } from '../../services/train-admin.service';
import { TrainService } from '../../services/train.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnInit {
  currentUser: LoginResponse | null = null;
  activeTab = 'trains';
  trains: Train[] = [];
  isLoading = false;
  errorMessage: string | null = null;

  searchTrainNumber = '';
  searchTrainName = '';
  searchTrainType = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private trainService: TrainService,
    private trainAdminService: TrainAdminService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.authService.isLoggedIn() || !this.authService.isAdmin()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadAllTrains();
  }

  loadAllTrains(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.trainService.getAllTrains().subscribe({
      next: (response: ApiResponse) => {
        if (response.success) {
          this.trains = response.data;
        } else {
          this.errorMessage = response.message;
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load trains.';
        this.isLoading = false;
      },
    });
  }

  search(): void {
    this.isLoading = true;
    this.errorMessage = null;
    const params: any = {};
    if (this.searchTrainNumber) params.trainNumber = this.searchTrainNumber;
    if (this.searchTrainName) params.trainName = this.searchTrainName;
    if (this.searchTrainType) params.trainType = this.searchTrainType;

    this.trainService.searchTrains(params).subscribe({
      next: (response: ApiResponse) => {
        if (response.success) {
          this.trains = response.data;
          if (this.trains.length === 0) {
            this.errorMessage = 'No trains found matching your criteria.';
          }
        } else {
          this.errorMessage = response.message;
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to search trains.';
        this.isLoading = false;
      },
    });
  }

  deleteTrain(trainId: number): void {
    if (confirm('Are you sure you want to delete this train?')) {
      this.trainAdminService.deleteTrain(trainId).subscribe({
        next: (response: ApiResponse) => {
          if (response.success) {
            this.loadAllTrains(); // Refresh the list
          } else {
            this.errorMessage = response.message;
          }
        },
        error: (err) => {
          this.errorMessage = 'Failed to delete train.';
        },
      });
    }
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) {
      return 'Good Morning';
    } else if (hour < 18) {
      return 'Good Afternoon';
    } else {
      return 'Good Evening';
    }
  }
}
