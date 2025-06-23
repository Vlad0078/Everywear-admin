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
  const [orderIdFilter, setOrderIdFilter] = useState<string>("");
  const [filteredOrders, setFilteredOrders] = useState<OrderData[]>([]);

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

  const handleOrderIdFilterChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setOrderIdFilter(value);
    setFilteredOrders(
      orders.filter((order) => order._id.toLowerCase().includes(value.toLowerCase()))
    );
  };

  const clearOrderIdFilter = () => {
    setOrderIdFilter("");
    setFilteredOrders(orders);
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
        setFilteredOrders(response.data.orders!);
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
    console.log("helo");
  }, [fetchOrders, listProducts]);

  return (
    <div>
      <h3>{t("orders-page.title")}</h3>
      <div className="my-4">
        <div className="relative w-60">
          <input
            type="text"
            placeholder={t("orders-page.filter-by-id")}
            value={orderIdFilter}
            onChange={handleOrderIdFilterChange}
            className="border-2 border-gray-200 p-2 pr-8 text-sm text-gray-700 focus:outline-none focus:border-pink-300 w-full"
          />
          {orderIdFilter && (
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
              <svg
                className="w-4 h-4"
                onClick={clearOrderIdFilter}
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
      <div>
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order, index) => (
            <div
              key={index}
              className="grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1.5fr_1fr_1fr] gap-3 items-start border-2 border-gray-200 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700"
            >
              <img src={assets.parcel_icon} className="w-12" alt="" />
              <div>
                <div className="flex flex-col gap-2">
                  {order.items.map((item, index) => {
                    return (
                      <div key={index} className="py-0.5">
                        <p className="text-gray-500">({item.article.productId})</p>
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
                  {order.address.lastName} {order.address.firstName} {order.address.surName}
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
              <div className="h-full flex flex-col justify-between items-end">
                <select
                  onChange={(e) => statusHandler(e, order._id, index)}
                  value={order.status}
                  className="pink-select p-2 font-semibold"
                >
                  <option value="Order Placed">{t("orders-page.order-status.Order Placed")}</option>
                  <option value="Ready to Ship">
                    {t("orders-page.order-status.Ready to Ship")}
                  </option>
                  <option value="Shipped">{t("orders-page.order-status.Shipped")}</option>
                  <option value="Delivered">{t("orders-page.order-status.Delivered")}</option>
                  <option value="Received">{t("orders-page.order-status.Received")}</option>
                  <option value="return-requested">
                    {t("orders-page.order-status.return-requested")}
                  </option>
                  <option value="returned">{t("orders-page.order-status.returned")}</option>
                  <option value="return-rejected">
                    {t("orders-page.order-status.return-rejected")}
                  </option>
                  <option value="cancelled">{t("orders-page.order-status.cancelled")}</option>
                </select>
                <p className="hidden sm:block">
                  <span className="text-gray-500">{t("orders-page.order-id")}:</span> {order._id}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-700 text-center py-4">
            {t("orders-page.no-orders-found")}
          </p>
        )}
      </div>
    </div>
  );
};

export default Orders;
