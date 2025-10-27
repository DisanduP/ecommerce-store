export interface User {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  created_at: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: Omit<User, 'password_hash'>;
    token: string;
  };
  error?: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  stock_quantity: number;
  created_at: string;
}

export interface CartItem {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  created_at: string;
  updated_at: string;
  product?: Product; // For populated cart items
}

export interface CartItemRequest {
  product_id: number;
  quantity: number;
}

export interface CartResponse {
  success: boolean;
  data?: {
    items: CartItem[];
    total_items: number;
    total_value: number;
  };
  error?: string;
}

export interface Order {
  id: number;
  user_id: number;
  total_amount: number;
  status: string;
  shipping_address?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  created_at: string;
  product?: Product;
}

export interface CreateOrderRequest {
  shipping_address?: string;
}

export interface OrderResponse {
  success: boolean;
  data?: {
    order: Order;
    items: OrderItem[];
  };
  error?: string;
}
