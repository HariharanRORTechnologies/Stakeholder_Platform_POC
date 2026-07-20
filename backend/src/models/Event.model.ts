export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ARCHIVED = 'archived',
}

export enum EventType {
  CORPORATE = 'corporate',
  SOCIAL = 'social',
  TRAINING = 'training',
  CONFERENCE = 'conference',
  WORKSHOP = 'workshop',
  SEMINAR = 'seminar',
  NETWORKING = 'networking',
  VOLUNTEER = 'volunteer',
}

export class Event {
  id: number = 0;
  title: string = '';
  description?: string;
  eventType: EventType | string = EventType.CORPORATE;
  status: EventStatus = EventStatus.DRAFT;
  startDate: Date = new Date();
  endDate: Date = new Date();
  location?: string;
  maxCapacity: number = 0;
  registrationDeadline?: Date;
  organizerId: number = 0;
  departmentId?: number;
  categoryId?: number;
  budget?: number;
  imageUrl?: string;
  createdBy: number = 0;
  approvedBy?: number;
  isPublished: boolean = false;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();
  deletedAt?: Date;

  constructor(data: Partial<Event> = {}) {
    Object.assign(this, data);
  }

  isActive(): boolean {
    return this.status === EventStatus.PUBLISHED || this.status === EventStatus.ONGOING;
  }

  isRegistrationOpen(): boolean {
    if (!this.registrationDeadline) return this.isActive();
    return this.isActive() && new Date() <= this.registrationDeadline;
  }

  hasCapacityAvailable(currentRegistrations: number): boolean {
    return currentRegistrations < this.maxCapacity;
  }

  canBeModified(): boolean {
    return this.status === EventStatus.DRAFT;
  }
}
