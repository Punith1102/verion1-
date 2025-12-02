import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../services/project.service';
import { AuthService } from '../../services/auth.service';
import { Project } from '../../models/project.model';

@Component({
    selector: 'app-project-detail',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './project-detail.component.html',
    styleUrl: './project-detail.component.css'
})
export class ProjectDetailComponent implements OnInit {
    project: Project | null = null;
    loading: boolean = true;
    projectId: number = 0;
    isAdmin: boolean = false;
    isManager: boolean = false;
    currentUserEmail: string = '';

    // Edit Project Modal State
    showEditProjectModal: boolean = false;
    editingProject: Partial<Project> = {};

    constructor(
        private route: ActivatedRoute,
        private projectService: ProjectService,
        private authService: AuthService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.isAdmin = this.authService.isAdmin();
        this.isManager = this.authService.isManager();
        const user = this.authService.getUser();
        this.currentUserEmail = user ? user.email : '';

        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            const parsedId = +id;
            if (!isNaN(parsedId)) {
                this.projectId = parsedId;
                this.loadProjectDetails(this.projectId);
            } else {
                console.error('Invalid project ID:', id);
                this.loading = false;
            }
        }
    }

    loadProjectDetails(id: number) {
        this.loading = true;
        this.projectService.getProject(id).subscribe({
            next: (project) => {
                this.project = project;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error loading project details', err);
                alert('Failed to load project details.');
                this.loading = false;
            }
        });
    }

    // Project Actions
    canEditProject(): boolean {
        // Allow Admin, Manager, or Creator to edit
        return this.isAdmin || this.isManager || (this.project?.createdBy?.email === this.currentUserEmail);
    }

    canDeleteProject(): boolean {
        // Allow Admin, Manager, or Creator to delete
        return this.isAdmin || this.isManager || (this.project?.createdBy?.email === this.currentUserEmail);
    }

    deleteProject() {
        if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
            this.projectService.deleteProject(this.projectId).subscribe({
                next: () => {
                    alert('Project deleted successfully');
                    window.location.href = '/projects';
                },
                error: (err) => {
                    console.error('Error deleting project', err);
                    alert('Failed to delete project');
                }
            });
        }
    }

    openEditProjectModal() {
        if (this.project) {
            this.editingProject = { ...this.project };
            this.showEditProjectModal = true;
        }
    }

    closeEditProjectModal() {
        this.showEditProjectModal = false;
        this.editingProject = {};
    }

    saveProjectChanges() {
        if (!this.editingProject.name || !this.editingProject.description) {
            alert('Name and Description are required');
            return;
        }

        this.projectService.updateProject(this.projectId, this.editingProject).subscribe({
            next: (updatedProject) => {
                this.project = updatedProject;
                alert('Project updated successfully');
                this.closeEditProjectModal();
            },
            error: (err) => {
                console.error('Error updating project', err);
                alert('Failed to update project');
            }
        });
    }
}
