import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserRegistrationRequest } from '../../../shared/models/user.model';
import { usernameExistsValidator } from '../../../shared/validators/username-async.validator';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isLoading = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  passwordVisible = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const passwordValidators = [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      ),
    ];

    this.registerForm = this.fb.group({
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(20),
          Validators.pattern(/^[a-zA-Z0-9_]+$/),
        ],
        [usernameExistsValidator(this.authService)],
      ],
      email: ['', [Validators.required, Validators.email]],
      password: ['', passwordValidators],
      phone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const registrationData: UserRegistrationRequest = this.registerForm.value;

    this.authService.register(registrationData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Registration successful! You can now log in.';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        const fieldErrors = err.error?.fieldErrors;

        if (fieldErrors && Object.keys(fieldErrors).length > 0) {
          // If the backend returns specific field errors, apply them
          for (const field in fieldErrors) {
            if (fieldErrors.hasOwnProperty(field)) {
              const formControl = this.registerForm.get(field);
              if (formControl) {
                formControl.setErrors({ serverError: fieldErrors[field] });
              }
            }
          }
          // Set a generic message to inform user to check the fields
          this.errorMessage = 'Please correct the errors highlighted below.';
        } else {
          // Otherwise, display the main error message at the top
          this.errorMessage =
            err.error?.message ||
            'An unexpected error occurred. Please try again.';
        }
      },
    });
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }
}
