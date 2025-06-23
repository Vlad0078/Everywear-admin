import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../constants";
import {
  CategoriesResponseBody as CatResBody,
  CategoriesRequestBody as CatReqBody,
  ResponseBody,
  SubcategoriesRequestBody as SubReqBody,
  SubcategoriesResponseBody as SubResBody,
  SizesRequestBody as SizesReqBody,
  SizesResponseBody as SizesResBody,
  ColorsRequestBody as ColorsReqBody,
  ColorsResponseBody as ColorsResBody,
  BrandsRequestBody,
  BrandsResponseBody,
  ListProductsResponseBody,
  ListProductsRequestBody,
  ProductsByIdRequestBody,
  ProductsByIdResponseBody,
} from "../types/api-requests";

//post
const fetchData = async <ReqBody, ResBody extends ResponseBody>(
  endpoint: string,
  body?: ReqBody,
  headers?: object
) => {
  try {
    const response = await axios.post<ResBody, AxiosResponse<ResBody>, ReqBody>(
      backendUrl + endpoint,
      body,
      { headers }
    );
    if (response.data.success) {
      return response.data;
    } else {
      toast.error(response.data.message);
      return false;
    }
  } catch (error) {
    console.error(error);
  }
};

const fetchCategories = async (config?: CatReqBody) => {
  return fetchData<CatReqBody, CatResBody>("/api/category/", config ?? {});
};

const fetchSubcategories = async (config?: SubReqBody) => {
  return fetchData<SubReqBody, SubResBody>("/api/subcategory/", config ?? {});
};
const fetchBrands = async (config?: BrandsRequestBody) => {
  return fetchData<BrandsRequestBody, BrandsResponseBody>("/api/brand/", config ?? {});
};
const fetchSizes = async (config?: SizesReqBody) => {
  return fetchData<SizesReqBody, SizesResBody>("/api/size/", config ?? {});
};
const fetchColors = async (config?: ColorsReqBody) => {
  return fetchData<ColorsReqBody, ColorsResBody>("/api/color/", config ?? {});
};

const addProduct = async (formData: FormData, token: string) => {
  return fetchData<FormData, ResponseBody>("/api/product/add/", formData, {
    token,
  });
};

const fetchProducts = async (filters?: ListProductsRequestBody) => {
  return fetchData<ListProductsRequestBody, ListProductsResponseBody>(
    "/api/product/list/",
    filters
  );
};

const fetchProductById = async (id: string) => {
  return fetchData<ProductsByIdRequestBody, ProductsByIdResponseBody>(
    "/api/product/productsById/",
    { id }
  );
};

const updateProduct = async (formData: FormData, token: string) => {
  return fetchData<FormData, ResponseBody>("/api/product/update/", formData, {
    token,
  });
};

export {
  fetchCategories,
  fetchSubcategories,
  fetchSizes,
  fetchColors,
  fetchBrands,
  addProduct,
  fetchProducts,
  fetchProductById,
  updateProduct,
};
