
import {
    Search,
    ShoppingCart,
    Menu,
    UserRound,
    LogOut,
} from "lucide-react";

import { useEffect, useState } from "react";
import api from "../services/api";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import "./Header.css";

function Header() {
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const urlKeyword = searchParams.get("keyword") || "";
    const [categories, setCategories] = useState([]);
    const [categoryOpen, setCategoryOpen] = useState(false);
    const [search, setSearch] = useState(urlKeyword);

    useEffect(() => {
        setSearch(urlKeyword);
    }, [urlKeyword]);

    useEffect(() => {
        let cancelled = false;

        const fetchCategories = async () => {
            try {
                const response = await api.get("/categories");

                if (!cancelled) {
                    setCategories(response.data);
                }
            } catch (error) {
                console.error("Failed to load categories:", error);
            }
        };

        fetchCategories();

        return () => {
            cancelled = true;
        };
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();

        const keyword = search.trim();

        if (keyword) {
            navigate(`/?keyword=${encodeURIComponent(keyword)}`);
        } else {
            navigate("/");
        }
    };

    const handleCategorySelect = (categoryId) => {
        setCategoryOpen(false);

        const params = new URLSearchParams();

        if (categoryId) {
            params.set("categoryId", String(categoryId));
        }

        const query = params.toString();

        navigate(query ? `/?${query}#products` : "/#products");
    };

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const { cart } = useCart();

    const cartCount = cart?.items?.reduce(
        (total, item) => total + item.quantity,
        0
    ) ?? 0;



    return (
        <header className="site-header">
            <div className="header-main">

                {/* Brand */}
                <Link to="/" className="brand">
                    UV<span>Mart</span>
                </Link>

                {/* Search */}
                <form className="search-bar" onSubmit={handleSearch}>
                    <input
                        type="search"
                        placeholder="Tìm kiếm sản phẩm..."
                        aria-label="Tìm kiếm sản phẩm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <button type="submit" aria-label="Tìm kiếm">
                        <Search size={22} />
                    </button>
                </form>

                {/* Actions */}
                <div className="header-actions">
                    {isAuthenticated ? (
                        <button
                            type="button"
                            className="header-auth-button"
                            onClick={handleLogout}
                        >
                            <LogOut size={20} />
                            <span>Đăng xuất</span>
                        </button>
                    ) : (
                        <Link to="/login" className="header-auth-link">
                            <UserRound size={20} />
                            <span>Đăng nhập</span>
                        </Link>
                    )}

                    <Link to="/cart" className="header-cart">
                      <span className="cart-icon-wrap">
                        <ShoppingCart size={24} />

                          {cartCount > 0 && (
                              <span className="cart-count">{cartCount}</span>
                          )}
                      </span>
                        <span>Giỏ hàng</span>
                    </Link>
                </div>
            </div>

            {/* Navigation */}
            <nav className="header-nav">
                <div className="category-menu">
                    <button
                        type="button"
                        className="nav-category"
                        aria-expanded={categoryOpen}
                        aria-controls="category-dropdown"
                        onClick={() => setCategoryOpen((prev) => !prev)}
                    >
                        <Menu size={19} />
                        Danh mục
                    </button>

                    {categoryOpen && (
                        <div id="category-dropdown" className="category-dropdown">
                            <button
                                type="button"
                                onClick={() => handleCategorySelect(null)}
                            >
                                Tất cả sản phẩm
                            </button>

                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    type="button"
                                    onClick={() => handleCategorySelect(category.id)}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <Link to="/">Trang chủ</Link>
                <Link to="/#products">Sản phẩm</Link>
                <Link to="/orders">Đơn hàng</Link>
            </nav>
        </header>
    );
}

export default Header;
