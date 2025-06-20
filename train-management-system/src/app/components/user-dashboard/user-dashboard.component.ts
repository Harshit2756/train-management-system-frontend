import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiResponse, Train } from '../../models/train.model';
import { LoginResponse } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { TrainService } from '../../services/train.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit {
  trains: Train[] = [];
  searchTrainNumber: string = '';
  searchTrainName: string = '';
  searchTrainType: string = '';
  currentUser: LoginResponse | null = null;
  activeTab = 'trains';
  sessionInfo: { user: LoginResponse | null; isValid: boolean; remainingTime: number } | null = null;
  isLoading: boolean = false;
  errorMessage: string | null = null;

  constructor(
    private trainService: TrainService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.sessionInfo = this.authService.getSessionInfo();
    
    // Check if user is actually logged in
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    
    // Check if user is a customer
    if (!this.authService.isCustomer()) {
      this.router.navigate(['/admin/dashboard']);
      return;
    }

    this.loadAllTrains();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  getSessionTimeRemaining(): string {
    if (!this.sessionInfo || !this.sessionInfo.isValid) {
      return 'Session expired';
    }
    
    const hours = Math.floor(this.sessionInfo.remainingTime / (1000 * 60 * 60));
    const minutes = Math.floor((this.sessionInfo.remainingTime % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m remaining`;
  }

  refreshSession(): void {
    this.authService.refreshSession();
    this.sessionInfo = this.authService.getSessionInfo();
  }

  loadAllTrains(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.trainService.getAllTrains().subscribe({
      next: (response: ApiResponse) => {
        this.isLoading = false;
        if (response.success) {
          this.trains = response.data;
        } else {
          this.errorMessage = response.message;
          this.trains = [];
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'An error occurred while fetching trains.';
        this.trains = [];
        console.error(err);
      }
    });
  }

  search(): void {
    const params: any = {};
    if (this.searchTrainNumber) {
      params.trainNumber = this.searchTrainNumber;
    }
    if (this.searchTrainName) {
      params.trainName = this.searchTrainName;
    }
    if (this.searchTrainType) {
      params.trainType = this.searchTrainType;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.trainService.searchTrains(params).subscribe({
      next: (response: ApiResponse) => {
        this.isLoading = false;
        if (response.success) {
          this.trains = response.data;
          if (this.trains.length === 0) {
            this.errorMessage = 'No trains found matching your criteria.';
          }
        } else {
          this.errorMessage = response.message;
          this.trains = [];
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'An error occurred while searching for trains.';
        this.trains = [];
        console.error(err);
      }
    });
  }

  resetSearch(): void {
    this.searchTrainNumber = '';
    this.searchTrainName = '';
    this.searchTrainType = '';
    this.loadAllTrains();
  }
} 