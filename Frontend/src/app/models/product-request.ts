export type RequestStatus =
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'Completed';

export interface CreateProductRequest {
  agrochemicalId: number;
  quantity: number;
  message: string;
}

export interface FarmerProductRequest {
  id: number;
  agrochemicalId: number;
  agrochemicalName: string;
  productPrice: number;
  sellerName: string;
  quantity: number;
  message: string;
  status: RequestStatus;
  requestedAt: string;
}

export interface SellerProductRequest {
  id: number;
  farmerId: number;
  farmerName: string;
  agrochemicalId: number;
  agrochemicalName: string;
  quantity: number;
  message: string;
  status: RequestStatus;
  requestedAt: string;
}

export interface UpdateRequestStatus {
  status: RequestStatus;
}