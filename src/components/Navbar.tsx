import React from "react";
import { assets } from "../assets/assets";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";

interface NavbarProps {
  setToken: React.Dispatch<React.SetStateAction<string>>;
  setRole: React.Dispatch<React.SetStateAction<string>>;
}

const Navbar: React.FC<NavbarProps> = ({ setToken, setRole }) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center py-2 px-[4%] flex-wrap gap-y-3 w-full">
      <img className="w-52 pt-3 pb-1" src={assets.logo} alt="" />
      <div className="flex-1 flex items-center gap-x-3 sm:gap-x-6">
        <div className="flex-1"></div>
        {/* //? ------------ LANGUAGE DROPDOWN ------------ */}
        <div className="group relative">
          <div>
            <img src={assets.globe_icon} className="w-6" alt="" />
            <div className="absolute left-[-0.5rem] bottom-[-0.3rem] text-center w-[1.35rem] leading-[1.35rem] bg-gray-100 text-black aspect-square border-gray-200 rounded-full text-xs font-semibold">
              {i18n.language.toUpperCase()}
            </div>
          </div>
          <div className="group-hover:block hidden absolute dropdown-menu right-0 pt-4">
            <div className="flex flex-col gap-2 w-36 py-3 px-5 bg-slate-100 text-gray-500 rounded">
              <p
                onClick={() => i18n.changeLanguage("uk")}
                className={`cursor-pointer hover:text-black ${
                  i18n.language === "uk" ? "font-semibold text-gray-700" : ""
                }`}
              >
                {t("lang.uk")}
              </p>
              <p
                onClick={() => i18n.changeLanguage("en")}
                className={`cursor-pointer hover:text-black ${
                  i18n.language === "en" ? "font-semibold text-gray-700" : ""
                }`}
              >
                {t("lang.en")}
              </p>
            </div>
          </div>
        </div>

        {/* //? LOGIN BUTTON */}
        <button
          onClick={() => {
            setToken("");
            setRole("");
          }}
          className="bg-gray-600 text-white px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:text-sm"
        >
          {t("navbar.logut")}
        </button>
      </div>
    </div>
  );
};

export default Navbar;
