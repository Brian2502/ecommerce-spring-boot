
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    RefreshCw,
    ArrowRight,
    AlertCircle,
} from "lucide-react";

import { adminService } from "../services/adminService";
import "../styles/AdminDashboard.css";

const formatMoney = (value) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(value ?? 0);

const formatNumber = (value) =>
    new Intl.NumberFormat("vi-VN").format(value ?? 0);

const formatDate = (value) =>
    value
        ? new Date(value).toLocaleDateString("vi-VN")
        : "—";

const statusLabels = {
    PENDING: "Chờ xác nhận",
    CONFIRMED: "Đã xác nhận",
    SHIPPED: "Đang giao",
    DELIVERED: "Đã giao hàng",
    CANCELLED: "Đã hủy",
};

export default function AdminDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const result =
                await adminService.getDashboard();

            setData(result);
        } catch (err) {
            console.error(err);

            setError(
                "Không thể tải dữ liệu thống kê. Vui lòng thử lại."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    const dailyRevenue = data?.dailyRevenue ?? [];
    const recentOrders = data?.recentOrders ?? [];

    const maxRevenue = Math.max(
        1,
        ...dailyRevenue.map(
            (item) => Number(item.revenue)
        )
    );

    const weeklyRevenue = dailyRevenue.reduce(
        (total, item) => total + Number(item.revenue),
        0
    );

    const stats = [
        {
            label: "Doanh thu",
            value: formatMoney(data?.totalRevenue),
            note: "Đơn hàng đã giao thành công",
        },
        {
            label: "Tổng đơn hàng",
            value: formatNumber(data?.totalOrders),
            note: "Tất cả trạng thái",
        },
        {
            label: "Chờ xác nhận",
            value: formatNumber(data?.pendingOrders),
            note: "Đơn hàng cần xử lý",
        },
        {
            label: "Sản phẩm",
            value: formatNumber(data?.totalProducts),
            note: `${data?.totalCategories ?? 0} danh mục`,
        },
    ];

    return (
        <div className="uv-admin-dashboard">
            <div className="uv-dashboard-heading">
                <div>
                    <h1>Tổng quan kinh doanh</h1>
                    <p>
                        Theo dõi hoạt động bán hàng và
                        tình trạng vận hành cửa hàng.
                    </p>
                </div>

                <button
                    className="uv-dashboard-refresh"
                    onClick={loadDashboard}
                    disabled={loading}
                >
                    <RefreshCw
                        size={15}
                        className={loading ? "spinning" : ""}
                    />
                    Làm mới
                </button>
            </div>

            {error && (
                <div className="uv-dashboard-error">
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            {loading && !data && (
                <div className="uv-dashboard-loading">
                    Đang tải dữ liệu thống kê...
                </div>
            )}

            {data && (
                <>
                    <section className="uv-kpi-strip">
                        {stats.map((item) => (
                            <div
                                className="uv-kpi-item"
                                key={item.label}
                            >
                                <span className="uv-kpi-label">
                                    {item.label}
                                </span>

                                <strong className="uv-kpi-value">
                                    {item.value}
                                </strong>

                                <small>{item.note}</small>
                            </div>
                        ))}
                    </section>

                    <div className="uv-dashboard-middle">
                        <section className="uv-dashboard-panel">
                            <div className="uv-panel-header">
                                <h2>Doanh thu</h2>
                                <span>7 ngày gần nhất</span>
                            </div>

                            <div className="uv-revenue-summary">
                                <strong>
                                    {formatMoney(weeklyRevenue)}
                                </strong>

                                <span>
                                    Theo ngày đặt của đơn đã giao
                                </span>
                            </div>

                            <div className="uv-revenue-chart">
                                {dailyRevenue.map((item, index) => {
                                    const revenue =
                                        Number(item.revenue);

                                    const height =
                                        (revenue / maxRevenue) * 100;

                                    return (
                                        <div
                                            className="uv-chart-column"
                                            key={item.date}
                                        >
                                            <div className="uv-chart-track">
                                                <div
                                                    className={`uv-chart-bar ${
                                                        index ===
                                                        dailyRevenue.length - 1
                                                            ? "latest"
                                                            : ""
                                                    }`}
                                                    style={{
                                                        height:
                                                            revenue > 0
                                                                ? `${height}%`
                                                                : "2px",
                                                    }}
                                                    title={formatMoney(
                                                        revenue
                                                    )}
                                                />
                                            </div>

                                            <span className="uv-chart-date">
                                                {item.date
                                                    .split("-")
                                                    .slice(1)
                                                    .reverse()
                                                    .join("/")}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        <section className="uv-dashboard-panel">
                            <div className="uv-panel-header">
                                <h2>Cần xử lý</h2>
                            </div>

                            <div className="uv-task-list">
                                <Link
                                    to="/admin/orders?status=PENDING"
                                    className="uv-task-row"
                                >
                                    <div>
                                        <strong>
                                            Đơn chờ xác nhận
                                        </strong>
                                        <small>
                                            Kiểm tra đơn hàng mới
                                        </small>
                                    </div>

                                    <span className="uv-task-count">
                                        {data.pendingOrders}
                                    </span>

                                    <ArrowRight size={15} />
                                </Link>

                                <Link
                                    to="/admin/orders?status=CONFIRMED"
                                    className="uv-task-row"
                                >
                                    <div>
                                        <strong>
                                            Đơn chờ giao hàng
                                        </strong>
                                        <small>
                                            Chuẩn bị hàng để giao
                                        </small>
                                    </div>

                                    <span className="uv-task-count">
                                        {data.confirmedOrders}
                                    </span>

                                    <ArrowRight size={15} />
                                </Link>

                                <Link
                                    to="/admin/variants"
                                    className="uv-task-row"
                                >
                                    <div>
                                        <strong>
                                            SKU sắp hết hàng
                                        </strong>
                                        <small>
                                            Tồn kho từ 1 đến 5
                                        </small>
                                    </div>

                                    <span className="uv-task-count">
                                        {data.lowStockVariants}
                                    </span>

                                    <ArrowRight size={15} />
                                </Link>
                            </div>
                        </section>
                    </div>

                    <section className="uv-dashboard-panel">
                        <div className="uv-panel-header">
                            <h2>Đơn hàng mới nhất</h2>

                            <Link
                                to="/admin/orders"
                                className="uv-panel-link"
                            >
                                Xem tất cả
                                <ArrowRight size={14} />
                            </Link>
                        </div>

                        <div className="uv-dashboard-table-wrap">
                            <table className="uv-dashboard-table">
                                <thead>
                                <tr>
                                    <th>Mã đơn hàng</th>
                                    <th>Khách hàng</th>
                                    <th>Ngày đặt</th>
                                    <th>Tổng tiền</th>
                                    <th>Trạng thái</th>
                                </tr>
                                </thead>

                                <tbody>
                                {recentOrders.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="uv-table-empty"
                                        >
                                            Chưa có đơn hàng.
                                        </td>
                                    </tr>
                                ) : (
                                    recentOrders.map((order) => (
                                        <tr key={order.id}>
                                            <td className="uv-order-code">
                                                #{order.id}
                                            </td>

                                            <td>
                                                {order.customerEmail}
                                            </td>

                                            <td>
                                                {formatDate(
                                                    order.createdAt
                                                )}
                                            </td>

                                            <td className="uv-order-money">
                                                {formatMoney(
                                                    order.totalPrice
                                                )}
                                            </td>

                                            <td>
                                                    <span
                                                        className={`uv-dashboard-status ${order.status.toLowerCase()}`}
                                                    >
                                                        <i />
                                                        {statusLabels[
                                                            order.status
                                                            ] ?? order.status}
                                                    </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}
