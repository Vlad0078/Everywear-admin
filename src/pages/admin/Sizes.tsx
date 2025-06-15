import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import axios, { AxiosResponse } from "axios";
import {
  ResponseBody,
  CategoriesResponseBody,
  CategoriesRequestBody,
  UpdateSizeRequestBody,
  RemoveSizeRequestBody,
  SizesResponseBody,
  SizesRequestBody,
  AddSizeRequestBody,
} from "../../types/api-requests";
import { backendUrl } from "../../constants";
import { toast } from "react-toastify";
import { produce } from "immer";
import { Category } from "../../types/category";
import EditableTable from "../../components/EditableTable";
import Pages from "../../components/Pages";
import TableAddForm from "../../components/TableAddForm";
import { Size } from "../../types/size";
import i18n from "../../i18n";

interface SizesProps {
  token: string;
}

const resultsOnPage = 20;

const Sizes: React.FC<SizesProps> = ({ token }) => {
  const { t } = useTranslation();

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<{ text: string; value: string }[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [sortField, setSortField] = useState("");
  const [sortDesc, setSortDesc] = useState(false);

  // filter
  const [savedFilters, setSavedFilters] = useState<Size>(() => ({
    _id: "",
    size: "",
    categoryId: "",
  }));

  const updateHandler = async (updatedData: Size) => {
    try {
      const response = await axios.post<
        ResponseBody,
        AxiosResponse<ResponseBody>,
        UpdateSizeRequestBody
      >(
        backendUrl + "/api/size/update",
        { id: updatedData._id, newSize: updatedData.size, newCategoryId: updatedData.categoryId },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(t("subcategory-list.update-success"));
        setSizes((state) =>
          produce(state, (draft) => {
            const size = draft.find((item) => item._id === updatedData._id);
            if (!size) return;
            size.size = updatedData.size;
            size.categoryId = updatedData.categoryId;
          })
        );
      } else {
        toast.error(t(response.data.message || t("error.unexpected-error")));
      }
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : t("error.unexpected-error"));
    }
  };

  const removeHandler = async (id: string) => {
    try {
      const response = await axios.post<
        ResponseBody,
        AxiosResponse<ResponseBody>,
        RemoveSizeRequestBody
      >(backendUrl + "/api/size/remove", { id }, { headers: { token } });

      if (response.data.success) {
        toast.success(t("size-list.remove-success"));
        fetchSizes(savedFilters);
      } else {
        toast.error(t(response.data.message || t("error.unexpected-error")));
      }
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : t("error.unexpected-error"));
    }
  };

  const fetchSizes = useCallback(
    async (filters?: Size) => {
      try {
        const response = await axios.post<
          SizesResponseBody,
          AxiosResponse<SizesResponseBody>,
          SizesRequestBody
        >(backendUrl + "/api/size/", {
          page,
          resultsOnPage,
          size: filters?.size ?? savedFilters.size,
          categoryId: filters?.categoryId ?? savedFilters.categoryId,
          sortField,
          sortDesc,
        });
        if (response.data.success) {
          setSizes(response.data.sizes!);
          setPages(Math.ceil(response.data.count! / resultsOnPage));
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        console.error(error);
        toast.error(error instanceof Error ? error.message : t("error.unexpected-error"));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [page, sortDesc, sortField, t] // * тут немає savedFilters щоб ф-ція не вик. сама при вводі запиту
  );

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.post<
        CategoriesResponseBody,
        AxiosResponse<CategoriesResponseBody>,
        CategoriesRequestBody
      >(backendUrl + "/api/category/", {});
      if (response.data.success) {
        setCategories(response.data.categories!);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : t("error.unexpected-error"));
    }
  }, [t]);

  const filterHandler = async (filters: Size) => {
    setPage(1);
    if (page === 1) fetchSizes(filters); // setPage(1) виконається лише на наступному рендері
  };

  const sortHandler = (field: string) => {
    setSortField((state) => {
      if (state === field) {
        setSortDesc((state) => !state);
      } else {
        setSortDesc(false);
      }
      return field;
    });
  };

  const addHandler = async (newSize: Size) => {
    try {
      const response = await axios.post<
        ResponseBody,
        AxiosResponse<ResponseBody>,
        AddSizeRequestBody
      >(
        backendUrl + "/api/size/add",
        {
          size: {
            _id: "",
            size: newSize.size,
            categoryId: newSize.categoryId,
          },
        },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(t("size-list.add-success"));
        fetchSizes(savedFilters);
      } else {
        toast.error(t(response.data.message || t("error.unexpected-error")));
      }
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : t("error.unexpected-error"));
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchSizes();
  }, [fetchSizes]);

  useEffect(() => {
    setCategoryOptions(
      categories
        .map((category) => {
          const name = i18n.language === "uk" ? category.name_uk : category.name_en;
          let target: string | undefined;
          switch (category.target) {
            case "women":
              target = t("category.target-short-women");
              break;
            case "men":
              target = t("category.target-short-men");
              break;
            case "kids":
              target = t("category.target-short-kids");
              break;
            default:
              break;
          }

          return {
            value: category._id,
            text: name + (target ? ` (${target})` : ""),
          };
        })
        .sort((a, b) => a.text.localeCompare(b.text))
    );
  }, [categories, t]);

  return (
    <div>
      <EditableTable
        headers={[
          {
            headerName: t("size-list.size-header"),
            editable: true,
            elementType: "text",
          },
          {
            headerName: t("size-list.category-header"),
            editable: true,
            elementType: "select",
            selectOptions: categoryOptions,
          },
        ]}
        data={sizes}
        fields={["size", "categoryId"]}
        filterPlaceholders={[t("size-list.size-placeholder"), t("any-list.category-placeholder")]}
        tableTitle={t("sizes-page.title")}
        sortField={sortField}
        sortDesc={sortDesc}
        filters={savedFilters}
        setFilters={setSavedFilters}
        sortHandler={sortHandler}
        filterHandler={filterHandler}
        updateHandler={updateHandler}
        removeHandler={removeHandler}
      />

      {/* // ? PAGES */}
      <Pages page={page} pages={pages} setPage={setPage} />
      {pages === 1 && <div className="h-5"></div>}

      {/* // ? ------------- ADD NEW SIZE ------------- */}
      <TableAddForm<Size>
        headers={[
          {
            headerName: t("size-list.size-header"),
            save: false,
            elementType: "text",
          },
          {
            headerName: t("size-list.category-header"),
            save: true,
            elementType: "select",
            selectOptions: categoryOptions,
          },
        ]}
        fields={["size", "categoryId"]}
        fieldPlaceholders={[
          t("size-list.new-size-placeholder"),
          t("size-list.new-category-placeholder"),
        ]}
        tableTitle={t("size-page.add-title")}
        addHandler={addHandler}
      />
    </div>
  );
};

export default Sizes;
