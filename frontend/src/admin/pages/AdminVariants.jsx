
import { useEffect, useState } from "react";
import ImageUpload from "../components/ImageUpload";

import {
    Plus,
    Search,
    Pencil,
    Trash2,
    X,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

import { adminService } from "../services/adminService";
import "../styles/AdminManagement.css";
import "../styles/AdminVariants.css";

const PAGE_SIZE = 10;

const emptyForm = {
    productId: "",
    sku: "",
    color: "",
    storage: "",
    price: "",
    stock: "0",
    imageUrl: "",
};

const formatMoney = (value) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(value);

export default function AdminVariants() {
    const [variants, setVariants] = useState([]);
    const [products, setProducts] = useState([]);
    const [deletingId, setDeletingId] = useState(null);

    const [statistics, setStatistics] = useState({
        totalVariants: 0,
        lowStockVariants: 0,
        outOfStockVariants: 0,
    });

    const [keyword, setKeyword] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [productId, setProductId] = useState("");
    const [stockStatus, setStockStatus] = useState("ALL");

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [reload, setReload] = useState(0);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [error, setError] = useState("");
    const [productError, setProductError] = useState("");
    const [statisticsError, setStatisticsError] = useState("");
    const [formError, setFormError] = useState("");
    const [success, setSuccess] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);


    // Load products for dropdown

    useEffect(() => {
        let active = true;

        const loadProducts = async () => {
            try {
                const firstPage =
                    await adminService.getProducts({
                        page: 0,
                        size: 100,
                        sortBy: "name",
                        sortDir: "asc",
                    });

                const allProducts = [
                    ...(firstPage.content ?? []),
                ];

                for (
                    let p = 1;
                    p < firstPage.totalPages;
                    p++
                ) {
                    const data =
                        await adminService.getProducts({
                            page: p,
                            size: 100,
                            sortBy: "name",
                            sortDir: "asc",
                        });

                    allProducts.push(
                        ...(data.content ?? [])
                    );
                }

                if (active) {
                    setProducts(allProducts);
                }
            } catch (err) {
                if (active) {
                    setProductError(
                        "Không thể tải danh sách sản phẩm."
                    );
                }
            }
        };

        loadProducts();

        return () => {
            active = false;
        };
    }, []);

    // Search debounce

    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(0);
            setSearchTerm(keyword.trim());
        }, 350);

        return () => clearTimeout(timer);
    }, [keyword]);

    // Load statistics

    useEffect(() => {
        let active = true;

        adminService.getVariantStatistics()
            .then((data) => {
                if (active) {
                    setStatistics(data);
                    setStatisticsError("");
                }
            })
            .catch(() => {
                if (active) {
                    setStatisticsError(
                        "Không thể tải thống kê tồn kho."
                    );
                }
            });

        return () => {
            active = false;
        };
    }, [reload]);

    // Load variants

    useEffect(() => {
        let active = true;

        const loadVariants = async () => {
            try {
                setLoading(true);
                setError("");

                const data =
                    await adminService.getVariants({
                        keyword: searchTerm,
                        productId: productId || undefined,
                        stockStatus,
                        page,
                        size: PAGE_SIZE,
                    });

                if (!active) return;

                const pages = data.totalPages ?? 0;

                if (page > 0 && page >= pages) {
                    setPage(Math.max(0, pages - 1));
                    return;
                }

                setVariants(data.content ?? []);
                setTotalPages(pages);
                setTotalElements(data.totalElements ?? 0);

            } catch (err) {
                if (active) {
                    setError(
                        err.response?.data?.message ||
                        "Không thể tải danh sách biến thể."
                    );
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        loadVariants();

        return () => {
            active = false;
        };
    }, [
        searchTerm,
        productId,
        stockStatus,
        page,
        reload,
    ]);

    const changeStockFilter = (value) => {
        setStockStatus(value);
        setPage(0);
    };

    const openCreate = () => {
        setEditingId(null);

        setForm({
            ...emptyForm,
            productId,
        });

        setFormError("");
        setModalOpen(true);
    };

    const openEdit = (variant) => {
        setEditingId(variant.id);

        setForm({
            productId: String(variant.productId),
            sku: variant.sku,
            color: variant.color ?? "",
            storage: variant.storage ?? "",
            price: String(variant.price),
            stock: String(variant.stock),
            imageUrl: variant.imageUrl ?? "",
        });

        setFormError("");
        setModalOpen(true);
    };

    const closeModal = () => {
        if (saving || uploading) return;

        setModalOpen(false);
        setFormError("");
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (saving || uploading) return;

        setFormError("");

        const price = Number(form.price);
        const stock = Number(form.stock);

        if (!form.productId) {
            setFormError("Vui lòng chọn sản phẩm.");
            return;
        }

        if (
            !form.sku.trim() ||
            !form.color.trim() ||
            !form.storage.trim()
        ) {
            setFormError(
                "Vui lòng nhập đầy đủ SKU, màu sắc và dung lượng."
            );
            return;
        }

        if (
            !form.price.trim() ||
            !Number.isFinite(price) ||
            price <= 0 ||
            price >= 1e13
        ) {
            setFormError("Giá bán không hợp lệ.");
            return;
        }

        if (
            !form.stock.trim() ||
            !Number.isInteger(stock) ||
            stock < 0 ||
            stock > 2147483647
        ) {
            setFormError(
                "Tồn kho phải là số nguyên không âm hợp lệ."
            );
            return;
        }

        try {
            setSaving(true);
            setSuccess("");

            if (editingId !== null) {
                await adminService.updateVariant(
                    editingId,
                    {
                        price,
                        stock,
                        imageUrl: form.imageUrl.trim() || null,
                    }
                );

                setSuccess(
                    "Cập nhật biến thể thành công."
                );
            } else {
                await adminService.createVariant(
                    form.productId,
                    {
                        sku: form.sku.trim(),
                        color: form.color.trim(),
                        storage: form.storage.trim(),
                        price,
                        stock,
                        imageUrl: form.imageUrl.trim() || null,
                    }
                );

                setSuccess(
                    "Thêm biến thể thành công."
                );
            }

            setModalOpen(false);
            setReload((prev) => prev + 1);

        } catch (err) {
            setFormError(
                err.response?.data?.message ||
                (
                    err.response?.status === 409
                        ? "SKU hoặc biến thể đã tồn tại."
                        : "Không thể lưu biến thể."
                )
            );
        } finally {
            setSaving(false);
        }
    };


    const handleDelete = async (variant) => {
        if (deletingId !== null) return;

        const confirmed = window.confirm(
            `Bạn có chắc muốn xóa biến thể "${variant.sku}"?\n\n` +
            "Thao tác này không thể hoàn tác."
        );

        if (!confirmed) return;

        try {
            setDeletingId(variant.id);
            setError("");
            setSuccess("");

            await adminService.deleteVariant(variant.id);

            setSuccess("Xóa biến thể thành công.");

            setReload((prev) => prev + 1);

        } catch (err) {
            const status = err.response?.status;

            if (status === 409) {
                setError(
                    "Không thể xóa biến thể vì đang được sử dụng " +
                    "trong giỏ hàng hoặc đơn hàng. " +
                    "Bạn có thể cập nhật tồn kho về 0 để ngừng bán."
                );
            } else if (status === 404) {
                setError("Biến thể không còn tồn tại.");
            } else {
                setError(
                    err.response?.data?.message ||
                    "Không thể xóa biến thể."
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
                    <h1>Biến thể sản phẩm</h1>
                    <p>
                        Quản lý SKU, giá bán và tồn kho.
                    </p>
                </div>

                <button
                    className="uv-btn uv-btn-primary"
                    onClick={openCreate}
                    disabled={Boolean(productError)}
                >
                    <Plus size={17} />
                    Thêm biến thể
                </button>
            </div>

            {(error || productError || statisticsError) && (
                <div className="uv-alert uv-alert-error">
                    {error || productError || statisticsError}
                </div>
            )}

            {success && (
                <div className="uv-alert uv-alert-success">
                    {success}
                </div>
            )}

            {/* Statistics */}

            <div className="uv-variant-summary">
                <button
                    type="button"
                    className={`uv-variant-stat ${
                        stockStatus === "ALL" ? "active" : ""
                    }`}
                    onClick={() =>
                        changeStockFilter("ALL")
                    }
                >
                    <span>Tổng biến thể</span>
                    <strong>
                        {statisticsError
                            ? "—"
                            : statistics.totalVariants}
                    </strong>
                    <small>Tất cả SKU</small>
                </button>

                <button
                    type="button"
                    className={`uv-variant-stat ${
                        stockStatus === "LOW_STOCK"
                            ? "active"
                            : ""
                    }`}
                    onClick={() =>
                        changeStockFilter("LOW_STOCK")
                    }
                >
                    <span>Sắp hết hàng</span>

                    <strong className="uv-stock-low">
                        {statisticsError
                            ? "—"
                            : statistics.lowStockVariants}
                    </strong>

                    <small>Còn từ 1 đến 5 sản phẩm</small>
                </button>

                <button
                    type="button"
                    className={`uv-variant-stat ${
                        stockStatus === "OUT_OF_STOCK"
                            ? "active"
                            : ""
                    }`}
                    onClick={() =>
                        changeStockFilter("OUT_OF_STOCK")
                    }
                >
                    <span>Hết hàng</span>

                    <strong className="uv-stock-out">
                        {statisticsError
                            ? "—"
                            : statistics.outOfStockVariants}
                    </strong>

                    <small>Không còn tồn kho</small>
                </button>
            </div>

            {/* Table */}

            <section className="uv-management-panel">
                <div className="uv-management-toolbar">
                    <div className="uv-search">
                        <Search size={17} />

                        <input
                            placeholder="Tìm sản phẩm, SKU..."
                            value={keyword}
                            onChange={(e) =>
                                setKeyword(e.target.value)
                            }
                        />
                    </div>

                    <select
                        className="uv-filter uv-variant-product-filter"
                        value={productId}
                        onChange={(e) => {
                            setProductId(e.target.value);
                            setPage(0);
                        }}
                    >
                        <option value="">
                            Tất cả sản phẩm
                        </option>

                        {products.map((product) => (
                            <option
                                key={product.id}
                                value={product.id}
                            >
                                {product.name}
                            </option>
                        ))}
                    </select>

                    <select
                        className="uv-filter"
                        value={stockStatus}
                        onChange={(e) =>
                            changeStockFilter(e.target.value)
                        }
                    >
                        <option value="ALL">
                            Tất cả tồn kho
                        </option>

                        <option value="IN_STOCK">
                            Tồn kho trên 5
                        </option>

                        <option value="LOW_STOCK">
                            Sắp hết hàng
                        </option>

                        <option value="OUT_OF_STOCK">
                            Hết hàng
                        </option>
                    </select>
                </div>

                <div className="uv-table-wrap">
                    <table className="uv-management-table uv-variant-table">
                        <thead>
                        <tr>
                            <th>Sản phẩm / SKU</th>
                            <th>Màu sắc</th>
                            <th>Dung lượng</th>
                            <th>Giá bán</th>
                            <th>Tồn kho</th>
                            <th>Thao tác</th>
                        </tr>
                        </thead>

                        <tbody>
                        {loading ? (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="uv-empty"
                                >
                                    Đang tải biến thể...
                                </td>
                            </tr>
                        ) : variants.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="uv-empty"
                                >
                                    Không tìm thấy biến thể.
                                </td>
                            </tr>
                        ) : (
                            variants.map((variant) => (
                                <tr key={variant.id}>
                                    <td>
                                        <div className="uv-variant-product-cell">

                                            <img
                                                className="uv-variant-thumbnail"
                                                src={
                                                    variant.imageUrl ||
                                                    products.find(
                                                        (p) => p.id === variant.productId
                                                    )?.imageUrl ||
                                                    "/images/product-placeholder.png"
                                                }
                                                alt={variant.productName}
                                                loading="lazy"
                                                onError={(e) => {
                                                    const fallback = "/images/product-placeholder.png";

                                                    if (!e.currentTarget.src.endsWith(fallback)) {
                                                        e.currentTarget.src = fallback;
                                                    }
                                                }}
                                            />

                                            <div className="uv-variant-name">
                                                <strong>{variant.productName}</strong>
                                                <small>{variant.sku}</small>
                                            </div>

                                        </div>
                                    </td>

                                    <td>
                                        {variant.color || "—"}
                                    </td>

                                    <td>
                                        {variant.storage || "—"}
                                    </td>

                                    <td className="uv-cell-name">
                                        {formatMoney(variant.price)}
                                    </td>

                                    <td>
                                        <div className="uv-variant-stock">
                                            <strong
                                                className={
                                                    variant.stock === 0
                                                        ? "uv-stock-out"
                                                        : variant.stock <= 5
                                                            ? "uv-stock-low"
                                                            : ""
                                                }
                                            >
                                                {variant.stock}
                                            </strong>

                                            <small>
                                                {variant.stock === 0
                                                    ? "Hết hàng"
                                                    : variant.stock <= 5
                                                        ? "Sắp hết hàng"
                                                        : "Còn hàng"}
                                            </small>
                                        </div>
                                    </td>


                                    <td>
                                        <div className="uv-actions">
                                            <button
                                                className="uv-icon-btn"
                                                title="Chỉnh sửa"
                                                aria-label="Chỉnh sửa biến thể"
                                                disabled={deletingId !== null}
                                                onClick={() => openEdit(variant)}
                                            >
                                                <Pencil size={16} />
                                            </button>

                                            <button
                                                className="uv-icon-btn danger"
                                                title="Xóa biến thể"
                                                aria-label="Xóa biến thể"
                                                disabled={deletingId !== null}
                                                onClick={() => handleDelete(variant)}
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
                        {totalElements} biến thể
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

            {/* Create / Edit modal */}

            {modalOpen && (
                <div className="uv-modal-overlay">
                    <div
                        className="uv-modal uv-variant-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="variant-modal-title"
                    >
                        <div className="uv-modal-header">
                            <h2 id="variant-modal-title">
                                {editingId !== null
                                    ? "Chỉnh sửa biến thể"
                                    : "Thêm biến thể"}
                            </h2>

                            <button
                                className="uv-icon-btn"
                                aria-label="Đóng"
                                disabled={saving}
                                onClick={closeModal}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="uv-modal-body">
                                {formError && (
                                    <div className="uv-alert uv-alert-error">
                                        {formError}
                                    </div>
                                )}

                                <div className="uv-field">
                                    <label htmlFor="variant-product">
                                        Sản phẩm *
                                    </label>

                                    <select
                                        id="variant-product"
                                        name="productId"
                                        value={form.productId}
                                        onChange={handleChange}
                                        disabled={editingId !== null || saving}
                                        required
                                    >
                                        <option value="">
                                            Chọn sản phẩm
                                        </option>

                                        {products.map((product) => (
                                            <option
                                                key={product.id}
                                                value={product.id}
                                            >
                                                {product.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="uv-field">
                                    <label htmlFor="variant-sku">
                                        SKU *
                                    </label>

                                    <input
                                        id="variant-sku"
                                        name="sku"
                                        value={form.sku}
                                        onChange={handleChange}
                                        maxLength={100}
                                        placeholder="VD: IP17PRO-ORANGE-256"
                                        disabled={editingId !== null || saving}
                                        required
                                    />
                                </div>

                                <div className="uv-form-row">
                                    <div className="uv-field">
                                        <label htmlFor="variant-color">
                                            Màu sắc *
                                        </label>

                                        <input
                                            id="variant-color"
                                            name="color"
                                            value={form.color}
                                            onChange={handleChange}
                                            maxLength={100}
                                            placeholder="Cam vũ trụ"
                                            disabled={editingId !== null || saving}
                                            required
                                        />
                                    </div>

                                    <div className="uv-field">
                                        <label htmlFor="variant-storage">
                                            Dung lượng *
                                        </label>

                                        <input
                                            id="variant-storage"
                                            name="storage"
                                            value={form.storage}
                                            onChange={handleChange}
                                            maxLength={100}
                                            placeholder="256GB"
                                            disabled={editingId !== null || saving}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="uv-form-row uv-variant-price-row">
                                    <div className="uv-field">
                                        <label htmlFor="variant-price">
                                            Giá bán (VNĐ) *
                                        </label>

                                        <input
                                            id="variant-price"
                                            type="number"
                                            name="price"
                                            min="0.01"
                                            step="0.01"
                                            max="9999999999999.99"
                                            value={form.price}
                                            onChange={handleChange}
                                            disabled={saving}
                                            required
                                        />
                                    </div>

                                    <div className="uv-field">
                                        <label htmlFor="variant-stock">
                                            Tồn kho *
                                        </label>

                                        <input
                                            id="variant-stock"
                                            type="number"
                                            name="stock"
                                            min="0"
                                            max="2147483647"
                                            step="1"
                                            value={form.stock}
                                            onChange={handleChange}
                                            disabled={saving}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="uv-field">
                                    <label>Hình ảnh biến thể</label>

                                    <ImageUpload
                                        value={form.imageUrl}
                                        onChange={(imageUrl) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                imageUrl,
                                            }))
                                        }
                                        onUploadingChange={setUploading}
                                        disabled={saving || uploading}
                                    />

                                    <small className="uv-form-hint">
                                        Không bắt buộc. Nếu không có ảnh riêng,
                                        hệ thống sẽ sử dụng ảnh gốc của sản phẩm.
                                    </small>
                                </div>

                                {editingId !== null && (
                                    <p className="uv-form-hint">
                                        SKU, màu sắc và dung lượng
                                        không thể thay đổi.
                                        Chỉ cập nhật giá bán và tồn kho.
                                        Tồn kho bằng 0 sẽ ngừng bán
                                        biến thể này.
                                    </p>
                                )}
                            </div>

                            <div className="uv-modal-footer">
                                <button
                                    type="button"
                                    className="uv-btn uv-btn-secondary"
                                    onClick={closeModal}
                                    disabled={saving}
                                >
                                    Hủy
                                </button>

                                <button
                                    type="submit"
                                    className="uv-btn uv-btn-primary"
                                    disabled={saving || uploading}
                                >
                                    {uploading
                                        ? "Đang tải ảnh..."
                                        : saving
                                            ? "Đang lưu..."
                                            : "Lưu biến thể"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
