import { User } from './auth.models';

export interface Project {
    projectId: number;
    projectID?: number; // Handle backend inconsistency
    name: string;
    description: string;
    dueDate: string;
    assignedTo?: User;
    createdBy: User;
}
