import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule, RouterLink],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent {
    loginForm: FormGroup;
    errorMessage: string = '';
    isLoading: boolean = false;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required]
        });
    }

    onSubmit() {
        if (this.loginForm.valid) {
            this.isLoading = true;
            this.errorMessage = '';

            // Set a timeout to prevent infinite loading
            const timeout = setTimeout(() => {
                if (this.isLoading) {
                    this.isLoading = false;
                    this.errorMessage = 'Login request timed out. Please try again.';
                }
            }, 5000); // 5 second timeout

            this.authService.login(this.loginForm.value).subscribe({
                next: (response) => {
                    clearTimeout(timeout);
                    this.isLoading = false;
                    this.router.navigate(['/dashboard']);
                },
                error: (err) => {
                    clearTimeout(timeout);
                    this.isLoading = false;

                    // Better error messages
                    if (err.status === 401 || err.status === 403) {
                        this.errorMessage = 'Invalid email or password. Please try again.';
                    } else if (err.status === 0) {
                        this.errorMessage = 'Cannot connect to server. Please check if the backend is running.';
                    } else {
                        this.errorMessage = 'Login failed. Please try again.';
                    }

                    console.error('Login error:', err);
                }
            });
        }
    }
}
