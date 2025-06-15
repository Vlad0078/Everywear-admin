import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import axios, { AxiosResponse } from "axios";
import {
  ResponseBody,
  UpdateColorRequestBody,
  RemoveColorRequestBody,
  ColorsRequestBody,
  ColorsResponseBody,
  AddColorRequestBody,
} from "../../types/api-requests";
import { backendUrl } from "../../constants";
import { toast } from "react-toastify";
import { produce } from "immer";
import EditableTable from "../../components/EditableTable";
import Pages from "../../components/Pages";
import TableAddForm from "../../components/TableAddForm";
import { Color } from "../../types/color";

interface ColorsProps {
  token: string;
}

const resultsOnPage = 20;

const Colors: React.FC<ColorsProps> = ({ token }) => {
  const { t } = useTranslation();

  const [colors, setColors] = useState<Color[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [sortField, setSortField] = useState("");
  const [sortDesc, setSortDesc] = useState(false);

  // filter
  const [savedFilters, setSavedFilters] = useState<Color>(() => ({
    _id: "",
    code: "",
    name_uk: "",
    name_en: "",
    hex: "#000000",
  }));

  const updateHandler = async (updatedData: Color) => {
    try {
      const response = await axios.post<
        ResponseBody,
        AxiosResponse<ResponseBody>,
        UpdateColorRequestBody
      >(
        backendUrl + "/api/color/update",
        {
          id: updatedData._id,
          newName_uk: updatedData.name_uk,
          newName_en: updatedData.name_en,
          newHex: updatedData.hex,
        },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(t("color-list.update-success"));
        setColors((state) =>
          produce(state, (draft) => {
            const color = draft.find((item) => item._id === updatedData._id);
            if (!color) return;
            color.name_uk = updatedData.name_uk;
            color.name_en = updatedData.name_en;
            color.hex = updatedData.hex;
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
        RemoveColorRequestBody
      >(backendUrl + "/api/color/remove", { id }, { headers: { token } });

      if (response.data.success) {
        toast.success(t("color-list.remove-success"));
        fetchColors(savedFilters);
      } else {
        toast.error(t(response.data.message || t("error.unexpected-error")));
      }
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : t("error.unexpected-error"));
    }
  };

  const fetchColors = useCallback(
    async (filters?: Color) => {
      try {
        const response = await axios.post<
          ColorsResponseBody,
          AxiosResponse<ColorsResponseBody>,
          ColorsRequestBody
        >(backendUrl + "/api/color/", {
          page,
          resultsOnPage,
          code: filters?.code ?? savedFilters.code,
          name_uk: filters?.name_uk ?? savedFilters.name_uk,
          name_en: filters?.name_en ?? savedFilters.name_en,
          sortField,
          sortDesc,
        });
        if (response.data.success) {
          setColors(response.data.colors!);
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

  const filterHandler = async (filters: Color) => {
    setPage(1);
    if (page === 1) fetchColors(filters); // setPage(1) виконається лише на наступному рендері
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

  const addHandler = async (newColor: Color) => {
    try {
      const response = await axios.post<
        ResponseBody,
        AxiosResponse<ResponseBody>,
        AddColorRequestBody
      >(
        backendUrl + "/api/color/add",
        {
          color: {
            _id: "",
            code: newColor.code,
            name_uk: newColor.name_uk,
            name_en: newColor.name_en,
            hex: newColor.hex,
          },
        },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(t("color-list.add-success"));
        fetchColors(savedFilters);
      } else {
        toast.error(t(response.data.message || t("error.unexpected-error")));
      }
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : t("error.unexpected-error"));
    }
  };

  useEffect(() => {
    fetchColors();
  }, [fetchColors]);

  return (
    <div>
      <EditableTable
        headers={[
          {
            headerName: t("any-list.code-header"),
            editable: false,
            elementType: "text",
          },
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
            headerName: t("color-list.color-header"),
            editable: true,
            elementType: "color",
          },
        ]}
        data={colors}
        fields={["code", "name_uk", "name_en", "hex"]}
        filterPlaceholders={[
          t("any-list.code-placeholder"),
          t("any-list.name_uk-placeholder"),
          t("any-list.name_en-placeholder"),
        ]}
        tableTitle={t("color-page.title")}
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

      {/* // ? ------------- ADD NEW COLOR ------------- */}
      <TableAddForm<Color>
        headers={[
          {
            headerName: t("any-list.code-header"),
            save: false,
            elementType: "text",
          },
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
            headerName: t("color-list.color-header"),
            save: true,
            elementType: "color",
          },
        ]}
        fields={["code", "name_uk", "name_en", "hex"]}
        fieldPlaceholders={[
          t("color-list.new-code-placeholder"),
          t("any-list.new-name_uk-placeholder"),
          t("any-list.new-name_en-placeholder"),
        ]}
        tableTitle={t("colors-page.add-title")}
        addHandler={addHandler}
      />
    </div>
  );
};

export default Colors;
