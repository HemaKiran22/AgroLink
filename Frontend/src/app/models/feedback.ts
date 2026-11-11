export interface CreateFeedback {
  rating: number;
  comment: string;
}

export interface Feedback {
  id: number;
  userId?: number;
  userName?: string;
  userRole?: string;
  rating: number;
  comment: string;
  createdAt: string;
}