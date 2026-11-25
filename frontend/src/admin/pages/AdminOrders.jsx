
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import {
    Search,
    Eye,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

import { adminService } from "../services/adminService";

import OrderStatusBadge, {
    ORDER_STATUS_LABELS,
} from "../components/OrderStatusBadge.jsx";

import "../styles/AdminManagement.css";
import "../styles/AdminOrders.css";

const PAGE_SIZE = 10;

const formatMoney = (value) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(value);

const formatDate = (value) =>
    value
        ? new Date(value).toLocaleString("vi-VN")
        : "—";

export default function AdminOrders() {
    const [searchParams, setSearchParams] = useSearchParams();

    const status = searchParams.get("status") || "";

    const [orders, setOrders] = useState([]);
    const [keyword, setKeyword] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reload, setReload] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(0);
            setSearchTerm(keyword.trim());
        }, 350);

        return () => clearTimeout(timer);
    }, [keyword]);

    useEffect(() => {
        let active = true;

        const loadOrders = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await adminService.getOrders({
                    keyword: searchTerm,
                    status: status || undefined,
                    page,
                    size: PAGE_SIZE,
                });

                if (!active) return;

                const pages = data.totalPages ?? 0;

                if (page > 0 && page >= pages) {
                    setPage(Math.max(0, pages - 1));
                    return;
                }

                setOrders(data.content ?? []);
                setTotalPages(pages);
                setTotalElements(data.totalElements ?? 0);

            } catch (err) {
                if (active) {
                    setOrders([]);
                    setTotalPages(0);
                    setTotalElements(0);

                    setError(
                        err.response?.data?.message ||
                        "Không thể tải danh sách đơn hàng."
                    );
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        loadOrders();

        return () => {
            active = false;
        };
    }, [searchTerm, status, page, reload]);

    const changeStatus = (value) => {
        setPage(0);

        setSearchParams((prev) => {
            const params = new URLSearchParams(prev);

            if (value) {
                params.set("status", value);
            } else {
                params.delete("status");
            }

            return params;
        });
    };

    return (
        <div className="uv-management">

            <div className="uv-management-heading">
                <div>
                    <h1>Quản lý đơn hàng</h1>
                    <p>
                        Theo dõi và xử lý đơn hàng của khách hàng.
                    </p>
                </div>

                <button
                    type="button"
                    className="uv-btn uv-btn-secondary"
                    disabled={loading}
                    onClick={() => setReload((prev) => prev + 1)}
                >
                    <RefreshCw size={16} />
                    Làm mới
                </button>
            </div>

            {error && (
                <div className="uv-alert uv-alert-error">
                    {error}
                </div>
            )}

            <section className="uv-management-panel">

                <div className="uv-order-tabs">
                    <button
                        className={!status ? "active" : ""}
                        onClick={() => changeStatus("")}
                    >
                        Tất cả
                    </button>

                    {Object.entries(ORDER_STATUS_LABELS).map(
                        ([value, label]) => (
                            <button
                                key={value}
                                className={
                                    status === value ? "active" : ""
                                }
                                onClick={() => changeStatus(value)}
                            >
                                {label}
                            </button>
                        )
                    )}
                </div>

                <div className="uv-management-toolbar">
                    <div className="uv-search">
                        <Search size={17} />

                        <input
                            placeholder="Tìm mã đơn, email khách hàng..."
                            value={keyword}
                            onChange={(e) =>
                                setKeyword(e.target.value)
                            }
                        />
                    </div>
                </div>

                <div className="uv-table-wrap">
                    <table className="uv-management-table uv-order-table">
                        <thead>
                        <tr>
                            <th>Mã đơn hàng</th>
                            <th>Khách hàng</th>
                            <th>Ngày đặt hàng</th>
                            <th>Tổng tiền</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                        </thead>

                        <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="uv-empty">
                                    Đang tải đơn hàng...
                                </td>
                            </tr>
                        ) : orders.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="uv-empty">
                                    {error
                                        ? "Không thể tải dữ liệu."
                                        : "Không tìm thấy đơn hàng."}
                                </td>
                            </tr>
                        ) : (
                            orders.map((order) => (
                                <tr key={order.id}>
                                    <td>
                                        <Link
                                            className="uv-order-id"
                                            to={`/admin/orders/${order.id}`}
                                        >
                                            #{order.id}
                                        </Link>
                                    </td>

                                    <td>{order.customerEmail}</td>

                                    <td>
                                        {formatDate(order.createdAt)}
                                    </td>

                                    <td className="uv-order-money">
                                        {formatMoney(order.totalPrice)}
                                    </td>

                                    <td>
                                        <OrderStatusBadge
                                            status={order.status}
                                        />
                                    </td>

                                    <td>
                                        <Link
                                            className="uv-icon-btn"
                                            title="Xem chi tiết"
                                            aria-label={`Xem đơn hàng ${order.id}`}
                                            to={`/admin/orders/${order.id}`}
                                        >
                                            <Eye size={17} />
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                <div className="uv-table-footer">
                    <span>{totalElements} đơn hàng</span>

                    <div className="uv-pagination">
                        <button
                            className="uv-icon-btn"
                            aria-label="Trang trước"
                            disabled={page === 0 || loading}
                            onClick={() => setPage((prev) => prev - 1)}
                        >
                            <ChevronLeft size={17} />
                        </button>

                        <span>
                            Trang {totalPages === 0 ? 0 : page + 1}
                            /{totalPages}
                        </span>

                        <button
                            className="uv-icon-btn"
                            aria-label="Trang sau"
                            disabled={
                                page + 1 >= totalPages || loading
                            }
                            onClick={() => setPage((prev) => prev + 1)}
                        >
                            <ChevronRight size={17} />
                        </button>
                    </div>
                </div>

            </section>
        </div>
    );
}
