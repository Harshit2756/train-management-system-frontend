import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
})
export class LandingComponent {
  constructor(private router: Router) {}

  navigateToLogin(): void {
    console.log('Navigating to login');
    this.router.navigate(['/login']);
  }

  navigateToRegister(): void {
    console.log('Navigating to register');
    this.router.navigate(['/register']);
  }
}
