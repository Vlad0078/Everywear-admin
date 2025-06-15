import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { UserPublicInfo, UserRole } from "../../types/user";
import axios, { AxiosResponse } from "axios";
import {
  ChangeRoleRequestBody,
  ManagersRequestBody,
  ManagersResponseBody,
  ResponseBody,
} from "../../types/api-requests";
import { backendUrl } from "../../constants";
import { toast } from "react-toastify";
import { produce } from "immer";
import EditableTable from "../../components/EditableTable";
import Pages from "../../components/Pages";

interface UserFullnameData extends UserPublicInfo {
  fullName: string;
}

interface ManagersProps {
  token: string;
}

const resultsOnPage = 20;

const Managers: React.FC<ManagersProps> = ({ token }) => {
  const { t } = useTranslation();

  const [managers, setManagers] = useState<UserFullnameData[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [sortField, setSortField] = useState("");
  const [sortDesc, setSortDesc] = useState(false);

  // filter
  const [savedFilters, setSavedFilters] = useState<UserFullnameData>(() => ({
    _id: "",
    email: "",
    firstName: "",
    lastName: "",
    fullName: "",
    role: "" as UserRole,
    patronymic: "",
  }));

  const changeRole = async (updatedData: UserFullnameData) => {
    try {
      const response = await axios.post<
        ResponseBody,
        AxiosResponse<ResponseBody>,
        ChangeRoleRequestBody
      >(
        backendUrl + "/api/user/changeRole",
        { targetId: updatedData._id, targetRole: updatedData.role },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(t("manager-list.change-role-success"));
        setManagers((state) =>
          produce(state, (draft) => {
            const manager = draft.find((item) => item._id === updatedData._id);
            if (!manager) return;
            manager.role = updatedData.role;
          })
        );
      } else {
        toast.error(response.data.message || t("error.unexpected-error"));
      }
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : t("error.unexpected-error"));
    }
  };

  const fetchManagers = useCallback(
    async (filters?: UserFullnameData) => {
      try {
        const response = await axios.post<
          ManagersResponseBody,
          AxiosResponse<ManagersResponseBody>,
          ManagersRequestBody
        >(
          backendUrl + "/api/user/managers",
          {
            page,
            resultsOnPage,
            name: filters?.fullName ?? savedFilters.fullName,
            email: filters?.email ?? savedFilters.email,
            role: filters?.role ?? savedFilters.role,
            sortField,
            sortDesc,
          },
          { headers: { token } }
        );
        if (response.data.success && response.data.managers) {
          const fullNameData: UserFullnameData[] = response.data.managers.map((manager) => {
            const { firstName, lastName, patronymic } = manager;
            let fullName = lastName ?? "";
            fullName += " " + firstName;
            if (patronymic) fullName += " " + patronymic;
            return { fullName, ...manager };
          });

          setManagers(fullNameData);
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
    [page, sortDesc, sortField, t, token]
  );

  const filterHandler = async (filters: UserFullnameData) => {
    setPage(1);
    if (page === 1) fetchManagers(filters);
  };

  const handleSort = useCallback((field: string) => {
    setSortField((state) => {
      if (state === field) {
        setSortDesc((state) => !state);
      } else {
        setSortDesc(false);
      }
      return field;
    });
  }, []);

  useEffect(() => {
    fetchManagers();
  }, [fetchManagers, page, sortDesc, sortField, t, token]);

  return (
    <div>
      <EditableTable
        headers={[
          { headerName: t("manager-list.email-header"), editable: false, elementType: "text" },
          {
            headerName: t("manager-list.name-header"),
            editable: false,
            elementType: "text",
          },
          {
            headerName: t("manager-list.role-header"),
            editable: true,
            elementType: "select",
            selectOptions: [
              {
                value: UserRole.customer,
                text: t("user-role.customer"),
              },
              {
                value: UserRole.manager,
                text: t("user-role.manager"),
              },
              {
                value: UserRole.admin,
                text: t("user-role.admin"),
              },
            ],
          },
        ]}
        data={managers}
        fields={["email", "fullName", "role"]}
        filterPlaceholders={[
          t("manager-list.email-placeholder"),
          t("manager-list.name-placeholder"),
          t("manager-list.select-role-placeholder"),
        ]}
        tableTitle={t("managers-page.title")}
        sortField={sortField}
        sortDesc={sortDesc}
        sortHandler={handleSort}
        filterHandler={filterHandler}
        updateHandler={changeRole}
        filters={savedFilters}
        setFilters={setSavedFilters}
      />

      {/* // ? PAGES */}
      <Pages page={page} pages={pages} setPage={setPage} />
      {pages === 1 && <div className="h-5"></div>}
    </div>
  );
};

export default Managers;
