
import { useEffect, useState } from "react";
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    X,
} from "lucide-react";

import { adminService } from "../services/adminService";
import "../styles/AdminManagement.css";

const emptyForm = {
    name: "",
    description: "",
};

export default function AdminCategories() {
    const [categories, setCategories] = useState([]);
    const [keyword, setKeyword] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [formError, setFormError] = useState("");
    const [success, setSuccess] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);

    const loadCategories = async () => {
        try {
            setLoading(true);
            setError("");

            const data =
                await adminService.getCategories();

            setCategories(data);
        } catch (err) {
            setError("Không thể tải danh sách danh mục.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const openCreate = () => {
        setEditingId(null);
        setForm({ ...emptyForm });
        setFormError("");
        setModalOpen(true);
    };

    const openEdit = (category) => {
        setEditingId(category.id);

        setForm({
            name: category.name,
            description: category.description ?? "",
        });

        setFormError("");
        setModalOpen(true);
    };

    const closeModal = () => {
        if (saving) return;

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

        if (saving) return;

        if (!form.name.trim()) {
            setFormError("Vui lòng nhập tên danh mục.");
            return;
        }

        try {
            setSaving(true);
            setFormError("");
            setSuccess("");

            const payload = {
                name: form.name.trim(),
                description: form.description.trim(),
            };

            if (editingId !== null) {
                await adminService.updateCategory(
                    editingId,
                    payload
                );

                setSuccess("Cập nhật danh mục thành công.");
            } else {
                await adminService.createCategory(payload);

                setSuccess("Thêm danh mục thành công.");
            }

            setModalOpen(false);
            await loadCategories();
        } catch (err) {
            setFormError(
                err.response?.data?.message ||
                "Không thể lưu danh mục."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (category) => {
        const confirmed = window.confirm(
            `Bạn có chắc muốn xóa danh mục "${category.name}"?`
        );

        if (!confirmed) return;

        try {
            setError("");
            setSuccess("");

            await adminService.deleteCategory(category.id);

            setSuccess("Xóa danh mục thành công.");
            await loadCategories();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Không thể xóa danh mục. Hãy kiểm tra các sản phẩm liên quan."
            );
        }
    };

    const search = keyword.trim().toLowerCase();

    const filteredCategories = categories.filter(
        (category) =>
            category.name.toLowerCase().includes(search) ||
            (category.description ?? "")
                .toLowerCase()
                .includes(search)
    );

    return (
        <div className="uv-management">
            <div className="uv-management-heading">
                <div>
                    <h1>Danh mục</h1>
                    <p>
                        Quản lý danh mục sản phẩm của cửa hàng.
                    </p>
                </div>

                <button
                    className="uv-btn uv-btn-primary"
                    onClick={openCreate}
                >
                    <Plus size={17} />
                    Thêm danh mục
                </button>
            </div>

            {error && (
                <div className="uv-alert uv-alert-error">
                    {error}
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
                            placeholder="Tìm kiếm danh mục..."
                            value={keyword}
                            onChange={(e) =>
                                setKeyword(e.target.value)
                            }
                        />
                    </div>
                </div>

                <div className="uv-table-wrap">
                    <table className="uv-management-table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tên danh mục</th>
                            <th>Mô tả</th>
                            <th>Ngày tạo</th>
                            <th>Thao tác</th>
                        </tr>
                        </thead>

                        <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5}
                                    className="uv-empty">
                                    Đang tải dữ liệu...
                                </td>
                            </tr>
                        ) : filteredCategories.length === 0 ? (
                            <tr>
                                <td colSpan={5}
                                    className="uv-empty">
                                    Không tìm thấy danh mục.
                                </td>
                            </tr>
                        ) : (
                            filteredCategories.map((category) => (
                                <tr key={category.id}>
                                    <td>#{category.id}</td>

                                    <td className="uv-cell-name">
                                        {category.name}
                                    </td>

                                    <td className="uv-description">
                                        {category.description || "—"}
                                    </td>

                                    <td>
                                        {category.createdAt
                                            ? new Date(
                                                category.createdAt
                                            ).toLocaleDateString("vi-VN")
                                            : "—"}
                                    </td>

                                    <td>
                                        <div className="uv-actions">
                                            <button
                                                className="uv-icon-btn"
                                                title="Chỉnh sửa"
                                                aria-label="Chỉnh sửa"
                                                onClick={() =>
                                                    openEdit(category)
                                                }
                                            >
                                                <Pencil size={16} />
                                            </button>

                                            <button
                                                className="uv-icon-btn danger"
                                                title="Xóa danh mục"
                                                aria-label="Xóa danh mục"
                                                onClick={() =>
                                                    handleDelete(category)
                                                }
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
                    Hiển thị {filteredCategories.length}
                    /{categories.length} danh mục
                </div>
            </section>

            {modalOpen && (
                <div className="uv-modal-overlay">
                    <div
                        className="uv-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="category-modal-title"
                    >
                        <div className="uv-modal-header">
                            <h2 id="category-modal-title">
                                {editingId !== null
                                    ? "Chỉnh sửa danh mục"
                                    : "Thêm danh mục"}
                            </h2>

                            <button
                                className="uv-icon-btn"
                                aria-label="Đóng"
                                onClick={closeModal}
                                disabled={saving}
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
                                    <label htmlFor="category-name">
                                        Tên danh mục *
                                    </label>

                                    <input
                                        id="category-name"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        maxLength={100}
                                        required
                                        autoFocus
                                    />
                                </div>

                                <div className="uv-field">
                                    <label htmlFor="category-description">
                                        Mô tả
                                    </label>

                                    <textarea
                                        id="category-description"
                                        name="description"
                                        value={form.description}
                                        onChange={handleChange}
                                        maxLength={500}
                                        rows={4}
                                    />

                                    <small>
                                        {form.description.length}/500
                                    </small>
                                </div>
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
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Đang lưu..."
                                        : "Lưu danh mục"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
