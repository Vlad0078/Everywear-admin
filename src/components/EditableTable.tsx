import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { TableHeader } from "./TableHeader";
import EditIcon from "./icons/EditIcon";
import styles from "./EditableTable.module.scss";
import { produce } from "immer";

type DataBaseType = {
  _id: string;
};

type HeaderDataType = { headerName: string; editable: boolean } & (
  | { elementType: "text" | "color" }
  | { elementType: "select"; selectOptions: { value: string; text: string }[] }
);

interface EditableTableProps<DataType extends DataBaseType> {
  headers: HeaderDataType[];
  data: DataType[];
  /**
   * Data fields to be shown
   */
  fields: Extract<keyof DataType, string>[];
  /**
   * Placeholders for filter section
   */
  filterPlaceholders: string[];
  /**
   * Function to filter data
   */
  tableTitle: string;
  sortField: string;
  sortDesc: boolean;
  filters: DataType;
  setFilters: React.Dispatch<React.SetStateAction<DataType>>;
  sortHandler: (field: string) => void;
  filterHandler: (filters: DataType) => Promise<void>;
  /**
   * Function to update data in database
   */
  updateHandler: (data: DataType) => Promise<void>;
  /**
   * Function to delete data from database
   */
  removeHandler?: (id: string) => Promise<void>;
}

/**
 * Functional React component for editable table. Don't pass remove handler if data shouldn't be deleteable
 */
