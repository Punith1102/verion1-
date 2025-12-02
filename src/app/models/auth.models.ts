export interface User {
    userId: number;
    name: string;
    email: string;
    role: 'ADMIN' | 'MANAGER' | 'USER';
}

export interface AuthResponse {
    token: string;
    email: string;
    name: string;
    role: 'ADMIN' | 'MANAGER' | 'USER';
    userId: number;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
}
