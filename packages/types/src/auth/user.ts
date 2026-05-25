export enum UserRole {
  OWNER = 'OWNER',
  MANAGER = 'MANAGER',
  STYLIST = 'STYLIST',
  STAFF = 'STAFF'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile extends User {
  bio?: string;
  specialties?: string[];
}
