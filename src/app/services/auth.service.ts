import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, timeout, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { LoginRequest, RegisterRequest, AuthResponse } from '../models/auth.models';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://localhost:8080/api/auth';

    private sessionTimer: any;
    public timeRemaining$ = new BehaviorSubject<string>('');

    constructor(private http: HttpClient, private router: Router, private ngZone: NgZone) {
        if (this.isAuthenticated()) {
            this.startSessionTimer();
        }
    }

    register(registerRequest: RegisterRequest): Observable<string> {
        return this.http.post(this.apiUrl + '/register', registerRequest, { responseType: 'text' });
    }

    login(loginRequest: LoginRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(this.apiUrl + '/login', loginRequest).pipe(
            timeout(3000), // 3 second timeout for HTTP request
            tap(response => {
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response));
                this.startSessionTimer();
            })
        );
    }

    logout(): void {
        this.stopSessionTimer();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.router.navigate(['/login']);
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    getUser(): AuthResponse | null {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }

    isAuthenticated(): boolean {
        const token = this.getToken();
        if (!token) return false;

        // Check if token is expired
        try {
            const decoded: any = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            if (decoded.exp && decoded.exp < currentTime) {
                this.logout();
                return false;
            }
            return true;
        } catch (e) {
            return false;
        }
    }

    getRole(): string | null {
        const token = this.getToken();
        if (!token) return null;
        try {
            const decoded: any = jwtDecode(token);
            return decoded.role || decoded.authority || null;
        } catch (e) {
            return null;
        }
    }

    isAdmin(): boolean {
        const user = this.getUser();
        return user?.role === 'ADMIN';
    }

    isManager(): boolean {
        const user = this.getUser();
        return user?.role === 'MANAGER';
    }

    private startSessionTimer() {
        this.stopSessionTimer(); // Clear any existing timer

        const token = this.getToken();
        if (!token) return;

        try {
            const decoded: any = jwtDecode(token);
            const exp = decoded.exp;

            if (!exp) return;

            this.ngZone.runOutsideAngular(() => {
                this.sessionTimer = setInterval(() => {
                    const currentTime = Math.floor(Date.now() / 1000);
                    const timeLeft = exp - currentTime;

                    this.ngZone.run(() => {
                        if (timeLeft <= 0) {
                            this.stopSessionTimer();
                            this.logout();
                        } else {
                            const minutes = Math.floor(timeLeft / 60);
                            const seconds = timeLeft % 60;
                            this.timeRemaining$.next(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
                        }
                    });
                }, 1000);
            });
        } catch (error) {
            console.error('Error starting session timer', error);
        }
    }

    private stopSessionTimer() {
        if (this.sessionTimer) {
            clearInterval(this.sessionTimer);
            this.sessionTimer = null;
        }
        this.timeRemaining$.next('');
    }
}


