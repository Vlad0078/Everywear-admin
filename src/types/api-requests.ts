import { Request } from "express";
import { IncomingHttpHeaders } from "http";
import { CartItem, OrderData, ProductData, ProductFullData } from "./product";
import { UserPublicInfo, UserRole } from "./user";
import { Category } from "./category";
import { Brand } from "./brand";
import { Subcategory } from "./subcategory";
import { Size, SizeTable } from "./size";
import { Color } from "./color";

interface CustomRequest extends Request {
  headers: IncomingHttpHeaders & {
    token?: string; // security
  };
}

interface ResponseBody {
  success: boolean;
  message?: string;
  token?: string;
  role?: string;
  [key: string]: unknown;
}

// user
interface LoginRequestBody {
  email: string;
  password: string;
}

interface LoginResponseBody extends ResponseBody {
  userId: string;
}

interface RegisterRequestBody extends LoginRequestBody {
  name: string;
}

interface RegisterResponseBody extends LoginResponseBody {}

interface UpdateProfileRequestBody {
  firstName?: string;
  lastName?: string;
  patronymic?: string;
  phone?: string;
  profilePicture?: File;
}

interface ChangePasswordRequestBody {
  currentPassword: string;
  newPassword: string;
}

interface RequestEmailChangeBody {
  newEmail: string;
}

interface ConfirmEmailChangeBody {
  token: string;
}

interface DeleteProfileRequestBody {
  password: string;
}

interface UserRequestBody {
  userId: string;
}

interface UserResponseBody extends ResponseBody {
  userInfo?: UserPublicInfo;
}

//? product
// interface AddProductRequestBody {
//   name_uk: string;
//   name_en: string;
//   description_uk: string;
//   description_en: string;
//   material_uk: string;
//   material_en: string;
//   price: number;
//   sizesId: string[];
//   colorsId: string[];
//   subcategoryId: string;
//   // inStock: {
//   //   sizeId: string;
//   //   colorId: string;
//   //   left: number;
//   // }[];
//   //: string,
//   recommend: boolean;
// }

interface ProductsByIdRequestBody {
  id: string | string[];
}

interface ProductsByIdResponseBody extends ResponseBody {
  products?: ProductFullData[];
}

interface ListProductsRequestBody {
  page?: number;
  resultsOnPage?: number;
  name_uk?: string;
  name_en?: string;
  min_price?: number;
  max_price?: number;
  brandsId?: string[];
  subcategoriesId?: string[];
  sizesId?: string[];
  colorsId?: string[];
  sortField?: string;
  sortDesc?: boolean;
  recommend?: boolean;
  target?: "women" | "men" | "kids";
}

interface ListProductsResponseBody extends ResponseBody {
  products?: ProductData[];
  count?: number;
  availBrands?: Brand[];
  availSizes?: Size[];
  availColors?: Color[];
}

// cart
interface AddToCartRequestBody {
  productId: string;
  size: string;
  colorCode: string;
}

interface UpdateCartRequestBody extends AddToCartRequestBody {
  quantity: number;
}

interface GetCartResponseBody extends ResponseBody {
  cartData?: CartItem[];
}

// orders
interface AllOrdersRequestBody {}
interface UpdateStatusRequestBody {
  orderId: string;
  status: string;
}
interface confirmOrderRecievedRequestBody {
  orderId: string;
  status: string;
}

interface PlaceOrderRequestBody {
  order: OrderData;
}

interface VerifyStripeRequestBody {
  orderId: string;
  success: string;
}

interface VerifyPlataRequestBody {
  invoiceId: string;
  orderId: string;
  success: string;
}

interface OrdersResponseBody extends ResponseBody {
  orders?: OrderData[];
}

// payment
interface StripeResponseBody extends ResponseBody {
  session_url?: string | null;
}

interface PlataResponseBody extends StripeResponseBody {}

// managers
interface ManagersRequestBody {
  page?: number;
  resultsOnPage?: number;
  email?: string;
  name?: string;
  role?: string;
  sortField?: string;
  sortDesc?: boolean;
}
interface ManagersResponseBody extends ResponseBody {
  managers?: UserPublicInfo[];
  count?: number;
}

// change role
interface ChangeRoleRequestBody {
  targetRole: UserRole;
  targetId: string;
}

//? categories
interface CategoriesRequestBody {
  page?: number;
  resultsOnPage?: number;
  name_uk?: string;
  name_en?: string;
  target?: "" | "men" | "women" | "kids";
  sortField?: string;
  sortDesc?: boolean;
}
interface CategoriesResponseBody extends ResponseBody {
  categories?: Category[];
  count?: number;
}
interface AddCategoryRequestBody {
  category: Category;
}
interface UpdateCategoryRequestBody {
  id: string;
  newName_uk: string;
  newName_en: string;
  newTarget: "" | "men" | "women" | "kids";
}
interface RemoveCategoryRequestBody {
  id: string;
}

