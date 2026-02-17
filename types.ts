
export enum OrderStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SHIPPED = 'SHIPPED'
}

export enum GreenLabel {
  GREEN_LABEL = 'Green Label (ฉลากเขียว)',
  CARBON_FOOTPRINT = 'Carbon Footprint',
  SCG_GREEN_CHOICE = 'SCG Green Choice',
  LEED = 'LEED Certified',
  OTHER = 'Other'
}

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  unit: string;
  basePrice?: number;
  imageUrl: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  isGreen: boolean;
  greenLabel?: GreenLabel;
  imageAttachment?: string; // base64
  requestedAt: string;
  status: OrderStatus;
  userId: string;
  userName: string;
  department: string; // Added department field
  adminComment?: string;
  finalPrice?: number;
}

export type ViewType = 'USER_SHOP' | 'USER_ORDERS' | 'USER_CART' | 'ADMIN_LOGIN' | 'ADMIN_DASHBOARD' | 'ADMIN_REPORTS';
