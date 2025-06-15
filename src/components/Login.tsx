import axios from "axios";
import React, { FormEventHandler, useState } from "react";
import { useTranslation } from "react-i18next";
import { backendUrl } from "../constants";
import { ResponseBody } from "../types/api-requests";
import { toast } from "react-toastify";

interface LoginProps {
  setToken: React.Dispatch<React.SetStateAction<string>>;
  setRole: React.Dispatch<React.SetStateAction<string>>;
}

const Login: React.FC<LoginProps> = ({ setToken, setRole }) => {
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmitHandler: FormEventHandler = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post<ResponseBody>(
        backendUrl + "/api/user/admin",
        {
          email,
          password,
        }
      );
      if (response.data.success) {
        setToken(response.data.token!);
        setRole(response.data.role!);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center w-full">
      <div className="bg-white shadow-md rounded-lg px-8 py-6 max-w-md">
        <h1 className="text-2xl font-bold mb-4">{t("login.admin-panel")}</h1>
        <form onSubmit={onSubmitHandler}>
          <div>
            <div className="mb-3 min-w-72">
              <p className="text-sm font-medium text-gray-700 mb-2">
                {t("login.email-address")}
              </p>
              <input
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className="rounded-md w-full px-3 py-2 border border-gray-300 outline-none"
                placeholder="your@email.com"
                required
              />{" "}
            </div>

            <div className="mb-3 min-w-72">
              <p className="text-sm font-medium text-gray-700 mb-2">
                {t("login.password")}
              </p>
              <input
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className="rounded-md w-full px-3 py-2 border border-gray-300 outline-none"
                placeholder={t("login.password-placeholder")}
                required
              />
            </div>

            <button
              type="submit"
              className="mt-2 w-full py-2 px-4 rounded-md text-white bg-black"
            >
              {t("login.login-btn")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
