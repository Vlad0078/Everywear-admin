import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import axios, { AxiosResponse } from "axios";
import {
  AddCategoryRequestBody,
  CategoriesRequestBody,
  CategoriesResponseBody,
  RemoveCategoryRequestBody,
  ResponseBody,
  UpdateCategoryRequestBody,
} from "../../types/api-requests";
import { backendUrl } from "../../constants";
import { toast } from "react-toastify";
import { Category } from "../../types/category";
import { produce } from "immer";
import Pages from "../../components/Pages";
import TableAddForm from "../../components/TableAddForm";
import EditableTable from "../../components/EditableTable";

interface CategoriesProps {
  token: string;
}

const resultsOnPage = 20;

const Categories: React.FC<CategoriesProps> = ({ token }) => {
  const { t } = useTranslation();

  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [sortField, setSortField] = useState("");
  const [sortDesc, setSortDesc] = useState(false);

  // filter
  const [savedFilters, setSavedFilters] = useState<Category>(() => ({
    _id: "",
    name_uk: "",
    name_en: "",
    target: "",
  }));

  const updateHandler = async (updatedData: Category) => {
    try {
      const response = await axios.post<
        ResponseBody,
        AxiosResponse<ResponseBody>,
        UpdateCategoryRequestBody
      >(
        backendUrl + "/api/category/update",
        {
          id: updatedData._id,
          newName_uk: updatedData.name_uk,
          newName_en: updatedData.name_en,
          newTarget: updatedData.target,
        },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(t("category-list.update-success"));
        setCategories((state) =>
          produce(state, (draft) => {
            const category = draft.find((item) => item._id === updatedData._id);
            category!.name_uk = updatedData.name_uk;
            category!.name_en = updatedData.name_en;
            category!.target = updatedData.target;
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
        RemoveCategoryRequestBody
      >(backendUrl + "/api/category/remove", { id }, { headers: { token } });

      if (response.data.success) {
        toast.success(t("category-list.remove-success"));
        fetchCategories(savedFilters);
      } else {
        toast.error(t(response.data.message || t("error.unexpected-error")));
      }
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : t("error.unexpected-error"));
    }
  };

  const fetchCategories = useCallback(
    async (filters?: Category) => {
      try {
        const response = await axios.post<
          CategoriesResponseBody,
          AxiosResponse<CategoriesResponseBody>,
          CategoriesRequestBody
        >(backendUrl + "/api/category/", {
          page,
          resultsOnPage,
          name_uk: filters?.name_uk ?? savedFilters.name_uk,
          name_en: filters?.name_en ?? savedFilters.name_en,
          target: filters?.target ?? savedFilters.target,
          sortField,
          sortDesc,
        });
        if (response.data.success) {
          setCategories(response.data.categories!);
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
    [page, sortDesc, sortField, t]
  );

  const filterHandler = async (filters: Category) => {
    setPage(1);
    if (page === 1) fetchCategories(filters);
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

  const addHandler = async (newCategory: Category) => {
    try {
      const response = await axios.post<
        ResponseBody,
        AxiosResponse<ResponseBody>,
        AddCategoryRequestBody
      >(
        backendUrl + "/api/category/add",
        {
          category: {
            _id: "",
            name_uk: newCategory.name_uk,
            name_en: newCategory.name_en,
            target: newCategory.target,
          },
        },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(t("category-list.add-success"));
        fetchCategories(savedFilters);
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

  return (
    <div>
      <EditableTable
        headers={[
          {
            headerName: t("any-list.name_uk-header"),
            editable: true,
            elementType: "text",
          },
          {
            headerName: t("any-list.name_en-header"),
            editable: true,
            elementType: "text",
          },
          {
            headerName: t("category-list.target-header"),
            editable: true,
            elementType: "select",
            selectOptions: [
              { value: "women", text: t("category-list.target-women") },
              { value: "men", text: t("category-list.target-men") },
              { value: "kids", text: t("category-list.target-kids") },
            ],
          },
        ]}
        data={categories}
        fields={["name_uk", "name_en", "target"]}
        filterPlaceholders={[
          t("any-list.name_uk-placeholder"),
          t("any-list.name_en-placeholder"),
          t("category-list.target-placeholder"),
        ]}
        tableTitle={t("categories-page.title")}
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

      {/* // ? ------------- ADD NEW SUBCATEGORY ------------- */}
      <TableAddForm<Category>
        headers={[
          {
            headerName: t("any-list.name_uk-header"),
            save: false,
            elementType: "text",
          },
          {
            headerName: t("any-list.name_en-header"),
            save: false,
            elementType: "text",
          },
          {
            headerName: t("category-list.target-header"),
            save: true,
            elementType: "select",
            selectOptions: [
              { value: "women", text: t("category-list.target-women") },
              { value: "men", text: t("category-list.target-men") },
              { value: "kids", text: t("category-list.target-kids") },
            ],
          },
        ]}
        fields={["name_uk", "name_en", "target"]}
        fieldPlaceholders={[
          t("any-list.new-name_uk-placeholder"),
          t("any-list.new-name_en-placeholder"),
          t("category-list.new-target-placeholder"),
        ]}
        tableTitle={t("categories-page.add-title")}
        addHandler={addHandler}
      />
    </div>
  );
};

export default Categories;
