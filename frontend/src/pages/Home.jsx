
import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import { useLocation, useSearchParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

import "./Home.css";

function Home() {
    const { addToCart } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(0);
    const [searchParams] = useSearchParams();
    const keyword = searchParams.get("keyword") || "";
    const categoryId = searchParams.get("categoryId") || "";
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortDir, setSortDir] = useState("desc");
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        setPage(0);
    }, [keyword, categoryId]);

    useEffect(() => {
        let cancelled = false;

        async function fetchProducts() {
            try {
                setLoading(true);
                setError("");

                const response = await api.get("/products", {
                    params: {
                        page,
                        size: 12,
                        ...(keyword && { keyword }),
                        ...(categoryId && { categoryId }),
                        sortBy,
                        sortDir,
                    },
                });

                if (!cancelled) {
                    setProducts(response.data.content);
                    setTotalPages(response.data.totalPages);
                }
            } catch (err) {
                if (!cancelled) {
                    console.error("Failed to load products:", err);
                    setError("Không thể tải sản phẩm. Vui lòng thử lại.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        fetchProducts();

        return () => {
            cancelled = true;
        };
    }, [page, keyword, categoryId, sortBy, sortDir]);

    useEffect(() => {
        if (location.hash !== "#products") return;

        const frame = requestAnimationFrame(() => {
            document.getElementById("products")?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        });

        return () => cancelAnimationFrame(frame);
    }, [location.pathname, location.search, location.hash]);


    const handleSortChange = (e) => {
        const [field, direction] = e.target.value.split(":");

        setPage(0);
        setSortBy(field);
        setSortDir(direction);
    };

    const handleAddToCart = async (product) => {

        // Products with variants require SKU selection
        if (product.hasVariants) {
            navigate(`/products/${product.id}`);
            return;
        }

        if (product.stock <= 0) {
            alert("Sản phẩm đã hết hàng.");
            return;
        }

        try {
            await addToCart(product.id, 1);

            alert(`Đã thêm ${product.name} vào giỏ hàng!`);

        } catch (error) {
            if (error.message === "AUTH_REQUIRED") {
                navigate("/login");
                return;
            }

            console.error("Failed to add to cart:", error);

            alert(
                error.response?.data?.message ||
                "Không thể thêm sản phẩm vào giỏ hàng."
            );
        }
    };

    return (
        <main className="home">

            <section className="hero-banner">
                <div className="hero-content">
                    <p className="hero-eyebrow">
                        ĐIỆN THOẠI • LAPTOP • PHỤ KIỆN
                    </p>

                    <h1>
                        Công nghệ
                        <br />
                        cho mỗi ngày.
                    </h1>

                    <p className="hero-description">
                        Tìm mua điện thoại, laptop, tai nghe
                        và phụ kiện phù hợp với nhu cầu của bạn.
                    </p>

                    <a href="#products">
                        Xem sản phẩm →
                    </a>
                </div>

                <img
                    className="hero-image"
                    src="/images/hero-headphones.png"
                    alt="Tai nghe tại UVMart"
                />
            </section>


            <section id="products" className="products-section">
                <div className="section-heading">
                    <h2>
                        {keyword
                            ? `Kết quả tìm kiếm: "${keyword}"`
                            : categoryId
                                ? "Sản phẩm theo danh mục"
                                : "Tất cả sản phẩm"}
                    </h2>

                </div>

                <div className="product-toolbar">


                    <select
                        className="product-sort"
                        value={`${sortBy}:${sortDir}`}
                        onChange={handleSortChange}
                        aria-label="Sắp xếp sản phẩm"
                    >
                        <option value="createdAt:desc">
                            Mới nhất
                        </option>

                        <option value="price:asc">
                            Giá thấp đến cao
                        </option>

                        <option value="price:desc">
                            Giá cao đến thấp
                        </option>

                        <option value="name:asc">
                            Tên A-Z
                        </option>
                    </select>
                </div>

                {loading && <p>Đang tải sản phẩm...</p>}

                {error && <p role="alert">{error}</p>}

                {!loading && !error && (
                    <>
                        {products.length === 0 ? (
                            <p>Chưa có sản phẩm nào.</p>
                        ) : (
                            <div className="product-grid">
                                {products.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        onAddToCart={handleAddToCart}
                                    />
                                ))}
                            </div>
                        )}

                        {totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    disabled={page === 0}
                                    onClick={() => setPage((prev) => prev - 1)}
                                >
                                    Trang trước
                                </button>

                                <span>
                  Trang {page + 1} / {totalPages}
                </span>

                                <button
                                    disabled={page >= totalPages - 1}
                                    onClick={() => setPage((prev) => prev + 1)}
                                >
                                    Trang sau
                                </button>
                            </div>
                        )}
                    </>
                )}
            </section>
        </main>
    );
}

export default Home;
