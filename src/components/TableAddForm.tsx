import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./EditableTable.module.scss";
import { produce } from "immer";

type DataBaseType = {
  _id: string;
};

type HeaderDataType = {
  headerName: string;
  /**
   * do not reset entered value on submit
   */
  save: boolean;
} & (
  | { elementType: "text" | "color" }
  | { elementType: "select"; selectOptions: { value: string; text: string }[] }
);

interface TableAddFormProps<DataType extends DataBaseType> {
  headers: HeaderDataType[];
  /**
   * Data fields
   */
  fields: (keyof DataType)[];
  /**
   * Placeholders for input elements
   */
  fieldPlaceholders: string[];
  tableTitle: string;
  /**
   * Function to add data to database
   */
  addHandler: (data: DataType) => Promise<void>;
}

const TableAddForm = <DataType extends DataBaseType>({
  headers,
  fields,
  fieldPlaceholders,
  tableTitle,
  addHandler,
}: TableAddFormProps<DataType>): React.ReactElement => {
  // ? Hooks
  const { t } = useTranslation();

  // new data
  const [newData, setNewData] = useState<DataType>(() =>
    fields.reduce((acc, field) => {
      return { ...acc, [field]: "" }; //TODO На замітку
    }, {} as DataType)
  );

  /**
   * Edit filter settings
   * @param field {string} - field to change filter settings
   * @param value {string} - value by which the filtering will be performed
   * @param apply {boolean} - apply filters
   */
  const editFiltersHandler = (field: keyof DataType, value: string, apply: boolean = false) => {
    setNewData((state) =>
      produce(state, (draft: Record<keyof DataType, string>) => {
        draft[field] = value;

        if (apply) {
          // filterHandler(draft);
        }
      })
    );
  };

  return (
    <section className={styles.editTableSection}>
      {/* //? FORM TO UPDATE TABLE DATA */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (newData) {
            setNewData((state) =>
              produce(state, (draft: Record<keyof DataType, string>) => {
                fields.forEach((field, index) => {
                  if (!headers[index].save) {
                    draft[field] = "";
                  }
                });
              })
            );

            addHandler(newData);
          }
        }}
      >
        <div className={styles.titleContainer}>
          <h2>{tableTitle}</h2>
        </div>
        <div className={styles.tableContainer}>
          {/* //? TABLE */}
          <table className={styles.editTable}>
            <thead>
              <tr>
                {headers.map((header, index) => (
                  <th key={index}>{header.headerName}</th>
                ))}

                <th className={styles.textCenter}>{t("any-list.action-header")}</th>
              </tr>
            </thead>

            <tbody>
              {/* //? TABLE FILTERS */}
              <tr className={styles.filterRow}>
                {fields.map((field, index) => (
                  <td key={index}>
                    {headers[index].elementType === "text" ? (
                      // INPUT FIELDS
                      <input
                        type="text"
                        value={newData ? String(newData[field]) : ""}
                        onChange={(e) => editFiltersHandler(field, e.target.value)}
                        placeholder={fieldPlaceholders[index]}
                      />
                    ) : headers[index].elementType === "select" ? (
                      // SELECT FIELDS
                      <select
                        name={String(field)}
                        value={newData ? String(newData[field]) : ""}
                        onChange={(e) => editFiltersHandler(field, e.target.value, true)}
                        className={!newData || !newData[field] ? "placeholder text-nowrap" : ""}
                      >
                        <option value="" className="placeholder">
                          {fieldPlaceholders[index]}
                        </option>
                        {headers[index].selectOptions.map((option, index) => (
                          <option key={index} value={option.value}>
                            {option.text}
                          </option>
                        ))}
                      </select>
                    ) : headers[index].elementType === "color" ? (
                      // COLOR INPUT FIELDS
                      <div className="flex h-full overflow-hidden items-center justify-center p-[0.375rem!important]">
                        <label
                          className={styles.colorPicker}
                          style={{
                            backgroundColor:
                              newData && newData[field] ? String(newData[field]) : "#808080",
                          }}
                        >
                          <input
                            type="color"
                            value={newData && newData[field] ? String(newData[field]) : "#808080"}
                            onChange={(e) => editFiltersHandler(field, e.target.value)}
                            placeholder={fieldPlaceholders[index]}
                          />
                        </label>
                      </div>
                    ) : null}
                  </td>
                ))}
                <td className="p-[0.375rem!important]">
                  <button
                    type="submit"
                    className={`${
                      fields.every((field) => newData[field]) ? "bg-green-600" : "bg-gray-400"
                    } text-white font-base w-full h-full block rounded-full`}
                    disabled={fields.every((field) => newData[field]) ? false : true}
                  >
                    {t("any-list.add-button")}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </form>
    </section>
  );
};

export default TableAddForm;
