import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { User } from '../../models/auth.models';

@Component({
    selector: 'app-admin-panel',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './admin-panel.component.html',
    styleUrl: './admin-panel.component.css'
})
export class AdminPanelComponent implements OnInit {
    users: User[] = [];
    loading: boolean = true;

    constructor(private http: HttpClient) { }

    ngOnInit(): void {
        this.loadUsers();
    }

    loadUsers() {
        this.loading = true;
        // Assuming backend endpoint for getting all users
        this.http.get<User[]>('http://localhost:8080/api/admin/users').subscribe({
            next: (data) => {
                this.users = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading users', err);
                this.loading = false;
            }
        });
    }
}
