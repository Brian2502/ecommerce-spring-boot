import { NavLink, Outlet, Link } from "react-router-dom";
import {
    LayoutDashboard,
    Layers3,
    ListTree,
    Package,
    ShoppingBag,
    ArrowLeft,
} from "lucide-react";

import "./AdminLayout.css";

const menuItems = [
    {
        label: "Tổng quan",
        path: "/admin",
        icon: LayoutDashboard,
    },
    {
        label: "Nhóm thuộc tính",
        path: "/admin/attributes",
        icon: Layers3,
    },
    {
        label: "Thuộc tính",
        path: "/admin/attribute-items",
        icon: ListTree,
    },
];

export default function AdminLayout() {
    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <Link to="/admin/attributes" className="admin-logo">
                    <ShoppingBag size={27} />
                    <span>
                        UV<strong>Mart</strong>
                    </span>
                    <small>ADMIN</small>
                </Link>

                <div className="admin-menu-label">
                    QUẢN TRỊ HỆ THỐNG
                </div>

                <nav className="admin-nav">
                    {menuItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === "/admin"}
                                className={({ isActive }) =>
                                    `admin-nav-item ${
                                        isActive ? "active" : ""
                                    }`
                                }
                            >
                                <Icon size={19} />
                                <span>{item.label}</span>
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="admin-sidebar-bottom">
                    <Link to="/" className="admin-back-store">
                        <ArrowLeft size={18} />
                        Quay về cửa hàng
                    </Link>
                </div>
            </aside>

            <div className="admin-main">
                <header className="admin-topbar">
                    <div>
                        <span className="admin-topbar-title">
                            UVMart Administration
                        </span>
                        <p>Quản lý dữ liệu cửa hàng</p>
                    </div>

                    <span className="admin-role-badge">
                        ADMIN
                    </span>
                </header>

                <div className="admin-content">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}