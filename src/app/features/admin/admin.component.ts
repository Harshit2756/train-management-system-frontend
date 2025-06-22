import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Observable, catchError, of } from 'rxjs';
import { AdminService } from '../../core/services/admin.service';
import { AdminDashboardResponse } from '../../shared/models/admin.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyPipe],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent implements OnInit {
  dashboardStats$!: Observable<AdminDashboardResponse | null>;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.dashboardStats$ = this.adminService.getDashboardStatistics().pipe(
      catchError((error) => {
        console.error('Error fetching dashboard statistics:', error);
        return of(null);
      })
    );
  }
}
