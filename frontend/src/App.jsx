
import { Routes, Route, useLocation } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";

// Customer pages
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import AdminCategories from "./admin/pages/AdminCategories";
import AdminProducts from "./admin/pages/AdminProducts";
import AdminProductForm from "./admin/pages/AdminProductForm";
import AdminVariants from "./admin/pages/AdminVariants";
import AdminOrders from "./admin/pages/AdminOrders";
import AdminOrderDetail from "./admin/pages/AdminOrderDetail";

// Admin components
import AdminRoute from "./admin/components/AdminRoute";
import AdminLayout from "./admin/components/AdminLayout";

// Admin pages
import AdminAttributes from "./admin/pages/AdminAttributes";
import AdminAttributeItems from "./admin/pages/AdminAttributeItems";
import AdminProductSpecifications from "./admin/pages/AdminProductSpecifications";
import AdminCategoryAttributes from "./admin/pages/AdminCategoryAttributes";
import AdminDashboard from "./admin/pages/AdminDashboard";

import "./App.css";

function App() {
    const location = useLocation();

    const isAdminPage =
        location.pathname === "/admin" ||
        location.pathname.startsWith("/admin/");

    return (
        <>
            {!isAdminPage && <Header />}

            <Routes>
                {/* Customer routes */}
                <Route path="/" element={<Home />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/orders/:id" element={<OrderDetail />} />

                {/* Admin routes */}

                <Route element={<AdminRoute />}>
                    <Route path="/admin" element={<AdminLayout />}>

                        <Route index element={<AdminDashboard />} />

                        {/* Categories */}
                        <Route
                            path="categories"
                            element={<AdminCategories />}
                        />

                        {/* Products */}
                        <Route
                            path="products"
                            element={<AdminProducts />}
                        />

                        <Route
                            path="products/create"
                            element={<AdminProductForm />}
                        />

                        <Route
                            path="products/:id/edit"
                            element={<AdminProductForm />}
                        />

                        {/* Attributes */}
                        <Route
                            path="attributes"
                            element={<AdminAttributes />}
                        />

                        <Route
                            path="attribute-items"
                            element={<AdminAttributeItems />}
                        />

                        <Route
                            path="products/specifications"
                            element={<AdminProductSpecifications />}
                        />

                        <Route
                            path="category-attributes"
                            element={<AdminCategoryAttributes />}
                        />
                        <Route
                            path="variants"
                            element={<AdminVariants />}
                        />

                        <Route path="orders" element={<AdminOrders />} />

                        <Route
                            path="orders/:id"
                            element={<AdminOrderDetail />}
                        />


                    </Route>
                </Route>

            </Routes>

            {!isAdminPage && <Footer />}
        </>
    );
}

export default App;
