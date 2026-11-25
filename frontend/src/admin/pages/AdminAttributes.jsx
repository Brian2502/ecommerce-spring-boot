import { useEffect, useState } from "react";
import api from "../../services/api.js";
import { Plus, Layers3 } from "lucide-react";
import "../styles/AdminAttributes.css";

export default function AdminAttributes() {
    const [groups, setGroups] = useState([]);
    const [name, setName] = useState("");
    const [sortOrder, setSortOrder] = useState(0);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    async function loadGroups() {
        try {
            setLoading(true);
            const response = await api.get("/attribute-groups");
            setGroups(response.data);
        } catch (error) {
            console.error(error);
            setMessage("Không thể tải danh sách nhóm thuộc tính.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadGroups();
    }, []);

    async function handleSubmit(event) {
        event.preventDefault();

        if (!name.trim() || saving) return;

        try {
            setSaving(true);
            setMessage("");

            await api.post("/attribute-groups", {
                name: name.trim(),
                sortOrder: Number(sortOrder),
            });

            setName("");
            setSortOrder(0);
            setMessage("Tạo nhóm thuộc tính thành công.");

            await loadGroups();
        } catch (error) {
            console.error(error);

            setMessage(
                error.response?.status === 409
                    ? "Tên nhóm thuộc tính đã tồn tại."
                    : "Không thể tạo nhóm thuộc tính."
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="attributes-page">
            <div className="attributes-heading">
                <div>
                    <h1>Nhóm thuộc tính</h1>
                    <p>
                        Quản lý các nhóm thông số kỹ thuật của sản phẩm.
                    </p>
                </div>

                <div className="attributes-count">
                    <Layers3 size={18} />
                    {groups.length} nhóm
                </div>
            </div>

            <div className="attributes-card">
                <div className="attributes-card-header">
                    <h2>Thêm nhóm thuộc tính</h2>
                    <p>Tạo nhóm mới để phân loại thông số sản phẩm.</p>
                </div>

                <form
                    className="attributes-form"
                    onSubmit={handleSubmit}
                >
                    <div className="attributes-field">
                        <label>Tên nhóm</label>
                        <input
                            type="text"
                            placeholder="Ví dụ: Màn hình, Cấu hình..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="attributes-field">
                        <label>Thứ tự</label>
                        <input
                            type="number"
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className="attributes-add-btn"
                        disabled={saving}
                    >
                        <Plus size={18} />
                        {saving ? "Đang lưu..." : "Thêm nhóm"}
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
                    <h2>Danh sách nhóm thuộc tính</h2>
                    <p>Danh sách các nhóm hiện có trong hệ thống.</p>
                </div>

                {loading ? (
                    <p className="attributes-empty">Đang tải...</p>
                ) : groups.length === 0 ? (
                    <p className="attributes-empty">
                        Chưa có nhóm thuộc tính.
                    </p>
                ) : (
                    <div className="attributes-table-wrap">
                        <table className="attributes-table">
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>Tên nhóm</th>
                                <th>Thứ tự</th>
                            </tr>
                            </thead>

                            <tbody>
                            {groups.map((group) => (
                                <tr key={group.id}>
                                    <td>#{group.id}</td>
                                    <td>
                                        <strong>{group.name}</strong>
                                    </td>
                                    <td>{group.sortOrder}</td>
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