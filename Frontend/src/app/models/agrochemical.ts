export interface Agrochemical {
  id: number;
  name: string;
  category: string;
  description: string;
  usageInstructions: string;
  price: number;
  stockQuantity: number;
  sellerId: number;
  sellerName: string;
  createdAt: string;
}

export interface AgrochemicalRequest {
  name: string;
  category: string;
  description: string;
  usageInstructions: string;
  price: number;
  stockQuantity: number;
}