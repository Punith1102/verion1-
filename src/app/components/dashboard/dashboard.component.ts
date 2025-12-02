import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { ProjectService } from '../../services/project.service';
import { AuthService } from '../../services/auth.service';
import { Project } from '../../models/project.model';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule], // Add FormsModule
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
    projects: Project[] = [];
    loading: boolean = true;
    isAdmin: boolean = false;
    userName: string = '';

    // Modal State
    showEditModal: boolean = false;
    editingProject: Partial<Project> = {};

    constructor(
        private projectService: ProjectService,
        private authService: AuthService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.isAdmin = this.authService.isAdmin();
        const user = this.authService.getUser();
        this.userName = user ? user.name : 'User';
        this.loadProjects();
    }

    loadProjects() {
        this.loading = true;
        this.projectService.getProjects().subscribe({
            next: (data) => {
                this.projects = data;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error loading projects', err);
                this.loading = false;
            }
        });
    }

    editProject(project: Project) {
        this.editingProject = { ...project }; // Create a copy
        this.showEditModal = true;
    }

    closeEditModal() {
        this.showEditModal = false;
        this.editingProject = {};
    }

    saveProjectChanges() {
        if (!this.editingProject.name || !this.editingProject.description) {
            alert('Please fill in all fields');
            return;
        }

        const projectId = this.editingProject.projectId || this.editingProject.projectID;
        if (!projectId) return;

        this.projectService.updateProject(projectId, this.editingProject).subscribe({
            next: (updatedProject) => {
                // Update local list
                const index = this.projects.findIndex(p => (p.projectId || p.projectID) === projectId);
                if (index !== -1) {
                    this.projects[index] = { ...this.projects[index], ...updatedProject };
                }
                this.closeEditModal();
                alert('Project updated successfully');
            },
            error: (err) => {
                console.error('Error updating project', err);
                alert('Failed to update project');
            }
        });
    }

    deleteProject(projectId: number | undefined) {
        if (!projectId) {
            console.error('Error: Project ID is missing');
            return;
        }
        if (confirm('Are you sure you want to delete this project? All associated tasks will also be deleted.')) {
            this.projectService.deleteProject(projectId).subscribe({
                next: () => {
                    this.projects = this.projects.filter(p => (p.projectId || p.projectID) !== projectId);
                    alert('Project deleted successfully');
                },
                error: (err) => {
                    console.error('Error deleting project', err);
                    alert('Failed to delete project. Please try again.');
                }
            });
        }
    }
}
