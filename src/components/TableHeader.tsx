import React, { PropsWithChildren, ReactNode } from "react";
import { assets } from "../assets/assets";

interface TableHeaderProps extends PropsWithChildren {
  children: ReactNode;
  fieldName: string;
  sortField: string;
  sortDesc: boolean;
  handleSort: (sortField: string) => void;
}
export const TableHeader: React.FC<TableHeaderProps> = ({
  children,
  fieldName,
  handleSort,
  sortField,
  sortDesc,
}) => {
  return (
    <th onClick={() => handleSort(fieldName)} className="cursor-pointer">
      <div className="flex justify-between items-center">
        {children}
        {fieldName === sortField ? (
          <img
            src={assets.dropdown_arrow}
            className={`w-5 text-gray-800 transition-transform select-none ${
              sortDesc ? "" : "rotate-180"
            }`}
            alt=""
          />
        ) : null}
      </div>
    </th>
  );
};
