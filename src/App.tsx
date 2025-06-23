import React, { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Add from "./pages/Add";
import List from "./pages/List";
import Orders from "./pages/Orders";
import Login from "./components/Login";
import Managers from "./pages/admin/Managers";
import { UserRole } from "./types/user";
import Categories from "./pages/admin/Categories";
import Brands from "./pages/admin/Brands";
import Subcategories from "./pages/admin/Subcategories";
import Sizes from "./pages/admin/Sizes";
import Colors from "./pages/admin/Colors";
import Edit from "./pages/Edit";

export const currency = "грн.";

const App: React.FC = () => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [role, setRole] = useState<UserRole | string>(localStorage.getItem("role") || "");

  useEffect(() => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
  }, [role, token]);

  return (
    <div className="flex flex-col bg-gray-50 h-screen">
      <ToastContainer />
      {token === "" ? (
        <Login setToken={setToken} setRole={setRole} />
      ) : (
        <div className="flex flex-col flex-1 overflow-auto max-h-full">
          <Navbar setToken={setToken} setRole={setRole} />
          <hr />
          <div className="flex flex-1 w-full">
            <Sidebar role={role} />
            <div className="w-[83%] px-4 xl:px-[8%] m-auto my-8 text-gray-600 text-base">
              <Routes>
                <Route path="/" element={<></>} />
                <Route path="/add" element={<Add token={token} />} />
                <Route path="/edit/:productId" element={<Edit token={token} />} />
                <Route path="/list" element={<List token={token} />} />
                <Route path="/orders" element={<Orders token={token} />} />
                <Route path="/brands" element={<Brands token={token} />} />
                <Route path="/categories" element={<Categories token={token} />} />
                <Route path="/subcategories" element={<Subcategories token={token} />} />
                <Route path="/sizes" element={<Sizes token={token} />} />
                <Route path="/colors" element={<Colors token={token} />} />
                <Route path="/managers" element={<Managers token={token} />} />
              </Routes>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default App;
