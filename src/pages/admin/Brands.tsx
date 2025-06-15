import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import axios, { AxiosResponse } from "axios";
import {
  AddBrandRequestBody,
  BrandsRequestBody,
  BrandsResponseBody,
  RemoveBrandRequestBody,
  ResponseBody,
  UpdateBrandRequestBody,
} from "../../types/api-requests";
import { backendUrl } from "../../constants";
import { toast } from "react-toastify";
import { Brand } from "../../types/brand";
import { produce } from "immer";
import EditableTable from "../../components/EditableTable";
import Pages from "../../components/Pages";
import TableAddForm from "../../components/TableAddForm";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import ukLocale from "i18n-iso-countries/langs/uk.json";
import i18n from "../../i18n";

countries.registerLocale(enLocale);
countries.registerLocale(ukLocale);
const resultsOnPage = 20;

interface BrandsProps {
  token: string;
}

const Brands: React.FC<BrandsProps> = ({ token }) => {
  const { t } = useTranslation();

  const [countryOptions, setCountryOptions] = useState<{ text: string; value: string }[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [sortField, setSortField] = useState("");
  const [sortDesc, setSortDesc] = useState(false);

  // filter
  const [savedFilters, setSavedFilters] = useState<Brand>(() => ({
    _id: "",
    code: "",
    name: "",
    country: "",
  }));

  const updateHandler = async (updatedData: Brand) => {
    try {
      const response = await axios.post<
        ResponseBody,
        AxiosResponse<ResponseBody>,
        UpdateBrandRequestBody
      >(
        backendUrl + "/api/brand/update",
        { id: updatedData._id, newName: updatedData.name, newCountry: updatedData.country },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(t("brand-list.update-success"));
        setBrands((state) =>
          produce(state, (draft) => {
            const brand = draft.find((item) => item._id === updatedData._id);
            brand!.name = updatedData.name;
            brand!.country = updatedData.country;
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
        RemoveBrandRequestBody
      >(backendUrl + "/api/brand/remove", { id }, { headers: { token } });

      if (response.data.success) {
        toast.success(t("brand-list.remove-success"));
        fetchBrands(savedFilters);
      } else {
        toast.error(t(response.data.message || t("error.unexpected-error")));
      }
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : t("error.unexpected-error"));
    }
  };

  const fetchBrands = useCallback(
    async (filters?: Brand) => {
      try {
        const response = await axios.post<
          BrandsResponseBody,
          AxiosResponse<BrandsResponseBody>,
          BrandsRequestBody
        >(backendUrl + "/api/brand/", {
          page,
          resultsOnPage,
          name: filters?.name ?? savedFilters.name,
          country: filters?.country ?? savedFilters.country,
          sortField,
          sortDesc,
        });
        if (response.data.success) {
          setBrands(response.data.brands!);
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

  const filterHandler = async (filters: Brand) => {
    setPage(1);
    if (page === 1) fetchBrands(filters);
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

  const addHandler = async (newBrand: Brand) => {
    try {
      const response = await axios.post<
        ResponseBody,
        AxiosResponse<ResponseBody>,
        AddBrandRequestBody
      >(
        backendUrl + "/api/brand/add",
        {
          brand: {
            _id: "",
            name: newBrand.name,
            country: newBrand.country,
          },
        },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(t("brand-list.add-success"));
        fetchBrands(savedFilters);
      } else {
        toast.error(t(response.data.message || t("error.unexpected-error")));
      }
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : t("error.unexpected-error"));
    }
  };

  useEffect(() => {
    const locCountries =
      i18n.language === "uk" ? countries.getNames("uk") : countries.getNames("en");
    setCountryOptions(
      Object.keys(locCountries)
        .map((key) => ({ value: key, text: locCountries[key] }))
        .sort((a, b) => a.text.localeCompare(b.text))
    );
  }, [t]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  return (
    <div>
      <EditableTable
        headers={[
          {
            headerName: t("brand-list.name-header"),
            editable: true,
            elementType: "text",
          },
          {
            headerName: t("brand-list.country-header"),
            editable: true,
            elementType: "select",
            selectOptions: countryOptions,
          },
        ]}
        data={brands}
        fields={["name", "country"]}
        filterPlaceholders={[t("brand-list.name-placeholder"), t("brand-list.country-placeholder")]}
        tableTitle={t("brands-page.title")}
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

      {/* // ? ------------- ADD NEW BRAND ------------- */}
      <TableAddForm<Brand>
        headers={[
          {
            headerName: t("brand-list.name-header"),
            save: false,
            elementType: "text",
          },
          {
            headerName: t("brand-list.country-header"),
            save: true,
            elementType: "select",
            selectOptions: countryOptions,
          },
        ]}
        fields={["name", "country"]}
        fieldPlaceholders={[
          t("brand-list.new-name-placeholder"),
          t("brand-list.new-country-placeholder"),
        ]}
        tableTitle={t("brands-page.add-title")}
        addHandler={addHandler}
      />
    </div>
  );
};

export default Brands;
