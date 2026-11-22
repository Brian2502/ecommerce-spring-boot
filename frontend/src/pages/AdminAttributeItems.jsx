import { useEffect, useState } from "react";
import { Plus, ListTree } from "lucide-react";
import api from "../services/api";

import "./AdminAttributes.css";

export default function AdminAttributeItems() {
    const [groups, setGroups] = useState([]);
    const [attributes, setAttributes] = useState([]);

    const [groupId, setGroupId] = useState("");
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [unit, setUnit] = useState("");
    const [sortOrder, setSortOrder] = useState(0);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    async function loadData() {
        setLoading(true);

        try {
            const groupsResponse = await api.get("/attribute-groups");
            setGroups(groupsResponse.data);
        } catch (error) {
            console.error("Load groups failed:", error);
            setMessage("Không thể tải nhóm thuộc tính.");
        }

        try {
            const attributesResponse = await api.get("/attributes");
            setAttributes(attributesResponse.data);
        } catch (error) {
            console.error("Load attributes failed:", error);
            setMessage("Không thể tải danh sách thuộc tính.");
        }

        setLoading(false);
    }

    useEffect(() => {
        loadData();
    }, []);

    async function handleSubmit(event) {
        event.preventDefault();

        if (!groupId || !name.trim() || !code.trim() || saving) {
            return;
        }

        try {
            setSaving(true);
            setMessage("");

            await api.post("/attributes", {
                groupId: Number(groupId),
                name: name.trim(),
                code: code.trim(),
                unit: unit.trim() || null,
                sortOrder: Number(sortOrder),
            });

            setName("");
            setCode("");
            setUnit("");
            setSortOrder(0);

            setMessage("Thêm thuộc tính thành công.");

            await loadData();
        } catch (error) {
            console.error(error);

            setMessage(
                error.response?.status === 409
                    ? "Mã thuộc tính đã tồn tại trong nhóm."
                    : "Không thể thêm thuộc tính."
            );
        } finally {
            setSaving(false);
        }
    }

    function getGroupName(id) {
        return groups.find((group) => group.id === id)?.name ?? "—";
    }

    return (
        <div className="attributes-page">
            <div className="attributes-heading">
                <div>
                    <h1>Quản lý thuộc tính</h1>
                    <p>
                        Tạo các thông số kỹ thuật để sử dụng cho sản phẩm.
                    </p>
                </div>

                <div className="attributes-count">
                    <ListTree size={18} />
                    {attributes.length} thuộc tính
                </div>
            </div>

            <div className="attributes-card">
                <div className="attributes-card-header">
                    <h2>Thêm thuộc tính</h2>
                    <p>
                        Chọn nhóm và nhập thông tin thuộc tính mới.
                    </p>
                </div>

                <form
                    className="attributes-form attributes-form-wrap"
                    onSubmit={handleSubmit}
                >
                    <div className="attributes-field">
                        <label htmlFor="attribute-group">Nhóm</label>
                        <select
                            id="attribute-group"
                            value={groupId}
                            onChange={(e) => setGroupId(e.target.value)}
                            required
                        >
                            <option value="">Chọn nhóm</option>
                            {groups.map((group) => (
                                <option key={group.id} value={group.id}>
                                    {group.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="attributes-field">
                        <label htmlFor="attribute-name">Tên thuộc tính</label>
                        <input
                            id="attribute-name"
                            placeholder="Ví dụ: RAM"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="attributes-field">
                        <label htmlFor="attribute-code">Mã</label>
                        <input
                            id="attribute-code"
                            placeholder="Ví dụ: ram"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            required
                        />
                    </div>

                    <div className="attributes-field">
                        <label htmlFor="attribute-unit">Đơn vị</label>
                        <input
                            id="attribute-unit"
                            placeholder="Ví dụ: GB"
                            value={unit}
                            onChange={(e) => setUnit(e.target.value)}
                        />
                    </div>

                    <div className="attributes-field">
                        <label htmlFor="attribute-order">Thứ tự</label>
                        <input
                            id="attribute-order"
                            type="number"
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className="attributes-add-btn"
                        disabled={saving || groups.length === 0}
                    >
                        <Plus size={18} />
                        {saving ? "Đang lưu..." : "Thêm thuộc tính"}
                    </button>
                </form>

                {message && (
                    <p className="attributes-message" role="status">
                        {message}
                    </p>
                )}
            </div>

            <div className="attributes-card">
                <div className="attributes-card-header">
                    <h2>Danh sách thuộc tính</h2>
                </div>

                {loading ? (
                    <p className="attributes-empty">Đang tải...</p>
                ) : attributes.length === 0 ? (
                    <p className="attributes-empty">
                        Chưa có thuộc tính.
                    </p>
                ) : (
                    <div className="attributes-table-wrap">
                        <table className="attributes-table">
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nhóm</th>
                                <th>Tên thuộc tính</th>
                                <th>Mã</th>
                                <th>Đơn vị</th>
                                <th>Thứ tự</th>
                            </tr>
                            </thead>
                            <tbody>
                            {attributes.map((attribute) => (
                                <tr key={attribute.id}>
                                    <td>#{attribute.id}</td>
                                    <td>{getGroupName(attribute.groupId)}</td>
                                    <td><strong>{attribute.name}</strong></td>
                                    <td>{attribute.code}</td>
                                    <td>{attribute.unit || "—"}</td>
                                    <td>{attribute.sortOrder}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}