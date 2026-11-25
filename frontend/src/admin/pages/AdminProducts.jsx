
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
    Plus,
    Search,
    Pencil,
    Trash2,
    Package,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

import { adminService } from "../services/adminService";
import "../styles/AdminManagement.css";

const PAGE_SIZE = 10;

const formatMoney = (value) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(value);

export default function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    const [keyword, setKeyword] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [sort, setSort] = useState("createdAt,desc");

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [reload, setReload] = useState(0);

    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState("");
    const [categoryError, setCategoryError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        adminService.getCategories()
            .then(setCategories)
            .catch(() =>
                setCategoryError("Không thể tải bộ lọc danh mục.")
            );
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(0);
            setSearchTerm(keyword.trim());
        }, 350);

        return () => clearTimeout(timer);
    }, [keyword]);

    useEffect(() => {
        let active = true;

        const loadProducts = async () => {
            try {
                setLoading(true);
                setError("");

                const [sortBy, sortDir] = sort.split(",");

                const data = await adminService.getProducts({
                    keyword: searchTerm || undefined,
                    categoryId: categoryId || undefined,
                    sortBy,
                    sortDir,
                    page,
                    size: PAGE_SIZE,
                });

                if (!active) return;

                const pages = data.totalPages ?? 0;

                if (page > 0 && page >= pages) {
                    setPage(Math.max(0, pages - 1));
                    return;
                }

                setProducts(data.content ?? []);
                setTotalPages(pages);
                setTotalElements(data.totalElements ?? 0);
            } catch (err) {
                if (active) {
                    setError("Không thể tải danh sách sản phẩm.");
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        loadProducts();

        return () => {
            active = false;
        };
    }, [
        searchTerm,
        categoryId,
        sort,
        page,
        reload,
    ]);

    const handleDelete = async (product) => {
        if (deletingId !== null) return;

        const confirmed = window.confirm(
            `Bạn có chắc muốn xóa sản phẩm "${product.name}"?\n\n` +
            "Toàn bộ biến thể và thông số kỹ thuật của sản phẩm " +
            "cũng sẽ bị xóa.\n\n" +
            "Thao tác này không thể hoàn tác."
        );

        if (!confirmed) return;

        try {
            setDeletingId(product.id);
            setError("");
            setSuccess("");

            await adminService.deleteProduct(product.id);

            setSuccess("Xóa sản phẩm thành công.");
            setReload((prev) => prev + 1);

        } catch (err) {
            const status = err.response?.status;

            if (status === 409) {
                setError(
                    "Không thể xóa sản phẩm vì sản phẩm hoặc " +
                    "biến thể của nó đang được sử dụng " +
                    "trong giỏ hàng hoặc đơn hàng."
                );
            } else if (status === 404) {
                setError("Sản phẩm không còn tồn tại.");
            } else {
                setError(
                    err.response?.data?.message ||
                    "Không thể xóa sản phẩm."
                );
            }
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="uv-management">
            <div className="uv-management-heading">
                <div>
                    <h1>Sản phẩm</h1>
                    <p>
                        Quản lý danh sách sản phẩm và giá bán.
                    </p>
                </div>

                <Link
                    to="/admin/products/create"
                    className="uv-btn uv-btn-primary"
                >
                    <Plus size={17} />
                    Thêm sản phẩm
                </Link>
            </div>

            {(error || categoryError) && (
                <div className="uv-alert uv-alert-error">
                    {error || categoryError}
                </div>
            )}

            {success && (
                <div className="uv-alert uv-alert-success">
                    {success}
                </div>
            )}

            <section className="uv-management-panel">
                <div className="uv-management-toolbar">
                    <div className="uv-search">
                        <Search size={17} />

                        <input
                            placeholder="Tìm kiếm sản phẩm..."
                            value={keyword}
                            onChange={(e) =>
                                setKeyword(e.target.value)
                            }
                        />
                    </div>

                    <select
                        className="uv-filter"
                        value={categoryId}
                        onChange={(e) => {
                            setCategoryId(e.target.value);
                            setPage(0);
                        }}
                    >
                        <option value="">
                            Tất cả danh mục
                        </option>

                        {categories.map((category) => (
                            <option
                                key={category.id}
                                value={category.id}
                            >
                                {category.name}
                            </option>
                        ))}
                    </select>

                    <select
                        className="uv-filter"
                        value={sort}
                        onChange={(e) => {
                            setSort(e.target.value);
                            setPage(0);
                        }}
                    >
                        <option value="createdAt,desc">
                            Mới nhất
                        </option>
                        <option value="createdAt,asc">
                            Cũ nhất
                        </option>
                        <option value="price,asc">
                            Giá tăng dần
                        </option>
                        <option value="price,desc">
                            Giá giảm dần
                        </option>
                        <option value="name,asc">
                            Tên A - Z
                        </option>
                    </select>
                </div>

                <div className="uv-table-wrap">
                    <table className="uv-management-table">
                        <thead>
                        <tr>
                            <th>Sản phẩm</th>
                            <th>Danh mục</th>
                            <th>Giá bán</th>
                            <th>Tồn kho gốc</th>
                            <th>Thao tác</th>
                        </tr>
                        </thead>

                        <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5}
                                    className="uv-empty">
                                    Đang tải sản phẩm...
                                </td>
                            </tr>
                        ) : products.length === 0 ? (
                            <tr>
                                <td colSpan={5}
                                    className="uv-empty">
                                    Không tìm thấy sản phẩm.
                                </td>
                            </tr>
                        ) : (
                            products.map((product) => (
                                <tr key={product.id}>
                                    <td>
                                        <div className="uv-product-cell">
                                            <div className="uv-product-thumb">
                                                {product.imageUrl ? (
                                                    <img
                                                        src={product.imageUrl}
                                                        alt={product.name}
                                                        loading="lazy"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display =
                                                                "none";
                                                        }}
                                                    />
                                                ) : (
                                                    <Package size={21} />
                                                )}
                                            </div>

                                            <div>
                                                <Link
                                                    to={`/admin/products/${product.id}/edit`}
                                                    className="uv-product-name"
                                                >
                                                    {product.name}
                                                </Link>

                                                <small>
                                                    ID: {product.id}
                                                </small>
                                            </div>
                                        </div>
                                    </td>

                                    <td>
                                        {product.categoryName}
                                    </td>

                                    <td className="uv-cell-name">
                                        {formatMoney(product.price)}
                                    </td>

                                    <td>
                                            <span
                                                className={
                                                    product.stock === 0
                                                        ? "uv-stock-out"
                                                        : product.stock <= 5
                                                            ? "uv-stock-low"
                                                            : ""
                                                }
                                            >
                                                {product.stock}
                                            </span>
                                    </td>

                                    <td>
                                        <div className="uv-actions">
                                            <Link
                                                to={`/admin/products/${product.id}/edit`}
                                                className="uv-icon-btn"
                                                title="Chỉnh sửa"
                                                aria-label="Chỉnh sửa"
                                            >
                                                <Pencil size={16} />
                                            </Link>

                                            <button
                                                className="uv-icon-btn danger"
                                                title="Xóa sản phẩm"
                                                aria-label="Xóa sản phẩm"
                                                disabled={deletingId !== null}
                                                onClick={() => handleDelete(product)}
                                            >
                                                <Trash2 size={16} />
                                            </button>

                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                <div className="uv-table-footer">
                    <span>
                        {totalElements} sản phẩm
                    </span>

                    <div className="uv-pagination">
                        <button
                            className="uv-icon-btn"
                            aria-label="Trang trước"
                            disabled={page === 0 || loading}
                            onClick={() =>
                                setPage((prev) => prev - 1)
                            }
                        >
                            <ChevronLeft size={17} />
                        </button>

                        <span>
                            Trang {totalPages === 0 ? 0 : page + 1}
                            /{totalPages}
                        </span>

                        <button
                            className="uv-icon-btn"
                            aria-label="Trang tiếp theo"
                            disabled={
                                page + 1 >= totalPages || loading
                            }
                            onClick={() =>
                                setPage((prev) => prev + 1)
                            }
                        >
                            <ChevronRight size={17} />
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
