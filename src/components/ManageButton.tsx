import React, { MouseEventHandler } from "react";
import { assets } from "../assets/assets";
import { useTranslation } from "react-i18next";
import Popup from "reactjs-popup";

interface ManageButtonProps {}

const ManageButton: React.FC<ManageButtonProps> = () => {
  const { t } = useTranslation();
  const clickHandler: MouseEventHandler = () => {};

  return (
    <Popup
      trigger={
        <button
          type="button"
          className="box-border flex items-center px-3 gap-2 bg-[#ffebf5] cursor-pointer border-2 border-[#c568a5] rounded-full"
        >
          <img src={assets.gear_icon} className="h-4" alt="" />
          <p className="cursor-pointer select-none text-gray-800">
            {t("manage")}
          </p>
        </button>
      }
      position="right center"
      overlayStyle={{
        background: "#00000055",
        padding: "0.25rem 0.5rem",
        gap: "5rem",
      }}
      modal
    >
      <div className="flex flex-col gap-1 bg-red-500 py-1 px-2">
        <div>Popup contentcc here !!</div>
        <div>Popup content here !!</div>
        <div>Popup content here !!</div>
        <Popup
          trigger={
            <button
              type="button"
              className="box-border flex items-center px-3 gap-2 bg-[#ffebf5] cursor-pointer border-2 border-[#c568a5] rounded-full"
            >
              <img src={assets.gear_icon} className="h-4" alt="" />
              <p className="cursor-pointer select-none text-gray-800">
                {t("manage")}
              </p>
            </button>
          }
          position="right center"
          // overlayStyle={{
          //   background: "#00000055",
          //   padding: "0.25rem 0.5rem",
          //   gap: "5rem",
          // }}
          modal
        >
          <div className="flex flex-col gap-1 bg-red-500 py-1 px-2">
            <div>Popup contentcc here !!</div>
            <div>Popup content here !!</div>
            <div>Popup content here !!</div>
            <div>Popup content here !!</div>
          </div>
        </Popup>
      </div>
    </Popup>
  );
};

export default ManageButton;
