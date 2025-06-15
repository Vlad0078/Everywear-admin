import React from "react";
import PopupArrowIcon from "./icons/PopupArrowIcon";
import { useTranslation } from "react-i18next";

interface PagesProps {
  page: number;
  pages: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}

const Pages: React.FC<PagesProps> = ({ page, pages, setPage }) => {
  const { t } = useTranslation();

  return (
    pages > 1 && (
      <div className="flex justify-center items-center text-base gap-3 select-none">
        <PopupArrowIcon
          onClick={() => setPage((state) => (state > 1 ? state - 1 : 1))}
          height="1.75rem"
          width="1.75rem"
          fill="#4b5563"
          transform="rotate(90)"
          className="cursor-pointer hover:fill-black"
        />
        <p className="select-text">
          {t("manager-list.page")} {page} {t("manager-list.of-pages")} {pages}
        </p>
        <PopupArrowIcon
          onClick={() => setPage((state) => (state < pages ? state + 1 : pages))}
          height="1.75rem"
          width="1.75rem"
          fill="#4b5563"
          transform="rotate(270)"
          className="cursor-pointer hover:fill-black"
        />
      </div>
    )
  );
};

export default Pages;
