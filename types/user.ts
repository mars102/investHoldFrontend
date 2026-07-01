// types/user.ts
export interface Role {
  id: number;
  value: "USER" | "ADMIN" | "MODERATOR";
  description: string;
  createdAt: string;
  updatedAt: string;
  UserRoles?: {
    id: number;
    roleId: number;
    userId: number;
  };
}

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
  emailVerified: boolean;
  preferredCurrency: string;
  language: string;
  timezone: string;
  twoFactorEnabled: boolean;
  lastLoginAt: string | null;
  banned: boolean;
  banReason: string | null;
  notificationSettings: {
    email: boolean;
    priceAlerts: boolean;
  };
  bio: string | null;
  createdAt: string;
  updatedAt: string;
  roles: Role[];
  posts: any[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UserListFilters {
  banned?: boolean;
  search?: string;
  role?: "USER" | "ADMIN" | "MODERATOR";
  // добавь остальные поля фильтрации, которые реально принимает твой /users эндпоинт
}

export interface UsersApiResponse {
  data?: User[];
  pagination?: Pagination;
}
