export type UserRole = 'citizen' | 'department' | 'admin';

export type Department =
  | 'Municipal Cleanliness'
  | 'Electrical Department'
  | 'Water Department'
  | 'Roads & Infrastructure'
  | 'Health & Sanitation';

export type GrievanceStatus =
  | 'submitted'
  | 'assigned'
  | 'in_progress'
  | 'resolved'
  | 'closed'
  | 'rejected';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  department?: Department;
  phoneNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Grievance {
  grievanceId: string;
  title: string;
  description: string;
  departments: Department[];
  status: GrievanceStatus;
  priority: Priority;
  location: string;
  imageUrls: string[];
  submittedBy: string;
  submittedByName: string;
  contactPhone: string;
  contactEmail: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  assignedTo: string[];
}

export interface Comment {
  commentId: string;
  grievanceId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  comment: string;
  isStatusUpdate: boolean;
  newStatus?: GrievanceStatus;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string; // The recipient
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
  relatedGrievanceId?: string;
  relatedGrievanceTitle?: string;
}

export const DEPARTMENTS: Department[] = [
  'Municipal Cleanliness',
  'Electrical Department',
  'Water Department',
  'Roads & Infrastructure',
  'Health & Sanitation',
];

export const STATUS_CONFIG: Record<GrievanceStatus, { label: string; color: string }> = {
  submitted: { label: 'Submitted', color: 'status-submitted' },
  assigned: { label: 'Assigned', color: 'status-assigned' },
  in_progress: { label: 'In Progress', color: 'status-in-progress' },
  resolved: { label: 'Resolved', color: 'status-resolved' },
  closed: { label: 'Closed', color: 'status-closed' },
  rejected: { label: 'Rejected', color: 'status-rejected' },
};

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
  low: { label: 'Low', color: 'priority-low' },
  medium: { label: 'Medium', color: 'priority-medium' },
  high: { label: 'High', color: 'priority-high' },
  urgent: { label: 'Urgent', color: 'priority-urgent' },
};
