
import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import api from "../../services/api.js";
import "../styles/AdminAttributes.css";

export default function AdminProductSpecifications() {
    const [products, setProducts] = useState([]);
    const [attributes, setAttributes] = useState([]);
    const [groups, setGroups] = useState([]);
    const [productId, setProductId] = useState("");
    const [values, setValues] = useState({});

    const [initialLoading, setInitialLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function loadInitialData() {
            try {
                const [productRes, groupRes] = await Promise.all([
                    api.get("/products", {
                        params: { page: 0, size: 100 },
                    }),
                    api.get("/attribute-groups"),
                ]);

                if (cancelled) return;

                const productData = productRes.data;

                setProducts(
                    Array.isArray(productData)
                        ? productData
                        : productData.content ?? []
                );

                setGroups(groupRes.data);
            } catch (error) {
                console.error(error);

                if (!cancelled) {
                    setMessage("Không thể tải danh sách sản phẩm.");
                }
            } finally {
                if (!cancelled) {
                    setInitialLoading(false);
                }
            }
        }

        loadInitialData();

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (!productId) {
            setAttributes([]);
            setValues({});
            setMessage("");
            return;
        }

        let cancelled = false;

        async function loadSpecifications() {
            setLoading(true);
            setAttributes([]);
            setValues({});
            setMessage("");

            try {
                const selectedProduct = products.find(
                    (product) =>
                        String(product.id) === String(productId)
                );

                if (!selectedProduct?.categoryId) {
                    throw new Error("Không tìm thấy danh mục sản phẩm.");
                }

                const [attributeRes, specificationRes] =
                    await Promise.all([
                        api.get(
                            `/categories/${selectedProduct.categoryId}/attributes`
                        ),
                        api.get(
                            `/products/${productId}/specifications`
                        ),
                    ]);

                if (cancelled) return;

                const categoryAttributes = attributeRes.data;

                const allowedIds = new Set(
                    categoryAttributes.map((attribute) =>
                        String(attribute.id)
                    )
                );

                const nextValues = {};

                specificationRes.data.forEach((group) => {
                    group.attributes.forEach((attribute) => {
                        const attributeId = String(
                            attribute.attributeId
                        );

                        if (allowedIds.has(attributeId)) {
                            nextValues[attributeId] =
                                attribute.value ?? "";
                        }
                    });
                });

                setAttributes(categoryAttributes);
                setValues(nextValues);
            } catch (error) {
                console.error(error);

                if (!cancelled) {
                    setMessage(
                        "Không thể tải thuộc tính hoặc thông số sản phẩm."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadSpecifications();

        return () => {
            cancelled = true;
        };
    }, [productId, products]);

    function handleValueChange(attributeId, value) {
        setValues((prev) => ({
            ...prev,
            [attributeId]: value,
        }));
    }

    async function handleSave() {
        if (!productId || saving || loading) return;

        const allowedIds = new Set(
            attributes.map((attribute) => String(attribute.id))
        );

        const entries = Object.entries(values).filter(
            ([attributeId, value]) =>
                allowedIds.has(attributeId) &&
                typeof value === "string" &&
                value.trim() !== ""
        );

        if (entries.length === 0) {
            setMessage("Vui lòng nhập ít nhất một thông số.");
            return;
        }

        setSaving(true);
        setMessage("");

        try {
            await Promise.all(
                entries.map(([attributeId, value]) =>
                    api.put(
                        `/products/${productId}/attributes/${attributeId}`,
                        { value: value.trim() }
                    )
                )
            );

            setMessage("Lưu thông số kỹ thuật thành công.");
        } catch (error) {
            console.error(error);

            setMessage(
                `Không thể lưu thông số. HTTP ${
                    error.response?.status ?? "Network Error"
                }`
            );
        } finally {
            setSaving(false);
        }
    }

    const selectedProduct = products.find(
        (product) => String(product.id) === String(productId)
    );

    const sortedGroups = [...groups].sort(
        (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    );

    return (
        <div className="attributes-page">
            <div className="attributes-header">
                <div>
                    <h1>Thông số kỹ thuật sản phẩm</h1>
                    <p>
                        Quản lý thông số kỹ thuật theo danh mục sản phẩm.
                    </p>
                </div>
            </div>

            <div className="attributes-card">
                <h2>Chọn sản phẩm</h2>

                <select
                    className="spec-input"
                    value={productId}
                    disabled={initialLoading || saving}
                    onChange={(e) => setProductId(e.target.value)}
                >
                    <option value="">-- Chọn sản phẩm --</option>

                    {products.map((product) => (
                        <option key={product.id} value={product.id}>
                            {product.name}
                        </option>
                    ))}
                </select>

                {selectedProduct && (
                    <p style={{ marginTop: 12 }}>
                        Danh mục:{" "}
                        <strong>{selectedProduct.categoryName}</strong>
                    </p>
                )}
            </div>

            {message && (
                <p className="spec-message">{message}</p>
            )}

            {initialLoading || loading ? (
                <p>Đang tải dữ liệu...</p>
            ) : productId ? (
                <div className="spec-groups">
                    {attributes.length === 0 ? (
                        <div className="attributes-card">
                            <p>
                                Danh mục này chưa được gán thuộc tính.
                                Hãy vào mục Thuộc tính danh mục để
                                thiết lập.
                            </p>
                        </div>
                    ) : (
                        <>
                            {sortedGroups.map((group) => {
                                const groupAttributes = attributes
                                    .filter(
                                        (attribute) =>
                                            String(attribute.groupId) ===
                                            String(group.id)
                                    )
                                    .sort(
                                        (a, b) =>
                                            (a.sortOrder ?? 0) -
                                            (b.sortOrder ?? 0)
                                    );

                                if (groupAttributes.length === 0) {
                                    return null;
                                }

                                return (
                                    <div
                                        className="attributes-card"
                                        key={group.id}
                                    >
                                        <h2>{group.name}</h2>

                                        <div className="spec-fields">
                                            {groupAttributes.map(
                                                (attribute) => (
                                                    <div
                                                        className="spec-field"
                                                        key={attribute.id}
                                                    >
                                                        <label
                                                            htmlFor={`attr-${attribute.id}`}
                                                        >
                                                            {attribute.name}
                                                            {attribute.unit &&
                                                                ` (${attribute.unit})`}
                                                        </label>

                                                        <input
                                                            id={`attr-${attribute.id}`}
                                                            className="spec-input"
                                                            type="text"
                                                            maxLength={500}
                                                            placeholder={`Nhập ${attribute.name}`}
                                                            value={
                                                                values[
                                                                    attribute.id
                                                                    ] ?? ""
                                                            }
                                                            onChange={(e) =>
                                                                handleValueChange(
                                                                    attribute.id,
                                                                    e.target.value
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            <button
                                type="button"
                                className="spec-save-button"
                                disabled={saving}
                                onClick={handleSave}
                            >
                                <Save size={18} />
                                {saving
                                    ? "Đang lưu..."
                                    : "Lưu thông số"}
                            </button>
                        </>
                    )}
                </div>
            ) : (
                <p>
                    Chọn sản phẩm để chỉnh sửa thông số kỹ thuật.
                </p>
            )}
        </div>
    );
}
