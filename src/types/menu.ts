// types/menu.ts

// Menu item uchun type
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string; // kategoriyaning ID si
  image: string;      // backend-dan keladigan rasm URL yoki nomi
  available: boolean;
  createdAt: string;
  updatedAt: string;
}

// Category type
export interface Category {
  id: string;
  name: string;
  displayOrder: number;
  active: boolean;
}

// User type (agar admin panel ishlatsa)
export interface User {
  id: string;
  username: string;
  role: "admin" | "user";
}
