export class Role {
  id: number = 0;
  name: string = '';
  description?: string;
  level: number = 0;
  isSystem: boolean = false;
  isActive: boolean = true;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();

  constructor(data: Partial<Role> = {}) {
    Object.assign(this, data);
  }

  canManageRole(targetRole: Role): boolean {
    return this.level < targetRole.level;
  }

  isHigherLevel(otherLevel: number): boolean {
    return this.level < otherLevel;
  }

  isLowerLevel(otherLevel: number): boolean {
    return this.level > otherLevel;
  }

  canBeModified(): boolean {
    return !this.isSystem;
  }

  canBeDeleted(): boolean {
    return !this.isSystem;
  }
}
