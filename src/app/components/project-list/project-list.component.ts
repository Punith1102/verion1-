import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/auth.models';

@Component({
    selector: 'app-project-list',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './project-list.component.html',
    styleUrl: './project-list.component.css'
})
export class ProjectListComponent implements OnInit {
    users: User[] = [];
    createProjectForm: FormGroup;
    isLoading: boolean = false;
    isAdmin: boolean = false;

    constructor(
        private projectService: ProjectService,
        private userService: UserService,
        private authService: AuthService,
        private fb: FormBuilder,
        private router: Router
    ) {
        this.createProjectForm = this.fb.group({
            name: ['', Validators.required],
            description: ['', Validators.required]
        });
    }

    ngOnInit(): void {
        this.isAdmin = this.authService.isAdmin();
        this.loadUsers();
    }

    loadUsers() {
        this.userService.getAllUsers().subscribe({
            next: (data) => {
                const currentUser = this.authService.getUser();
                this.users = data.filter(u => u.email !== currentUser?.email);
            },
            error: (err) => {
                console.error('Error loading users', err);
            }
        });
    }

    onSubmit() {
        if (this.createProjectForm.valid) {
            this.projectService.createProject(this.createProjectForm.value).subscribe({
                next: (newProject) => {
                    alert('Project created successfully!');
                    this.router.navigate(['/dashboard']);
                },
                error: (err) => {
                    console.error('Error creating project', err);
                    alert('Failed to create project');
                }
            });
        }
    }
}
