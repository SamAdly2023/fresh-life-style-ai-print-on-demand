
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isAdmin: boolean;
}

export interface Design {
  id: string;
  imageUrl: string;
  name: string;
  author: string;
  isAI?: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  baseImageUrl: string;
  category: 'tshirt' | 'hoodie';
}

export interface CartItem {
  id: string;
  productId: string;
  designId?: string;
  customDesignUrl?: string;
  quantity: number;
  size: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  color: string;
}

export interface ShippingAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  email: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'paid' | 'payment_failed';
  createdAt: string;
  shippingAddress?: ShippingAddress;
  stripePaymentIntentId?: string;
}

export enum AppRoute {
  HOME = '/',
  GALLERY = '/gallery',
  CREATE = '/create',
  CHECKOUT = '/checkout',
  DASHBOARD = '/dashboard',
  ADMIN = '/admin'
}
