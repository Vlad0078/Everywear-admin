import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import { OrderData, OrderStatus, ProductData } from "../types/product";
import { useTranslation } from "react-i18next";
import axios, { AxiosResponse } from "axios";
import { OrdersResponseBody, ResponseBody, UpdateStatusRequestBody } from "../types/api-requests";
import { backendUrl } from "../constants";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";
import { currency } from "../App";
import { produce } from "immer";
import { fetchProducts } from "../utils/api";
import i18n from "../i18n";

interface OrdersProps {
  token: string;
}

const Orders: React.FC<OrdersProps> = ({ token }) => {
  const { t } = useTranslation();

  const [orders, setOrders] = useState<OrderData[]>([]);
  const [list, setList] = useState<ProductData[]>([]);

  const listProducts = useCallback(async () => {
    const data = await fetchProducts();
    if (data && data.products) {
      setList(data.products);
    }
  }, []);

  const stringifyDate = (timestamp: number) => {
    const date = new Date(timestamp);

    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    // return `${day} ${t(`month-names.short.${month}`)} ${year}`;
    return `${year}-${month < 9 ? "0" : ""}${month + 1}-${day}`;
  };

  const statusHandler = async (
    event: ChangeEvent<HTMLSelectElement>,
    orderId: string,
    orderIndex: number
  ) => {
    try {
      const newStatus = event.target.value as OrderStatus;

      const response = await axios.post<
        ResponseBody,
        AxiosResponse<ResponseBody>,
        UpdateStatusRequestBody
      >(backendUrl + "/api/order/status", { orderId, status: newStatus }, { headers: { token } });

      if (response.data.success) {
        setOrders((state) =>
          produce(state, (draft) => {
            draft[orderIndex].status = newStatus;
          })
        );
      } else {
        toast.error(t(response.data.message || t("error.unexpected-error")));
      }
    } catch (error) {
      console.error(error);
      if (error instanceof Error) toast.error(error.message);
    }
  };

  const fetchOrders = useCallback(async () => {
    if (!token) {
      return [];
    }

    try {
      const response = await axios.post<OrdersResponseBody>(
        backendUrl + "/api/order/list",
        {},
        { headers: { token } }
      );

      if (response.data.success) {
        setOrders(response.data.orders!);
      } else {
        toast.error(t(response.data.message || t("error.unexpected-error")));
      }
    } catch (error) {
      console.error(error);
      if (error instanceof Error) toast.error(error.message);
    }
  }, [t, token]);

  useEffect(() => {
    fetchOrders();
    listProducts();
  }, [fetchOrders, listProducts]);

  return (
    <div>
      <h3>{t("orders-page.title")}</h3>
      <div>
        {orders.map((order, index) => (
          <div
            key={index}
            className="grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1.5fr_1fr_1fr] gap-3 items-start border-2 border-gray-200 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700"
          >
            <img src={assets.parcel_icon} className="w-12" alt="" />
            <div>
              <div>
                {order.items.map((item, index) => {
                  return (
                    <div key={index} className="py-0.5">
                      <p>({item.article.productId})</p>
                      <p>
                        {/* {i18n.language === "uk" ? product.name_uk : product.name_en} */}
                        {
                          list.find((prod) => prod._id === item.article.productId)?.[
                            i18n.language === "uk" ? "name_uk" : "name_en"
                          ]
                        }{" "}
                        x {item.quantity} <span>{item.article.size}</span>{" "}
                        <span>{item.article.colorCode}</span>
                        {index === order.items.length - 1 ? "" : ", "}
                      </p>
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 mb-2 font-medium">
                {order.address.firstName} {order.address.lastName}
              </p>
              <div>
                <p>{order.address.street},</p>
                <p>
                  {order.address.city}, {order.address.region}, {order.address.zipcode}
                </p>
              </div>
              <p>{order.address.phone}</p>
            </div>
            <div>
              <p className="font-medium">
                {t("orders-page.number-of-items")}: {order.items.length}
              </p>
              <p className="mt-3">
                {t("orders-page.payment-method")}: {order.paymentMethod}
              </p>
              <p>
                {t("orders-page.payment-status")}:{" "}
                {order.payment
                  ? t("orders-page.payment-status-done")
                  : t("orders-page.payment-status-pending")}
              </p>
              <p>
                {t("orders-page.order-date")}: {stringifyDate(order.createdAt)}
              </p>
            </div>
            <p className="text-sm sm:text-base">
              {order.amount} {currency}
            </p>
            <select
              onChange={(e) => statusHandler(e, order._id, index)}
              value={order.status}
              className="pink-select p-2 font-semibold"
            >
              <option value="Order Placed">{t("orders-page.order-status.Order Placed")}</option>
              <option value="Ready to Ship">{t("orders-page.order-status.Ready to Ship")}</option>
              <option value="Shipped">{t("orders-page.order-status.Shipped")}</option>
              <option value="Delivered">{t("orders-page.order-status.Delivered")}</option>
              <option value="Received">{t("orders-page.order-status.Received")}</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
