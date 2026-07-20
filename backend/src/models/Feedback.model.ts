export enum FeedbackStatus {
  PENDING = 'pending',
  SUBMITTED = 'submitted',
  ARCHIVED = 'archived',
}

export class Feedback {
  id: number = 0;
  eventId: number = 0;
  userId: number = 0;
  rating: number = 0;
  title?: string;
  content: string = '';
  status: FeedbackStatus = FeedbackStatus.PENDING;
  isAnonymous: boolean = false;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();
  deletedAt?: Date;

  constructor(data: Partial<Feedback> = {}) {
    Object.assign(this, data);
  }

  isValid(): boolean {
    return this.rating >= 1 && this.rating <= 5 && this.content.trim().length > 0;
  }
}

export class Certificate {
  id: number = 0;
  eventId: number = 0;
  userId: number = 0;
  title: string = '';
  description?: string;
  templateUrl?: string;
  certificateUrl?: string;
  issuedDate: Date = new Date();
  verificationCode: string = '';
  isVerified: boolean = false;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();

  constructor(data: Partial<Certificate> = {}) {
    Object.assign(this, data);
  }

  canBeIssued(): boolean {
    return this.eventId > 0 && this.userId > 0 && this.title.length > 0;
  }
}

export interface FeedbackAggregate {
  eventId: number;
  totalResponses: number;
  averageRating: number;
  ratingDistribution: Record<number, number>;
  sentimentAnalysis?: {
    positive: number;
    neutral: number;
    negative: number;
  };
}
