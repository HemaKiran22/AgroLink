export interface Crop {
  id: number;
  name: string;
  category: string;
  description: string;
  pricePerKg: number;
  quantityInKg: number;
  location: string;
  farmerId: number;
  farmerName: string;
  createdAt: string;
}

export interface CropRequest {
  name: string;
  category: string;
  description: string;
  pricePerKg: number;
  quantityInKg: number;
  location: string;
}