const EditableTable = <DataType extends DataBaseType>({
  headers,
  data,
  fields,
  filterPlaceholders,
  tableTitle,
  sortField,
  sortDesc,
  filters,
  setFilters,
  sortHandler,
  filterHandler,
  removeHandler,
  updateHandler,
}: EditableTableProps<DataType>): React.ReactElement => {
  // TODO prevent errors
  // if (headers.length !== fields.length) {
  //   return console.error("The length of fields and headers does not match");
  // }
  // if (fields.length !== filterPlaceholders.length) {
  //   return console.error("The length of fields and placeholders does not match");
  // }

  // ? Hooks
  const { t } = useTranslation();

  // update
  const [editedId, setEditedId] = useState<string>("");
  const [editedField, setEditedField] = useState<keyof DataType | undefined>();
  const [updatedData, setUpdatedData] = useState<DataType | undefined>();

  useEffect(() => {
    cancelEdit();
  }, [data]);

  // ! test
  // useEffect(() => {
  //   console.log("sortField mod in table:", sortField);
  // }, [sortField]);

  /**
   * Edit data on client side without updating it in database
   * @param data {DataType} - data being edited
   * @param editedField {string} - Name of edited field
   * @param editedValue {string} - new value of the field
   * @param force {boolean} - update on first change (for select elements)
   */
  const editFieldHandler = (
    data: DataType,
    editedField: keyof DataType,
    editedValue?: string,
    force: boolean = false
  ) => {
    setEditedId(() => data._id);
    setEditedField(() => editedField);

    setUpdatedData((state) => {
      let updatedData: DataType;

      if (editedId === data._id && state !== undefined) {
        updatedData = structuredClone(state);
      } else {
        updatedData = structuredClone(data);
      }

      if (editedId === data._id || force) {
        updatedData[editedField] = editedValue as DataType[keyof DataType];
      }
      return updatedData;
    });
  };

  /**
   * Edit filter settings
   * @param field {string} - field to change filter settings
   * @param value {string} - value by which the filtering will be performed
   * @param apply {boolean} - apply filters
   */
  const editFiltersHandler = (field: keyof DataType, value: string, apply: boolean = false) => {
    setFilters((filters) =>
      produce(filters, (draft: Record<keyof DataType, string>) => {
        draft[field] = value;

        if (apply) {
          filterHandler(draft as DataType);
        }
      })
    );
  };

  const cancelEdit = () => {
    setEditedId(() => "");
  };

  return (
    <section className={styles.editTableSection}>
      {/* //? FORM TO UPDATE TABLE DATA */}
      <div className={styles.titleContainer}>
        <h2>{tableTitle}</h2>
        <button
          type="submit"
          className={styles.submitButton}
          onClick={() => filterHandler(filters)}
        >
          {t("any-list.filter")}
        </button>
      </div>
      <div className={styles.tableContainer}>
        {/* //? TABLE */}
        <table className={styles.editTable}>
          <thead>
            <tr>
              {fields.map((field, index) =>
                headers[index].elementType === "color" ? (
                  <th>{headers[index].headerName}</th>
                ) : (
                  <TableHeader
                    key={index}
                    fieldName={field}
                    handleSort={sortHandler}
                    sortField={sortField}
                    sortDesc={sortDesc}
                  >
                    {headers[index].headerName}
                  </TableHeader>
                )
              )}

              <th className={styles.textCenter}>{t("any-list.action-header")}</th>
            </tr>
          </thead>

          <tbody>
            {/* //? TABLE FILTERS */}
            <tr className={styles.filterRow}>
              {fields.map((field, index) => (
                <td key={index}>
                  {headers[index].elementType === "text" ? (
                    // INPUT FILTERS
                    <input
                      type="text"
                      value={String(filters[field])}
                      onChange={(e) => editFiltersHandler(field, e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && filterHandler(filters)}
                      placeholder={filterPlaceholders[index]}
                    />
                  ) : headers[index].elementType === "select" ? (
                    // SELECT FILTERS
                    <select
                      name={field}
                      value={String(filters[field])}
                      onChange={(e) => editFiltersHandler(field, e.target.value, true)}
                      className={"" + filters[field] === "" ? "placeholder" : ""}
                    >
                      <option value="" className="placeholder">
                        {filterPlaceholders[index]}
                      </option>
                      {headers[index].selectOptions.map((option, index) => (
                        <option key={index} value={option.value}>
                          {option.text}
                        </option>
                      ))}
                    </select>
                  ) : null}
                </td>
              ))}
              <td></td>
            </tr>

            {/* //? TABLE DATA */}
            {data.map((item, index) => (
              <tr key={index}>
                {fields.map((field, index) => (
                  <td key={index}>
                    {!headers[index].editable ? (
                      // IMMUTABLE FIELDS
                      (item[field] as string)
                    ) : headers[index].elementType === "text" ? (
                      // INPUT MUTABLE FIELDS
                      <div className={styles.editText}>
                        {item._id === editedId ? (
                          <input
                            name={field}
                            type="text"
                            value={(updatedData ? updatedData[field] : item[field]) as string}
                            onChange={(e) => editFieldHandler(item, field, e.target.value)}
                            autoFocus={editedField === "name"}
                          />
                        ) : (
                          <>
                            <div className={styles.text}>{item[field] as string}</div>
                            <div className={styles.editButton}>
                              <EditIcon
                                onClick={() => editFieldHandler(item, field)}
                                height="1rem"
                                width="1rem"
                                fill="none"
                                className={styles.editIcon}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    ) : headers[index].elementType === "select" ? (
                      // SELECT MUTABLE FIELDS
                      <select
                        name={field}
                        value={
                          item._id === editedId && updatedData
                            ? (updatedData[field] as string)
                            : (item[field] as string)
                        }
                        onChange={(e) => editFieldHandler(item, field, e.target.value, true)}
                        className={
                          "bg-inherit text-inherit w-[calc(100%-0.75rem)] h-full outline-none"
                        }
                      >
                        <option value="" className="placeholder">
                          {filterPlaceholders[index]}
                        </option>
                        {headers[index].selectOptions.map((option, index) => (
                          <option key={index} value={option.value}>
                            {option.text}
                          </option>
                        ))}
                      </select>
                    ) : headers[index].elementType === "color" ? (
                      // COLOR INPUT FIELDS
                      <div className="flex h-full items-center justify-center p-[0.375rem!important]">
                        <label
                          className={styles.colorPicker}
                          style={{
                            backgroundColor:
                              item._id === editedId && updatedData
                                ? updatedData && updatedData[field]
                                  ? String(updatedData[field])
                                  : "#000000"
                                : (item[field] as string),
                          }}
                        >
                          <input
                            name={field}
                            autoFocus={editedField === "name"}
                            type="color"
                            value={
                              item._id === editedId && updatedData
                                ? updatedData && updatedData[field]
                                  ? String(updatedData[field])
                                  : "#000000"
                                : (item[field] as string)
                            }
                            onChange={(e) => editFieldHandler(item, field, e.target.value)}
                          />
                        </label>
                      </div>
                    ) : null}
                  </td>
                ))}

                {/* //? ACTION BUTTONS */}
                <td className="p-0">
                  <div className="flex p-1.5 gap-2 h-full">
                    {item._id === editedId ? (
                      <>
                        {/* CANCEL BUTTON */}
                        <button
                          type="button"
                          onClick={() => cancelEdit()}
                          className={styles.cancel}
                        >
                          {t("any-list.cancel-button")}
                        </button>

                        {/* UPDATE BUTTON */}
                        <button
                          type="button"
                          onClick={() => (updatedData ? updateHandler(updatedData) : null)}
                          className={styles.apply}
                        >
                          {t("any-list.update-button")}
                        </button>
                      </>
                    ) : removeHandler ? (
                      // REMOVE BUTTON
                      <button
                        type="submit"
                        onClick={() => removeHandler(item._id)}
                        className={styles.remove}
                      >
                        {t("any-list.remove-button")}
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default EditableTable;
