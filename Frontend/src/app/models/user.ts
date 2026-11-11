export type UserRole = 'Farmer' | 'Seller';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}