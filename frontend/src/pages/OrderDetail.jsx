
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Package,
    CalendarDays,
    AlertCircle,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { orderService } from "../services/orderService";
import "./OrderDetail.css";

const formatPrice = (value) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(value ?? 0);

const formatDate = (value) =>
    value ? new Date(value).toLocaleString("vi-VN") : "—";

const statusLabels = {
    PENDING: "Chờ xác nhận",
    CONFIRMED: "Đã xác nhận",
    SHIPPED: "Đang giao hàng",
    DELIVERED: "Đã giao hàng",
    CANCELLED: "Đã hủy",
};

function OrderDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cancelling, setCancelling] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            setOrder(null);
            setLoading(false);
            return;
        }

        let active = true;

        const loadOrder = async () => {
            setLoading(true);
            setError("");

            try {
                const data = await orderService.getOrderById(id);

                if (active) {
                    setOrder(data);
                }
            } catch (err) {
                if (active) {
                    setError("Không thể tải chi tiết đơn hàng.");
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
    }, [id, isAuthenticated]);

    const handleCancelOrder = async () => {
        if (cancelling || order?.status !== "PENDING") {
            return;
        }

        setCancelling(true);
        setError("");

        try {
            await orderService.cancelOrder(order.id);

            const updatedOrder = await orderService.getOrderById(
                order.id
            );

            setOrder(updatedOrder);
            setShowCancelConfirm(false);
        } catch (err) {
            console.error("Cancel order failed:", err);

            setError(
                err.response?.data?.message ||
                "Không thể hủy đơn hàng. Vui lòng kiểm tra trạng thái đơn."
            );
            setShowCancelConfirm(false);
        } finally {
            setCancelling(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <main className="uv-order-detail-state">
                <h2>Vui lòng đăng nhập</h2>
                <Link to="/login">Đăng nhập</Link>
            </main>
        );
    }

    if (loading) {
        return (
            <main className="uv-order-detail-state">
                <p>Đang tải chi tiết đơn hàng...</p>
            </main>
        );
    }

    if (!order) {
        return (
            <main className="uv-order-detail-state">
                <AlertCircle size={42} />
                <h2>Không tìm thấy đơn hàng</h2>
                <p>{error}</p>
                <Link to="/orders">Quay lại đơn hàng</Link>
            </main>
        );
    }

    const items = order.items ?? [];

    return (
        <main className="uv-order-detail-page">
            <div className="uv-order-detail-container">
                <Link to="/orders" className="uv-order-detail-back">
                    <ArrowLeft size={17} />
                    Quay lại đơn hàng
                </Link>

                <div className="uv-order-detail-heading">
                    <div>
                        <span>ORDER DETAILS</span>
                        <h1>Chi tiết đơn hàng #{order.id}</h1>
                        <p>
                            <CalendarDays size={16} />
                            {formatDate(order.createdAt)}
                        </p>
                    </div>

                    <span
                        className={`uv-order-status status-${order.status?.toLowerCase()}`}
                    >
            {statusLabels[order.status] ?? order.status}
          </span>
                </div>

                {error && (
                    <div className="uv-order-detail-error" role="alert">
                        {error}
                    </div>
                )}

                <section className="uv-order-detail-card">
                    <div className="uv-order-detail-section-heading">
                        <h2>Sản phẩm đã đặt</h2>
                        <span>{items.length} loại sản phẩm</span>
                    </div>

                    {items.map((item) => (
                        <div
                            className="uv-order-detail-item"
                            key={item.productId}
                        >
                            <Link
                                to={`/products/${item.productId}`}
                                className="uv-order-detail-product-icon"
                            >
                                <Package size={32} />
                            </Link>

                            <div className="uv-order-detail-product-info">
                                <Link to={`/products/${item.productId}`}>
                                    {item.productName}
                                </Link>

                                <p>
                                    {formatPrice(item.price)} × {item.quantity}
                                </p>
                            </div>

                            <strong>
                                {formatPrice(
                                    Number(item.price) * item.quantity
                                )}
                            </strong>
                        </div>
                    ))}

                    <div className="uv-order-detail-total">
                        <span>Tổng đơn hàng</span>
                        <strong>{formatPrice(order.totalPrice)}</strong>
                    </div>
                </section>

                {order.status === "PENDING" && (
                    <div className="uv-order-detail-actions">
                        {!showCancelConfirm ? (
                            <button
                                type="button"
                                className="uv-order-cancel-button"
                                onClick={() => setShowCancelConfirm(true)}
                            >
                                Hủy đơn hàng
                            </button>
                        ) : (
                            <div className="uv-order-cancel-confirm">
                                <p>Bạn có chắc muốn hủy đơn hàng này?</p>

                                <div>
                                    <button
                                        type="button"
                                        disabled={cancelling}
                                        onClick={() => setShowCancelConfirm(false)}
                                    >
                                        Giữ đơn hàng
                                    </button>

                                    <button
                                        type="button"
                                        disabled={cancelling}
                                        onClick={handleCancelOrder}
                                    >
                                        {cancelling
                                            ? "Đang hủy..."
                                            : "Xác nhận hủy"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}

export default OrderDetail;
