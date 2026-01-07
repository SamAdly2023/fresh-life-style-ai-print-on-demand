
import { Product, User, Order, CartItem, Design } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const api = {
  async getProducts(): Promise<Product[]> {
    const res = await fetch(`${API_URL}/products`);
    if (!res.ok) {
        const err = await res.text();
        console.error('getProducts failed', err);
        throw new Error('Failed to fetch products');
    }
    return res.json();
  },

  async getDesigns(): Promise<Design[]> {
    const res = await fetch(`${API_URL}/designs`);
    if (!res.ok) {
        const err = await res.text();
        console.error('getDesigns failed', err);
        throw new Error('Failed to fetch designs');
    }
    const data = await res.json();
    return data.map((d: any) => ({
      id: d.id,
      imageUrl: d.image_url,
      name: d.name,
      author: d.author,
      isAI: d.is_ai
    }));
  },

  async createDesign(design: Omit<Design, 'id'>): Promise<Design> {
    const res = await fetch(`${API_URL}/designs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: design.name,
        author: design.author,
        image_url: design.imageUrl,
        is_ai: design.isAI
      }),
    });
    if (!res.ok) throw new Error('Failed to create design');
    const d = await res.json();
    return {
      id: d.id,
      imageUrl: d.image_url,
      name: d.name,
      author: d.author,
      isAI: d.is_ai
    };
  },

  async syncUser(user: User): Promise<User> {
    console.log(`[API] Syncing user to: ${API_URL}/users`);
    const res = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar,
        is_admin: user.isAdmin
      }),
    });
    if (!res.ok) {
        const errorText = await res.text();
        console.error(`[API] Sync User Failed: ${res.status} ${errorText}`);
        throw new Error(`Failed to sync user: ${res.status} ${errorText}`);
    }
    const data = await res.json();
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      avatar: data.avatar_url,
      isAdmin: data.is_admin
    };
  },

  async createOrder(order: Order): Promise<void> {
    await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
  },

  async getUserOrders(userId: string): Promise<Order[]> {
    const res = await fetch(`${API_URL}/orders/${userId}`);
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  async getAdminOrders(): Promise<Order[]> {
    const res = await fetch(`${API_URL}/admin/orders`);
    if (!res.ok) throw new Error('Failed to fetch admin orders');
    return res.json();
  },

  async getAdminUsers(): Promise<User[]> {
    const res = await fetch(`${API_URL}/admin/users`);
    if (!res.ok) throw new Error('Failed to fetch admin users');
    return res.json();
  },

  async createPaymentIntent(amount: number): Promise<{ clientSecret: string }> {
    const res = await fetch(`${API_URL}/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
    });
    if (!res.ok) throw new Error('Failed to create payment intent');
    return res.json();
  }
};
