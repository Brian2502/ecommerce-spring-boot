
import { useState } from "react";
import {
    NavLink,
    Outlet,
    Link,
    useNavigate,
} from "react-router-dom";

import {
    LayoutDashboard,
    Layers3,
    ListTree,
    ClipboardList,
    ListChecks,
    ArrowLeft,
    Package,
    Boxes,
    FolderTree,
    ShoppingCart,
    LogOut,
    Menu,
    X,
    UserCircle,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import "../styles/AdminLayout.css";

const menuGroups = [
    {
        label: "TỔNG QUAN",
        items: [
            {
                label: "Dashboard",
                path: "/admin",
                icon: LayoutDashboard,
            },
        ],
    },
    {
        label: "QUẢN LÝ CỬA HÀNG",
        items: [
            {
                label: "Danh mục",
                path: "/admin/categories",
                icon: FolderTree,
            },
            {
                label: "Sản phẩm",
                path: "/admin/products",
                icon: Package,
            },
            {
                label: "Biến thể sản phẩm",
                path: "/admin/variants",
                icon: Boxes,
            },
            {
                label: "Đơn hàng",
                path: "/admin/orders",
                icon: ShoppingCart,
            },
        ],
    },
    {
        label: "CẤU HÌNH SẢN PHẨM",
        items: [
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
            {
                label: "Thông số sản phẩm",
                path: "/admin/products/specifications",
                icon: ClipboardList,
            },
            {
                label: "Thuộc tính danh mục",
                path: "/admin/category-attributes",
                icon: ListChecks,
            },
        ],
    },
];

export default function AdminLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    return (
        <div className="admin-layout">
            {sidebarOpen && (
                <div
                    className="admin-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside
                className={`admin-sidebar ${
                    sidebarOpen ? "admin-sidebar-open" : ""
                }`}
            >
                <Link
                    to="/admin"
                    className="admin-logo"
                    onClick={() => setSidebarOpen(false)}
                >
                    <img
                        src="/images/logo.png"
                        alt="UVMart"
                        className="admin-logo-image"
                    />


                </Link>

                <button
                    className="admin-mobile-close"
                    onClick={() => setSidebarOpen(false)}
                    aria-label="Đóng menu"
                >
                    <X size={22} />
                </button>

                <nav className="admin-nav">
                    {menuGroups.map((group) => (
                        <div
                            className="admin-menu-group"
                            key={group.label}
                        >
                            <div className="admin-menu-label">
                                {group.label}
                            </div>

                            {group.items.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        end
                                        onClick={() =>
                                            setSidebarOpen(false)
                                        }
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
                        </div>
                    ))}
                </nav>

                <div className="admin-sidebar-bottom">
                    <Link to="/" className="admin-back-store">
                        <ArrowLeft size={18} />
                        Quay về cửa hàng
                    </Link>

                    <button
                        className="admin-logout"
                        onClick={handleLogout}
                    >
                        <LogOut size={18} />
                        Đăng xuất
                    </button>
                </div>
            </aside>

            <div className="admin-main">
                <header className="admin-topbar">
                    <div className="admin-topbar-left">
                        <button
                            className="admin-mobile-toggle"
                            onClick={() => setSidebarOpen(true)}
                            aria-label="Mở menu"
                        >
                            <Menu size={24} />
                        </button>

                        <div>
                            <span className="admin-topbar-title">
                                UVMart Administration
                            </span>
                            <p>Quản lý dữ liệu cửa hàng</p>
                        </div>
                    </div>

                    <div className="admin-profile">
                        <UserCircle size={34} />

                        <div className="admin-profile-info">
                            <strong>
                                {user?.email || "Administrator"}
                            </strong>
                            <span>Quản trị viên</span>
                        </div>

                        <span className="admin-role-badge">
                            ADMIN
                        </span>
                    </div>
                </header>

                <main className="admin-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
