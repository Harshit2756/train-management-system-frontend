import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginResponse } from '../../models/user.model';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.css'
})
export class UserDashboardComponent implements OnInit {
  currentUser: LoginResponse | null = null;
  activeTab = 'overview';
  sessionInfo: { user: LoginResponse | null; isValid: boolean; remainingTime: number } | null = null;

  constructor(private authService: AuthService, private router: Router) {}

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
} 