//? subcategories
interface SubcategoriesRequestBody {
  page?: number;
  resultsOnPage?: number;
  name_uk?: string;
  name_en?: string;
  categoryId?: string;
  sortField?: string;
  sortDesc?: boolean;
}
interface SubcategoriesResponseBody extends ResponseBody {
  subcategories?: Subcategory[];
  count?: number;
}
interface AddSubcategoryRequestBody {
  subcategory: Subcategory;
}
interface UpdateSubcategoryRequestBody {
  id: string;
  newName_uk: string;
  newName_en: string;
  newCategoryId: string;
}
interface RemoveSubcategoryRequestBody {
  id: string;
}

//? brands
interface BrandsRequestBody {
  page?: number;
  resultsOnPage?: number;
  name?: string;
  country?: string;
  sortField?: string;
  sortDesc?: boolean;
}
interface BrandsResponseBody extends ResponseBody {
  brands?: Brand[];
  count?: number;
}
interface AddBrandRequestBody {
  brand: Brand;
}
interface UpdateBrandRequestBody {
  id: string;
  newName: string;
  newCountry: string;
}
interface RemoveBrandRequestBody {
  id: string;
}

//? sizes
interface SizesRequestBody {
  page?: number;
  resultsOnPage?: number;
  size?: string;
  categoryId?: string;
  sortField?: string;
  sortDesc?: boolean;
}
interface SizesResponseBody extends ResponseBody {
  sizes?: Size[];
  count?: number;
}
interface SizeTablesResponseBody extends ResponseBody {
  sizeTables?: SizeTable[];
}
interface AddSizeRequestBody {
  size: Size;
}
interface UpdateSizeRequestBody {
  id: string;
  newSize: string;
  newCategoryId?: string;
}
interface RemoveSizeRequestBody {
  id: string;
}

//? colors
interface ColorsRequestBody {
  page?: number;
  resultsOnPage?: number;
  code?: string;
  name_uk?: string;
  name_en?: string;
  sortField?: string;
  sortDesc?: boolean;
}
interface ColorsResponseBody extends ResponseBody {
  colors?: Color[];
  count?: number;
}
interface AddColorRequestBody {
  color: Color;
}
interface UpdateColorRequestBody {
  id: string;
  newName_uk: string;
  newName_en: string;
  newHex: string;
}
interface RemoveColorRequestBody {
  id: string;
}

export type {
  CustomRequest,
  ResponseBody,
  LoginRequestBody,
  RegisterRequestBody,
  ProductsByIdRequestBody,
  ProductsByIdResponseBody,
  ListProductsRequestBody,
  ListProductsResponseBody,
  AddToCartRequestBody,
  UpdateCartRequestBody,
  GetCartResponseBody,
  AllOrdersRequestBody,
  UpdateStatusRequestBody,
  confirmOrderRecievedRequestBody,
  PlaceOrderRequestBody,
  VerifyStripeRequestBody,
  VerifyPlataRequestBody,
  OrdersResponseBody,
  StripeResponseBody,
  PlataResponseBody,
  ManagersRequestBody,
  ManagersResponseBody,
  ChangeRoleRequestBody,
  // ? user
  LoginResponseBody,
  RegisterResponseBody,
  UpdateProfileRequestBody,
  ChangePasswordRequestBody,
  RequestEmailChangeBody,
  ConfirmEmailChangeBody,
  DeleteProfileRequestBody,
  UserRequestBody,
  UserResponseBody,
  // ? categories
  CategoriesRequestBody,
  CategoriesResponseBody,
  AddCategoryRequestBody,
  UpdateCategoryRequestBody,
  RemoveCategoryRequestBody,
  // subcategories
  SubcategoriesRequestBody,
  SubcategoriesResponseBody,
  AddSubcategoryRequestBody,
  UpdateSubcategoryRequestBody,
  RemoveSubcategoryRequestBody,
  // brands
  BrandsRequestBody,
  BrandsResponseBody,
  AddBrandRequestBody,
  UpdateBrandRequestBody,
  RemoveBrandRequestBody,
  // sizes
  SizesRequestBody,
  SizesResponseBody,
  SizeTablesResponseBody,
  AddSizeRequestBody,
  UpdateSizeRequestBody,
  RemoveSizeRequestBody,
  // colors
  ColorsRequestBody,
  ColorsResponseBody,
  AddColorRequestBody,
  UpdateColorRequestBody,
  RemoveColorRequestBody,
};
