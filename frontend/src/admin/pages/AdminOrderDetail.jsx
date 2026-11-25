
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
    ArrowLeft,
    Package,
    UserRound,
    Clock,
    CheckCircle2,
    Truck,
    XCircle,
} from "lucide-react";

import { adminService } from "../services/adminService";

import OrderStatusBadge, {
    ORDER_STATUS_LABELS,
    NEXT_ORDER_STATUS,
    ORDER_ACTION_LABELS,
} from "../components/OrderStatusBadge.jsx";

import "../styles/AdminManagement.css";
import "../styles/AdminOrders.css";

const formatMoney = (value) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(value);

const formatDate = (value) =>
    value
        ? new Date(value).toLocaleString("vi-VN")
        : "—";

const ORDER_STEPS = [
    { status: "PENDING", icon: Clock },
    { status: "CONFIRMED", icon: CheckCircle2 },
    { status: "SHIPPED", icon: Truck },
    { status: "DELIVERED", icon: Package },
];

export default function AdminOrderDetail() {
    const { id } = useParams();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [reload, setReload] = useState(0);

    useEffect(() => {
        let active = true;

        const loadOrder = async () => {
            try {
                setLoading(true);
                setError("");

                const data =
                    await adminService.getOrderDetail(id);

                if (active) {
                    setOrder(data);
                }
            } catch (err) {
                if (active) {
                    setOrder(null);

                    setError(
                        err.response?.status === 404
                            ? "Không tìm thấy đơn hàng."
                            : "Không thể tải thông tin đơn hàng."
                    );
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        loadOrder();

        return () => {
            active = false;
        };
    }, [id, reload]);

    const handleUpdateStatus = async () => {
        if (!order || updating) return;

        const nextStatus = NEXT_ORDER_STATUS[order.status];

        if (!nextStatus) return;

        const confirmed = window.confirm(
            `Bạn có chắc muốn chuyển đơn hàng #${order.id} ` +
            `sang trạng thái "${ORDER_STATUS_LABELS[nextStatus]}"?`
        );

        if (!confirmed) return;

        try {
            setUpdating(true);
            setError("");
            setSuccess("");

            await adminService.updateOrderStatus(
                order.id,
                nextStatus
            );

            setSuccess("Cập nhật trạng thái thành công.");
            setReload((prev) => prev + 1);

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Không thể cập nhật trạng thái đơn hàng."
            );
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="uv-management">
                <p>Đang tải thông tin đơn hàng...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="uv-management">
                <div className="uv-alert uv-alert-error">
                    {error || "Không tìm thấy đơn hàng."}
                </div>

                <Link
                    to="/admin/orders"
                    className="uv-back-link"
                >
                    <ArrowLeft size={17} />
                    Quay lại danh sách
                </Link>
            </div>
        );
    }

    const nextStatus = NEXT_ORDER_STATUS[order.status];

    const currentStep = ORDER_STEPS.findIndex(
        (step) => step.status === order.status
    );

    const items = order.items ?? [];

    return (
        <div className="uv-management">

            <Link
                to="/admin/orders"
                className="uv-back-link"
            >
                <ArrowLeft size={17} />
                Quay lại danh sách đơn hàng
            </Link>

            <div className="uv-management-heading uv-order-detail-heading">
                <div>
                    <div className="uv-order-heading-title">
                        <h1>Đơn hàng #{order.id}</h1>

                        <OrderStatusBadge status={order.status} />
                    </div>

                    <p>Ngày đặt: {formatDate(order.createdAt)}</p>
                </div>

                {nextStatus && (
                    <button
                        className="uv-btn uv-btn-primary"
                        disabled={updating}
                        onClick={handleUpdateStatus}
                    >
                        <CheckCircle2 size={17} />

                        {updating
                            ? "Đang cập nhật..."
                            : ORDER_ACTION_LABELS[order.status]}
                    </button>
                )}
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

            <section className="uv-management-panel uv-order-progress">

                <h3>Tiến trình đơn hàng</h3>

                {order.status === "CANCELLED" ? (
                    <div className="uv-order-cancelled">
                        <XCircle size={24} />
                        <div>
                            <strong>Đơn hàng đã bị hủy</strong>
                            <p>Đơn hàng không thể tiếp tục xử lý.</p>
                        </div>
                    </div>
                ) : (
                    <div className="uv-order-steps">
                        {ORDER_STEPS.map((step, index) => {
                            const Icon = step.icon;

                            return (
                                <div
                                    key={step.status}
                                    className={`uv-order-step ${
                                        index <= currentStep
                                            ? "completed"
                                            : ""
                                    } ${
                                        index === currentStep
                                            ? "current"
                                            : ""
                                    }`}
                                >
                                    <div className="uv-order-step-icon">
                                        <Icon size={21} />
                                    </div>

                                    <span>
                                        {ORDER_STATUS_LABELS[step.status]}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}

            </section>

            <div className="uv-order-detail-grid">

                <section className="uv-management-panel">
                    <div className="uv-order-section-heading">
                        <Package size={19} />
                        <h3>Sản phẩm trong đơn hàng</h3>
                    </div>

                    <div className="uv-table-wrap">
                        <table className="uv-management-table uv-order-items">
                            <thead>
                            <tr>
                                <th>Sản phẩm</th>
                                <th>Đơn giá</th>
                                <th>SL</th>
                                <th>Thành tiền</th>
                            </tr>
                            </thead>

                            <tbody>
                            {items.map((item, index) => (
                                <tr
                                    key={`${item.productId}-${item.variantId ?? "default"}-${index}`}
                                >
                                    <td>
                                        <div className="uv-order-item-name">
                                            <Link
                                                to={`/products/${item.productId}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {item.productName}
                                            </Link>

                                            {(item.color || item.storage) && (
                                                <small>
                                                    {[
                                                        item.color,
                                                        item.storage,
                                                    ].filter(Boolean).join(" / ")}
                                                </small>
                                            )}
                                        </div>
                                    </td>

                                    <td>{formatMoney(item.price)}</td>

                                    <td>{item.quantity}</td>

                                    <td className="uv-order-money">
                                        {formatMoney(
                                            Number(item.price) *
                                            item.quantity
                                        )}
                                    </td>
                                </tr>
                            ))}

                            {items.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="uv-empty">
                                        Không có sản phẩm.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>

                    <div className="uv-order-total">
                        <span>Tổng giá trị đơn hàng</span>
                        <strong>
                            {formatMoney(order.totalPrice)}
                        </strong>
                    </div>
                </section>

                <div className="uv-order-detail-sidebar">

                    <section className="uv-management-panel">
                        <div className="uv-order-section-heading">
                            <UserRound size={19} />
                            <h3>Khách hàng</h3>
                        </div>

                        <div className="uv-order-meta">
                            <span>Email khách hàng</span>
                            <strong>{order.customerEmail}</strong>
                        </div>
                    </section>

                    <section className="uv-management-panel">
                        <div className="uv-order-section-heading">
                            <Clock size={19} />
                            <h3>Thông tin đơn hàng</h3>
                        </div>

                        <div className="uv-order-meta">
                            <span>Mã đơn hàng</span>
                            <strong>#{order.id}</strong>

                            <span>Ngày tạo</span>
                            <strong>
                                {formatDate(order.createdAt)}
                            </strong>

                            <span>Cập nhật lần cuối</span>
                            <strong>
                                {formatDate(order.updatedAt)}
                            </strong>

                            <span>Trạng thái</span>

                            <div>
                                <OrderStatusBadge
                                    status={order.status}
                                />
                            </div>
                        </div>
                    </section>

                </div>
            </div>

        </div>
    );
}
