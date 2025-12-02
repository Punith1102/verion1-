import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
    showUserMenu = false;
    remainingTime: string = '';

    constructor(public authService: AuthService, private router: Router) { }

    ngOnInit() {
        this.authService.timeRemaining$.subscribe(time => {
            this.remainingTime = time;
        });
    }

    toggleUserMenu() {
        this.showUserMenu = !this.showUserMenu;
    }

    getUserName(): string {
        const user = this.authService.getUser();
        return user?.name || 'User';
    }

    getUserInitials(): string {
        const name = this.getUserName();
        return name.charAt(0).toUpperCase();
    }

    logout() {
        this.showUserMenu = false;
        this.authService.logout();
    }
}
