
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import ProtectedRoute from "../components/ProtectedRoute/ProtectedRoute";
import MainLayout from "../layouts/MainLayout";
import Orders from "../pages/orders/Orders";
import Products from "../pages/Products/Products";
import AddProduct from "../pages/Products/AddProduct";
import Categories from "../pages/Categories/Categories";
import SubCategories from "../pages/SubCategories/SubCategories"; 
import AddCategory from "../pages/Categories/AddCategory";
import AddSubCategory from "../pages/SubCategories/AddSubCategory";
import OrderDetails from "../pages/orders/OrderDetails";
import EditProduct from "../pages/Products/EditProduct";
import EditCategory from "../pages/Categories/EditCategory";
import EditSubCategory from "../pages/SubCategories/EditSubCategory";
import Customers from "../pages/customers/Customers";
import Coupons from "../pages/coupons/Coupons";

export default function AppRoutes() {
  return (
    <Routes>
      {/* ALWAYS START AT LOGIN */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* PUBLIC */}
      <Route path="/login" element={<Login />} />

      {/* ADMIN LAYOUT */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="products/add" element={<AddProduct />} />
        <Route path="orders" element={<Orders />} />
        <Route path="categories" element={<Categories />} />
        <Route path="categories/add" element={<AddCategory />} />
        <Route path="subcategories" element={<SubCategories />} /> 
        <Route path="subcategories/add" element={<AddSubCategory />} />
        <Route path="/orders/:orderId" element={<OrderDetails />} />
        <Route path="/products/edit/:id" element={<EditProduct />} />
        <Route path="/categories/edit/:id" element={<EditCategory/>} />
        <Route path="/subcategories/edit/:id" element={<EditSubCategory />} />

        <Route path="customers" element={<Customers />} />
        <Route path="coupons" element={<Coupons />} />
      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
