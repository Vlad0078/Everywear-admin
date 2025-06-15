import { CartItem } from "./product";

export enum UserRole {
  guest = "guest",
  customer = "customer",
  manager = "manager",
  admin = "admin",
  deleted = "deleted",
}

export interface UserPublicInfo {
  _id: string;
  firstName: string;
  lastName?: string;
  patronymic?: string;
  email: string;
  phone?: string;
  profilePicture?: string;
  role: UserRole;
}

export interface User extends UserPublicInfo {
  password: string;
  cartData: CartItem[];
}
