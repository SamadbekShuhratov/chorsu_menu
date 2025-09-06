// src/services/ApiService.ts
import type { MenuItem, Category } from '../types/menu';

class ApiService {
  private static baseUrl = 'http://localhost:5000/api';

  // ================= MENU ITEMS ==========  static async getMenuItems(): Promise<MenuItem[]> {
    const res = await fetch(`${this.baseUrl}/menu-items`);
    if (!res.ok) throw new Error('❌ Failed to fetch menu items');
    return res.json();
  }

  static async createMenuItem(item: {
    name: string;
    price: number;
    categoryId: string;
    description: string;
    available: boolean;
    image?: File | string | null;
  }): Promise<MenuItem> {
    const formData = new FormData();

    // 🔹 Majburiy maydonlarni xavfsiz yuborish
    formData.append('name', item.name?.trim() || '');
    formData.append('description', item.description?.trim() || '');
    formData.append('price', String(item.price));
    formData.append('categoryId', item.categoryId || '');
    formData.append('available', String(item.available));

    // 🔹 Fayl yoki URL
    if (item.image instanceof File) {
      formData.append('image', item.image);
    } else if (typeof item.image === 'string' && item.image.startsWith('http')) {
      formData.append('image', item.image); // backend linkni qabul qilishi kerak
    }

    const res = await fetch(`${this.baseUrl}/menu-items`, { method: 'POST', body: formData });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`❌ Failed to create menu item: ${res.status} - ${errorText}`);
    }

    return res.json();
  }

  static async updateMenuItem(id: string, item: Partial<MenuItem>): Promise<MenuItem> {
    const res = await fetch(`${this.baseUrl}/menu-items/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`❌ Failed to update menu item: ${res.status} - ${errorText}`);
    }
    return res.json();
  }

  static async deleteMenuItem(id: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/menu-items/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('❌ Failed to delete menu item');
  }

  // ================= CATEGORIES ==========  static async getCategories(): Promise<Category[]> {
    const res = await fetch(`${this.baseUrl}/categories`);
    if (!res.ok) throw new Error('❌ Failed to fetch categories');
    return res.json();
  }

  static async createCategory(category: Omit<Category, 'id'>): Promise<Category> {
    const res = await fetch(`${this.baseUrl}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(category),
    });
    if (!res.ok) throw new Error('❌ Failed to create category');
    return res.json();
  }

  static async updateCategory(id: string, category: Omit<Category, 'id'>): Promise<Category> {
    const res = await fetch(`${this.baseUrl}/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(category),
    });
    if (!res.ok) throw new Error('❌ Failed to update category');
    return res.json();
  }

  static async deleteCategory(id: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/categories/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('❌ Failed to delete category');
  }

  // ================= AUTH ==========  static async login(username: string, password: string): Promise<{ token: string; user: any }> {
    const res = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`❌ Login failed: ${res.status} - ${errorText}`);
    }

    return res.json();
  }
}

export default ApiService;
