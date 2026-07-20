export enum PermissionCategory {
  USERS = 'users',
  ROLES = 'roles',
  PERMISSIONS = 'permissions',
  EVENTS = 'events',
  REGISTRATIONS = 'registrations',
  FEEDBACK = 'feedback',
  CSR = 'csr',
  VOLUNTEERS = 'volunteers',
  APPROVALS = 'approvals',
  REPORTS = 'reports',
  ANALYTICS = 'analytics',
  SETTINGS = 'settings',
  AUDIT = 'audit',
}

export class Permission {
  id: number = 0;
  name: string = '';
  description?: string;
  category: PermissionCategory | string = PermissionCategory.USERS;
  isActive: boolean = true;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();

  constructor(data: Partial<Permission> = {}) {
    Object.assign(this, data);
  }

  getDisplayName(): string {
    return this.name.replace(/([._])/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  isInCategory(cat: string): boolean {
    return this.category === cat;
  }
}
