import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule, RouterLink],
    templateUrl: './register.component.html',
    styleUrl: './register.component.css'
})
export class RegisterComponent {
    registerForm: FormGroup;
    errorMessage: string = '';
    isLoading: boolean = false;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.registerForm = this.fb.group({
            name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            role: ['USER']
        });
    }

    onSubmit() {
        if (this.registerForm.valid) {
            this.isLoading = true;
            this.authService.register(this.registerForm.value).subscribe({
                next: () => {
                    this.isLoading = false;
                    this.router.navigate(['/login']);
                },
                error: (err) => {
                    this.isLoading = false;
                    this.errorMessage = 'Registration failed';
                    console.error(err);
                }
            });
        }
    }
}
