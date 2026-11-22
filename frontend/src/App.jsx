import { Routes, Route, useLocation } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./components/AdminLayout";

import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import AdminAttributes from "./pages/AdminAttributes";
import AdminAttributeItems from "./pages/AdminAttributeItems";

import "./App.css";

function App() {
    const location = useLocation();
    const isAdminPage = location.pathname.startsWith("/admin");

    return (
        <>
            {!isAdminPage && <Header />}

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/orders/:id" element={<OrderDetail />} />

                <Route element={<AdminRoute />}>
                    <Route element={<AdminLayout />}>
                        <Route
                            path="/admin/attributes"
                            element={<AdminAttributes />}
                        />
                        <Route
                            path="/admin/attribute-items"
                            element={<AdminAttributeItems />}
                        />
                    </Route>
                </Route>
            </Routes>

            {!isAdminPage && <Footer />}
        </>
    );
}

export default App;