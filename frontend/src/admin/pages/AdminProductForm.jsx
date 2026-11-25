
import { useEffect, useState } from "react";
import {
    Link,
    useNavigate,
    useParams,
} from "react-router-dom";
import ImageUpload from "../components/ImageUpload";
import {
    ArrowLeft,
    Save,
} from "lucide-react";

import { adminService } from "../services/adminService";
import "../styles/AdminManagement.css";

const emptyForm = {
    name: "",
    description: "",
    imageUrl: "",
    price: "",
    stock: "0",
    categoryId: "",
};

export default function AdminProductForm() {
    const { id } = useParams();
    const navigate = useNavigate();

    const isEdit = Boolean(id);

    const [form, setForm] = useState(emptyForm);
    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);
    const [loadFailed, setLoadFailed] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        let active = true;

        const loadData = async () => {
            try {
                setLoading(true);
                setLoadFailed(false);
                setError("");

                const [categoryData, product] =
                    await Promise.all([
                        adminService.getCategories(),
                        isEdit
                            ? adminService.getProductById(id)
                            : Promise.resolve(null),
                    ]);

                if (!active) return;

                setCategories(categoryData);

                if (product) {
                    setForm({
                        name: product.name ?? "",
                        description: product.description ?? "",
                        imageUrl: product.imageUrl ?? "",
                        price: String(product.price ?? ""),
                        stock: String(product.stock ?? 0),
                        categoryId: String(
                            product.categoryId ?? ""
                        ),
                    });
                } else {
                    setForm({ ...emptyForm });
                }
            } catch (err) {
                if (active) {
                    setLoadFailed(true);
                    setError("Không thể tải dữ liệu sản phẩm.");
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        loadData();

        return () => {
            active = false;
        };
    }, [id, isEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (saving || uploading || loadFailed) return;

        setError("");

        const price = Number(form.price);
        const stock = Number(form.stock);

        if (!form.name.trim()) {
            setError("Vui lòng nhập tên sản phẩm.");
            return;
        }

        if (
            !form.price.trim() ||
            !Number.isFinite(price) ||
            price <= 0
        ) {
            setError("Giá bán phải lớn hơn 0.");
            return;
        }

        if (
            !form.stock.trim() ||
            !Number.isInteger(stock) ||
            stock < 0 ||
            stock > 2147483647
        ) {
            setError("Tồn kho phải là số nguyên hợp lệ.");
            return;
        }

        if (!form.categoryId) {
            setError("Vui lòng chọn danh mục.");
            return;
        }

        const payload = {
            name: form.name.trim(),
            description: form.description.trim(),
            imageUrl: form.imageUrl.trim(),
            price,
            stock,
            categoryId: Number(form.categoryId),
        };

        try {
            setSaving(true);

            if (isEdit) {
                await adminService.updateProduct(id, payload);
            } else {
                await adminService.createProduct(payload);
            }

            navigate("/admin/products");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Không thể lưu sản phẩm."
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="uv-management">
            <Link
                to="/admin/products"
                className="uv-back-link"
            >
                <ArrowLeft size={16} />
                Quay lại danh sách sản phẩm
            </Link>

            <div className="uv-management-heading">
                <div>
                    <h1>
                        {isEdit
                            ? "Chỉnh sửa sản phẩm"
                            : "Thêm sản phẩm"}
                    </h1>

                    <p>
                        {isEdit
                            ? `Cập nhật thông tin sản phẩm #${id}`
                            : "Tạo sản phẩm mới cho cửa hàng"}
                    </p>
                </div>
            </div>

            {error && (
                <div className="uv-alert uv-alert-error">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="uv-management-panel uv-empty">
                    Đang tải dữ liệu...
                </div>
            ) : !loadFailed && (
                <form onSubmit={handleSubmit}>
                    <div className="uv-product-form-grid">
                        <section className="uv-management-panel">
                            <div className="uv-section-heading">
                                Thông tin sản phẩm
                            </div>

                            <div className="uv-form-body">
                                <div className="uv-field">
                                    <label htmlFor="product-name">
                                        Tên sản phẩm *
                                    </label>

                                    <input
                                        id="product-name"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        maxLength={200}
                                        required
                                        placeholder="Nhập tên sản phẩm"
                                    />
                                </div>

                                <div className="uv-field">
                                    <label htmlFor="product-category">
                                        Danh mục *
                                    </label>

                                    <select
                                        id="product-category"
                                        name="categoryId"
                                        value={form.categoryId}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">
                                            Chọn danh mục
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
                                </div>

                                <div className="uv-field">
                                    <label htmlFor="product-description">
                                        Mô tả sản phẩm
                                    </label>

                                    <textarea
                                        id="product-description"
                                        name="description"
                                        value={form.description}
                                        onChange={handleChange}
                                        maxLength={1000}
                                        rows={6}
                                        placeholder="Nhập mô tả sản phẩm"
                                    />

                                    <small>
                                        {form.description.length}/1000
                                    </small>
                                </div>

                                <div className="uv-form-row">
                                    <div className="uv-field">
                                        <label htmlFor="product-price">
                                            Giá bán (VNĐ) *
                                        </label>

                                        <input
                                            id="product-price"
                                            type="number"
                                            name="price"
                                            min="0.01"
                                            step="0.01"
                                            value={form.price}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="uv-field">
                                        <label htmlFor="product-stock">
                                            Tồn kho gốc *
                                        </label>

                                        <input
                                            id="product-stock"
                                            type="number"
                                            name="stock"
                                            min="0"
                                            max="2147483647"
                                            step="1"
                                            value={form.stock}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <p className="uv-form-hint">
                                    Đối với sản phẩm có biến thể,
                                    giá bán và tồn kho thực tế được
                                    quản lý theo từng SKU.
                                </p>
                            </div>
                        </section>

                        <section className="uv-management-panel">
                            <div className="uv-section-heading">
                                Hình ảnh sản phẩm
                            </div>

                            <div className="uv-form-body">
                                <ImageUpload
                                    value={form.imageUrl}
                                    onChange={(imageUrl) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            imageUrl,
                                        }))
                                    }
                                    onUploadingChange={setUploading}
                                    disabled={saving}
                                />
                            </div>
                        </section>
                    </div>

                    <div className="uv-form-footer">
                        <Link
                            to="/admin/products"
                            className="uv-btn uv-btn-secondary"
                        >
                            Hủy
                        </Link>

                        <button
                            type="submit"
                            className="uv-btn uv-btn-primary"
                            disabled={saving || uploading}
                        >
                            <Save size={16} />

                            {uploading
                                ? "Đang tải ảnh..."
                                : saving
                                    ? "Đang lưu..."
                                    : "Lưu sản phẩm"}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
