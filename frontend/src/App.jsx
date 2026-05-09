import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProfileGuard from "./components/ProfileGuard";

import Home from "./pages/Home";
import Bag from "./pages/Bag";
import Profile from "./pages/Profile";
import MyOrders from "./pages/MyOrders";

import AdminLogin from "./pages/AdminLogin";
import AdminRoute from "./components/AdminRoute";

import Admin from "./pages/Admin";
import AdminDashboard from "./pages/AdminDashboard";
import StoreAdmin from "./pages/StoreAdmin";
import AdminAddProduct from "./pages/AdminAddProduct";
import AdminManageSellers from "./pages/AdminManageSellers";
import AdminProducts from "./pages/AdminProducts";
import AdminOrderHistory from "./pages/AdminOrderHistory";
import PublicLanding from "./pages/PublicLanding";

// NEW SELLER PAGES
import SellerDashboard from "./pages/SellerDashboard";
import SellerAddProduct from "./pages/SellerAddProduct";
import SellerRoute from "./components/SellerRoute";

export default function App(){

  return(
    <BrowserRouter>

      <Navbar/>

      <Routes>

        <Route path="/" element={
          <ProfileGuard>
            <Home/>
          </ProfileGuard>
        }/>

        <Route path="/welcome" element={<PublicLanding/>}/>

        <Route path="/bag" element={
          <ProfileGuard>
            <Bag/>
          </ProfileGuard>
        }/>

        <Route path="/orders" element={
          <ProfileGuard>
            <MyOrders/>
          </ProfileGuard>
        }/>

        <Route path="/profile" element={<Profile/>}/>

        <Route path="/admin-login" element={<AdminLogin/>}/>

        <Route path="/admin-products" element={
          <AdminRoute>
            <AdminProducts/>
          </AdminRoute>
        }/>

        <Route path="/admin-add" element={
          <AdminRoute>
            <AdminAddProduct/>
          </AdminRoute>
        }/>

        <Route path="/admin" element={
          <AdminRoute>
            <Admin/>
          </AdminRoute>
        }/>

        <Route path="/store" element={
          <AdminRoute>
            <StoreAdmin/>
          </AdminRoute>
        }/>

        <Route path="/admin-dashboard" element={
          <AdminRoute>
            <AdminDashboard/>
          </AdminRoute>
        }/>

        {/* SELLER ROUTES */}

        <Route path="/seller-dashboard" element={
          <SellerRoute>
            <SellerDashboard/>
          </SellerRoute>
        }/>

        <Route path="/seller-add-product" element={
          <SellerRoute>
            <SellerAddProduct/>
          </SellerRoute>
        }/>
        <Route path="/admin-sellers" element={
          <AdminRoute>
            <AdminManageSellers/>
          </AdminRoute>
        }/>

        <Route path="/admin-order-history" element={
          <AdminRoute>
            <AdminOrderHistory/>
          </AdminRoute>
        }/>

      </Routes>

    </BrowserRouter>
  );
}