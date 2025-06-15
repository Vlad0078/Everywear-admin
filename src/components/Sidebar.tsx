import React from "react";
import styles from "./Sidebar.module.scss";
import { NavLink } from "react-router-dom";
import { assets } from "../assets/assets";
import { useTranslation } from "react-i18next";
import { UserRole } from "../types/user";

interface SidebarProps {
  role: UserRole | string;
}

const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const { t } = useTranslation();

  return (
    <div className="w-[18%] border-r-2 h-full overflow-x-hidden">
      <div className="flex flex-col gap-4 pt-6 pl-[20%] text-base">
        <NavLink to={"/add"} className={styles.NavLink}>
          <img className="w-5 h-5" src={assets.add_icon} alt="" />
          <p className="hidden md:block">{t("sidebar.add-items")}</p>
        </NavLink>

        <NavLink to={"/list"} className={styles.NavLink}>
          <img className="w-5 h-5" src={assets.t_short_icon} alt="" />
          <p className="hidden md:block">{t("sidebar.list-items")}</p>
        </NavLink>

        <NavLink to={"/orders"} className={styles.NavLink}>
          <img className="w-5 h-5" src={assets.order_icon} alt="" />
          <p className="hidden md:block">{t("sidebar.orders")}</p>
        </NavLink>

        {/* //? ADMIN FEATURES */}
        {role === UserRole.admin ? (
          <>
            <p className="hidden md:block w-full text-end border-[#d1d5db] border-b text-lg pr-2 pt-2 text-gray-600">
              {t("sidebar.admin-options")}
            </p>
            <NavLink to={"/categories"} className={styles.NavLink}>
              {/* <img className="w-5 h-5" src={assets.order_icon} alt="" /> */}
              <p className="hidden md:block">{t("sidebar.categories")}</p>
            </NavLink>
            <NavLink to={"/subcategories"} className={styles.NavLink}>
              {/* <img className="w-5 h-5" src={assets.order_icon} alt="" /> */}
              <p className="hidden md:block">{t("sidebar.subcategories")}</p>
            </NavLink>
            <NavLink to={"/sizes"} className={styles.NavLink}>
              {/* <img className="w-5 h-5 font-bold" src={assets.order_icon} alt="" /> */}
              <p className="hidden md:block">{t("sidebar.sizes")}</p>
            </NavLink>
            <NavLink to={"/colors"} className={styles.NavLink}>
              {/* <img className="w-5 h-5" src={assets.order_icon} alt="" /> */}
              <p className="hidden md:block">{t("sidebar.colors")}</p>
            </NavLink>
            <NavLink to={"/brands"} className={styles.NavLink}>
              {/* <img className="w-5 h-5" src={assets.order_icon} alt="" /> */}
              <p className="hidden md:block">{t("sidebar.brands")}</p>
            </NavLink>
            <NavLink to={"/managers"} className={styles.NavLink}>
              {/* <img className="w-5 h-5" src={assets.order_icon} alt="" /> */}
              <p className="hidden md:block">{t("sidebar.managers")}</p>
            </NavLink>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default Sidebar;
