
import { useEffect, useState } from "react";
import { Save, CheckSquare } from "lucide-react";
import api from "../../services/api.js";
import "../styles/AdminAttributes.css";

export default function AdminCategoryAttributes() {
    const [categories, setCategories] = useState([]);
    const [attributes, setAttributes] = useState([]);
    const [categoryId, setCategoryId] = useState("");
    const [selectedIds, setSelectedIds] = useState([]);
    const [originalIds, setOriginalIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingCategory, setLoadingCategory] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        async function loadData() {
            try {
                const [categoryRes, attributeRes] = await Promise.all([
                    api.get("/categories"),
                    api.get("/attributes"),
                ]);

                const categoryData = categoryRes.data;
                setCategories(
                    Array.isArray(categoryData)
                        ? categoryData
                        : categoryData.content ?? []
                );

                setAttributes(attributeRes.data);
            } catch (error) {
                console.error("Load data failed:", error);
                setMessage("Không thể tải danh mục hoặc thuộc tính.");
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);

    useEffect(() => {
        if (!categoryId) {
            setSelectedIds([]);
            setOriginalIds([]);
            return;
        }

        let cancelled = false;

        async function loadCategoryAttributes() {
            setLoadingCategory(true);
            setMessage("");

            try {
                const response = await api.get(
                    `/categories/${categoryId}/attributes`
                );

                const ids = response.data.map((a) => a.id);

                if (!cancelled) {
                    setSelectedIds(ids);
                    setOriginalIds(ids);
                }
            } catch (error) {
                console.error("Load category attributes failed:", error);
                if (!cancelled) {
                    setMessage("Không thể tải thuộc tính của danh mục.");
                }
            } finally {
                if (!cancelled) setLoadingCategory(false);
            }
        }

        loadCategoryAttributes();

        return () => {
            cancelled = true;
        };
    }, [categoryId]);

    function toggleAttribute(id) {
        setSelectedIds((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id]
        );
    }

    async function handleSave() {
        if (!categoryId || saving || loadingCategory) return;

        const toAdd = selectedIds.filter(
            (id) => !originalIds.includes(id)
        );

        const toRemove = originalIds.filter(
            (id) => !selectedIds.includes(id)
        );

        setSaving(true);
        setMessage("");

        try {
            for (const id of toAdd) {
                await api.post(
                    `/categories/${categoryId}/attributes/${id}`
                );
            }

            for (const id of toRemove) {
                await api.delete(
                    `/categories/${categoryId}/attributes/${id}`
                );
            }

            const response = await api.get(
                `/categories/${categoryId}/attributes`
            );

            const ids = response.data.map((a) => a.id);
            setSelectedIds(ids);
            setOriginalIds(ids);

            setMessage("Lưu thuộc tính danh mục thành công.");
        } catch (error) {
            console.error("Save category attributes failed:", error);
            setMessage(
                `Không thể lưu thay đổi. HTTP ${
                    error.response?.status ?? "Network Error"
                }`
            );
        } finally {
            setSaving(false);
        }
    }

    const groups = attributes.reduce((result, attribute) => {
        const key = attribute.groupId;
        if (!result[key]) result[key] = [];
        result[key].push(attribute);
        return result;
    }, {});

    return (
        <div className="attributes-page">
            <div className="attributes-header">
                <div>
                    <h1>Thuộc tính danh mục</h1>
                    <p>
                        Chọn các thuộc tính kỹ thuật áp dụng cho từng danh mục.
                    </p>
                </div>
            </div>

            <div className="attributes-card">
                <h2>Chọn danh mục</h2>

                <select
                    className="spec-input"
                    value={categoryId}
                    disabled={saving}
                    onChange={(e) => setCategoryId(e.target.value)}
                >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>
            </div>

            {message && <p className="spec-message">{message}</p>}

            {loading ? (
                <p>Đang tải dữ liệu...</p>
            ) : categoryId ? (
                <div className="spec-groups">
                    {loadingCategory ? (
                        <p>Đang tải thuộc tính danh mục...</p>
                    ) : (
                        <>
                            <div className="attributes-card">
                                <h2>Chọn thuộc tính</h2>

                                {Object.entries(groups).map(
                                    ([groupId, items]) => (
                                        <div
                                            key={groupId}
                                            className="category-attribute-group"
                                        >
                                            <h3>
                                                Nhóm thuộc tính #{groupId}
                                            </h3>

                                            <div className="category-attribute-list">
                                                {items.map((attribute) => (
                                                    <label
                                                        key={attribute.id}
                                                        className="category-attribute-item"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedIds.includes(
                                                                attribute.id
                                                            )}
                                                            disabled={saving}
                                                            onChange={() =>
                                                                toggleAttribute(
                                                                    attribute.id
                                                                )
                                                            }
                                                        />
                                                        <span>
                                                            {attribute.name}
                                                            {attribute.unit
                                                                ? ` (${attribute.unit})`
                                                                : ""}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                )}

                                {attributes.length === 0 && (
                                    <p>Chưa có thuộc tính nào.</p>
                                )}
                            </div>

                            <button
                                type="button"
                                className="spec-save-button"
                                disabled={saving}
                                onClick={handleSave}
                            >
                                <Save size={18} />
                                {saving
                                    ? "Đang lưu..."
                                    : "Lưu thuộc tính danh mục"}
                            </button>
                        </>
                    )}
                </div>
            ) : (
                <p>Chọn danh mục để thiết lập thuộc tính.</p>
            )}
        </div>
    );
}
