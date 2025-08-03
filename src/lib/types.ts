import { UserRole, UserStatus, OrderStatus } from '@prisma/client'

export interface User {
  id: string
  email: string
  name: string
  phone?: string
  role: UserRole
  status: UserStatus
  universityId?: string
  createdAt: Date
  updatedAt: Date
}

export interface University {
  id: string
  name: string
  location?: string
  description?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface MenuItem {
  id: string
  name: string
  description?: string
  image?: string
  category?: string
  isAvailable: boolean
  variants: MenuItemVariant[]
}

export interface MenuItemVariant {
  id: string
  name: string
  price: number
  isDefault: boolean
}

export interface CartItem {
  id: string
  quantity: number
  menuItem: MenuItem
  variant: MenuItemVariant
}

export interface Order {
  id: string
  orderNumber: string
  totalAmount: number
  status: OrderStatus
  notes?: string
  items: OrderItem[]
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  id: string
  quantity: number
  price: number
  menuItem: MenuItem
  variant: MenuItemVariant
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Form types
export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  name: string
  email: string
  password: string
  phone?: string
  universityId: string
}

export interface UniversityForm {
  name: string
  location?: string
  description?: string
}

export interface MenuItemForm {
  name: string
  description?: string
  category?: string
  variants: {
    name: string
    price: number
    isDefault: boolean
  }[]
}