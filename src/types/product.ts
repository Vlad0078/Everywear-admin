import { Brand } from "./brand";
import { Category } from "./category";
import { Color } from "./color";
import { Size } from "./size";
import { Subcategory } from "./subcategory";

interface ProductData {
  _id: string;
  name_uk: string;
  name_en: string;
  description_uk: string;
  description_en: string;
  material_uk: string;
  material_en: string;
  price: number;
  images: string[];
  sizesId: string[];
  colorsId: string[];
  subcategoryId: string;
  brandId: string;
  // dateAdded: number;
	recommend: boolean;
	useVton: boolean;
  vtonCategory?: VtonCategory;
  vtonImage?: string;
  inStock: {
    sizeId: string;
    colorId: string;
    // left: number;
  }[];
  sold: number;
}

export enum VtonCategory {
  upper_body = "upper_body",
  lower_body = "lower_body",
  dresses = "dresses",
}

interface ProductFullData extends ProductData {
  categoryId: string;
  category: Category;
  subcategory: Subcategory;
  brand: Brand;
  sizes: Size[];
  colors: Color[];
}

interface CartItem {
  article: {
    productId: string;
    size: string;
    colorCode: string;
  };
  quantity: number;
  price: number;
}

// Cart
// interface CartProductData {
// 	productId: string;
//   article: {
// 		sizeId: string
// 		quantity: number;
//   };
// }

// interface CartDataFlat {
//   _id: string;
//   size: string;
//   quantity: number;
// }

// Order
// interface OrderItem {
//   article: {
//     sizeId: string;
//     colorId: string;
//     quantity: number;
//   };
// }

interface UserAddressInfo {
  firstName: string;
  surName: string;
  lastName: string;
  email: string;
  street: string;
  city: string;
  region: string;
  zipcode: string;
  phone: string;
}

interface OrderData {
  _id: string;
  customerId: string;
  address: UserAddressInfo;
  items: CartItem[];
  amount: number; // вартість
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  deliveryMethod: DeliveryMethod;
  payment: boolean;
}

type OrderStatus = "order-placed" | "ready-to-ship" | "shipped" | "delivered" | "recieved";
type PaymentMethod = "plata" | "stripe" | "cod";
type DeliveryMethod = "novapost" | "novapost-courier";

// interface OrderItemWithData extends OrderItem {
//   amount: number;
//   address: UserAddressInfo;
//   status: OrderStatus;
//   paymentMethod: PaymentMethod;
//   payment: boolean;
//   date: number; // дата формування замовлення
// }

// interface ProductArticle {
//   country: string;
//   manufacturer: string;
//   category: string;
//   subcategory: string;
//   size: string;
// }

export type {
  ProductData,
  ProductFullData,
  CartItem,
  UserAddressInfo,
  OrderData,
  OrderStatus,
  PaymentMethod,
  DeliveryMethod,
};
