import React, { useCallback, useEffect, useState } from "react";
import { ProductData } from "../types/product";
import axios from "axios";
import { currency } from "../App";
import { backendUrl } from "../constants";
import { ListProductsResponseBody } from "../types/api-requests";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import { fetchProducts, fetchSubcategories } from "../utils/api";
import { Subcategory } from "../types/subcategory";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

interface ListProps {
  token: string;
}

const List: React.FC<ListProps> = ({ token }) => {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [list, setList] = useState<ProductData[]>([]);
  const [productIdFilter, setProductIdFilter] = useState<string>("");
  const [filteredList, setFilteredList] = useState<ProductData[]>([]);

  const listProducts = useCallback(async () => {
    const data = await fetchProducts();
    if (data && data.products) {
      setList(data.products);
      setFilteredList(data.products);
    }
  }, []);

  const removeProduct = useCallback(
    async (id: string) => {
      const result = await Swal.fire({
        title: t("list.confirm-delete-title"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#a6a6a6",
        confirmButtonText: t("list.confirm-delete-confirm"),
        cancelButtonText: t("list.confirm-delete-cancel"),
      });

      if (!result.isConfirmed) {
        return;
      }
      try {
        const response = await axios.post<ListProductsResponseBody>(
          backendUrl + "/api/product/remove",
          { id },
          { headers: { token } }
        );
        if (response.data.success) {
          toast.success(t("list.remove-success"));
          await listProducts();
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        console.error(error);
        toast.error(t("list.error"));
      }
    },
    [listProducts, t, token]
  );

  const handleProductIdFilterChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setProductIdFilter(value);
    setFilteredList(
      list.filter((product) => product._id.toLowerCase().includes(value.toLowerCase()))
    );
  };

  const clearProductIdFilter = () => {
    setProductIdFilter("");
    setFilteredList(list);
  };

  useEffect(() => {
    fetchSubcategories().then((data) => {
      if (data && data.subcategories) setSubcategories(data.subcategories);
    });
    listProducts();
  }, [listProducts]);

  return (
    <>
      <p className="mb-2">{t("list.list-title")}</p>
      {/* //? SEARCH BY ID */}
      <div className="my-4">
        <div className="relative w-60">
          <input
            type="text"
            placeholder={t("list.filter-by-id")}
            value={productIdFilter}
            onChange={handleProductIdFilterChange}
            className="border-2 border-gray-200 p-2 pr-8 text-sm text-gray-700 focus:outline-none focus:border-pink-300 w-full"
          />
          {productIdFilter && (
            <button
              onClick={clearProductIdFilter}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {/* //? ------------ LIST TABLE TITLE ------------ */}
        <div className="hidden md:grid grid-cols-[1.2fr_2fr_2fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm">
          <b>{t("list.table-h-image")}</b>
          <b>{t("list.table-h-name")}</b>
          <b>{t("list.table-h-id")}</b>
          <b>{t("list.table-h-subcategory")}</b>
          <b>{t("list.table-h-price")}</b>
          <b className="text-center">{t("list.table-h-action")}</b>
        </div>

        {/* //? ------------ PRODUCT LIST ------------ */}
        {filteredList.length > 0 ? (
          filteredList.map((product, index) => (
            <div
              className="grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1.2fr_2fr_2fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm"
              key={index}
            >
              <img className="w-1/2 aspect-square object-cover" src={product.images[0]} alt="" />
              <p>{i18n.language === "uk" ? product.name_uk : product.name_en}</p>
              <p>{product._id}</p>
              <p>
                {(() => {
                  const subcategory = subcategories.find(
                    (item) => product.subcategoryId === item._id
                  );
                  return i18n.language === "uk" ? subcategory?.name_uk : subcategory?.name_en;
                })()}
              </p>
              <p>
                {product.price} {currency}
              </p>
              <div className="flex justify-center gap-4">
                <div
                  onClick={() => navigate(`/edit/${product._id}`)}
                  className="text-right md:text-center cursor-pointer"
                >
                  <img src={assets.edit_icon} alt="Edit" className="w-5 h-5 inline-block" />
                </div>
                <div
                  onClick={() => removeProduct(product._id || "")}
                  className="text-right md:text-center cursor-pointer"
                >
                  <img src={assets.bin_icon} alt="Remove" className="w-5 h-5 inline-block" />
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-700 text-center py-4">{t("list.no-products-found")}</p>
        )}
      </div>
    </>
  );
};

export default List;
