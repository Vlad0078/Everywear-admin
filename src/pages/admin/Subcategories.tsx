import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import axios, { AxiosResponse } from "axios";
import {
  AddSubcategoryRequestBody,
  SubcategoriesRequestBody,
  SubcategoriesResponseBody,
  RemoveSubcategoryRequestBody,
  ResponseBody,
  UpdateSubcategoryRequestBody,
  CategoriesResponseBody,
  CategoriesRequestBody,
} from "../../types/api-requests";
import { backendUrl } from "../../constants";
import { toast } from "react-toastify";
import { Subcategory } from "../../types/subcategory";
import { produce } from "immer";
import { Category } from "../../types/category";
import EditableTable from "../../components/EditableTable";
import Pages from "../../components/Pages";
import TableAddForm from "../../components/TableAddForm";
import i18n from "../../i18n";

interface SubcategoriesProps {
  token: string;
}

const resultsOnPage = 20;

const Subcategories: React.FC<SubcategoriesProps> = ({ token }) => {
  const { t } = useTranslation();

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<{ text: string; value: string }[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [sortField, setSortField] = useState("");
  const [sortDesc, setSortDesc] = useState(false);

  // filter
  const [savedFilters, setSavedFilters] = useState<Subcategory>(() => ({
    _id: "",
    name_uk: "",
    name_en: "",
    categoryId: "",
  }));

  const updateHandler = async (updatedData: Subcategory) => {
    try {
      const response = await axios.post<
        ResponseBody,
        AxiosResponse<ResponseBody>,
        UpdateSubcategoryRequestBody
      >(
        backendUrl + "/api/subcategory/update",
        {
          id: updatedData._id,
          newName_uk: updatedData.name_uk,
          newName_en: updatedData.name_en,
          newCategoryId: updatedData.categoryId,
        },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(t("subcategory-list.update-success"));
        setSubcategories((state) =>
          produce(state, (draft) => {
            const subcategory = draft.find((item) => item._id === updatedData._id);
            if (!subcategory) return;
            subcategory.name_uk = updatedData.name_uk;
            subcategory.name_en = updatedData.name_en;
            subcategory.categoryId = updatedData.categoryId;
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
        RemoveSubcategoryRequestBody
      >(backendUrl + "/api/subcategory/remove", { id }, { headers: { token } });

      if (response.data.success) {
        toast.success(t("subcategory-list.remove-success"));
        fetchSubcategories(savedFilters);
      } else {
        toast.error(t(response.data.message || t("error.unexpected-error")));
      }
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : t("error.unexpected-error"));
    }
  };

  const fetchSubcategories = useCallback(
    async (filters?: Subcategory) => {
      try {
        const response = await axios.post<
          SubcategoriesResponseBody,
          AxiosResponse<SubcategoriesResponseBody>,
          SubcategoriesRequestBody
        >(backendUrl + "/api/subcategory/", {
          page,
          resultsOnPage,
          name_uk: filters?.name_uk ?? savedFilters.name_uk,
          name_en: filters?.name_en ?? savedFilters.name_en,
          categoryId: filters?.categoryId ?? savedFilters.categoryId,
          sortField,
          sortDesc,
        });
        if (response.data.success) {
          setSubcategories(response.data.subcategories!);
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

  const filterHandler = async (filters: Subcategory) => {
    setPage(1);
    if (page === 1) fetchSubcategories(filters); // setPage(1) виконається лише на наступному рендері
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

  const addHandler = async (newSubcategory: Subcategory) => {
    try {
      const response = await axios.post<
        ResponseBody,
        AxiosResponse<ResponseBody>,
        AddSubcategoryRequestBody
      >(
        backendUrl + "/api/subcategory/add",
        {
          subcategory: {
            _id: "",
            name_uk: newSubcategory.name_uk,
            name_en: newSubcategory.name_en,
            categoryId: newSubcategory.categoryId,
          },
        },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(t("subcategory-list.add-success"));
        fetchSubcategories(savedFilters);
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
    fetchSubcategories();
  }, [fetchSubcategories]);

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
            headerName: t("subcategory-list.category-header"),
            editable: true,
            elementType: "select",
            selectOptions: categoryOptions,
          },
        ]}
        data={subcategories}
        fields={["name_uk", "name_en", "categoryId"]}
        filterPlaceholders={[
          t("any-list.name_uk-placeholder"),
          t("any-list.name_en-placeholder"),
          t("any-list.category-placeholder"),
        ]}
        tableTitle={t("subcategories-page.title")}
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
      <TableAddForm<Subcategory>
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
            headerName: t("subcategory-list.category-header"),
            save: true,
            elementType: "select",
            selectOptions: categoryOptions,
          },
        ]}
        fields={["name_uk", "name_en", "categoryId"]}
        fieldPlaceholders={[
          t("any-list.new-name_uk-placeholder"),
          t("any-list.new-name_en-placeholder"),
          t("subcategory-list.new-category-placeholder"),
        ]}
        tableTitle={t("subcategories-page.add-title")}
        addHandler={addHandler}
      />
    </div>
  );
};

export default Subcategories;
