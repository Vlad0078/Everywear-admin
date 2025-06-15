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

interface ListProps {
  token: string;
}

const List: React.FC<ListProps> = ({ token }) => {
  const { t } = useTranslation();

  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [list, setList] = useState<ProductData[]>([]);

  const listProducts = useCallback(async () => {
    const data = await fetchProducts();
    if (data && data.products) {
      setList(data.products);
    }
  }, []);

  const removeProduct = useCallback(
    async (id: string) => {
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

  useEffect(() => {
    fetchSubcategories().then((data) => {
      if (data && data.subcategories) setSubcategories(data.subcategories);
    });
    listProducts();
  }, [listProducts]);

  return (
    <>
      <p className="mb-2">{t("list.list-title")}</p>
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
        {list.map((product, index) => (
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
            <p
              onClick={() => removeProduct(product._id || "")}
              className="text-right md:text-center cursor-pointer text-lg"
            >
              X
            </p>
          </div>
        ))}
      </div>
    </>
  );
};

export default List;
