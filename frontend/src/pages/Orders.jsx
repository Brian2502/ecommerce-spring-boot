
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    Package,
    ArrowRight,
    ShoppingBag,
} from "lucide-react";

import { orderService } from "../services/orderService";
import { useAuth } from "../context/AuthContext";
import "./Orders.css";

const formatPrice = (value) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(value ?? 0);

const formatDate = (value) =>
    value
        ? new Date(value).toLocaleString("vi-VN")
        : "—";

const statusLabels = {
    PENDING: "Chờ xác nhận",
    CONFIRMED: "Đã xác nhận",
    SHIPPED: "Đang giao hàng",
    DELIVERED: "Đã giao hàng",
    CANCELLED: "Đã hủy",
};

function Orders() {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isAuthenticated) {
            setOrders([]);
            setLoading(false);
            return;
        }

        let active = true;

        const loadOrders = async () => {
            setLoading(true);
            setError("");

            try {
                const data = await orderService.getMyOrders();

                if (active) {
                    setOrders(data);
                }
            } catch (err) {
                if (active) {
                    setError("Không thể tải lịch sử đơn hàng.");
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
    }, [isAuthenticated]);

    if (!isAuthenticated) {
        return (
            <main className="uv-orders-empty">
                <ShoppingBag size={48} />
                <h2>Đăng nhập để xem đơn hàng</h2>
                <Link to="/login">Đăng nhập</Link>
            </main>
        );
    }

    return (
        <main className="uv-orders-page">
            <div className="uv-orders-container">
                <div className="uv-orders-heading">
                    <span>MY PURCHASES</span>
                    <h1>Đơn hàng của tôi<span>.</span></h1>
                    <p>Theo dõi các đơn hàng đã đặt tại UVMart.</p>
                </div>

                {location.state?.message && (
                    <div className="uv-orders-success" role="status">
                        {location.state.message}
                    </div>
                )}

                {loading ? (
                    <p>Đang tải đơn hàng...</p>
                ) : error ? (
                    <p role="alert">{error}</p>
                ) : orders.length === 0 ? (
                    <div className="uv-orders-empty">
                        <Package size={48} />
                        <h2>Chưa có đơn hàng nào</h2>
                        <p>Hãy khám phá sản phẩm tại UVMart.</p>
                        <Link to="/">Mua sắm ngay</Link>
                    </div>
                ) : (
                    <div className="uv-orders-list">
                        {orders.map((order) => (
                            <article
                                key={order.id}
                                className="uv-order-card"
                            >
                                <div className="uv-order-card-top">
                                    <div>
                    <span className="uv-order-label">
                      ORDER #{order.id}
                    </span>
                                        <h2>Đơn hàng #{order.id}</h2>
                                        <p>{formatDate(order.createdAt)}</p>
                                    </div>

                                    <span
                                        className={`uv-order-status status-${order.status?.toLowerCase()}`}
                                    >
                    {statusLabels[order.status] ??
                        order.status}
                  </span>
                                </div>

                                <div className="uv-order-card-bottom">
                                    <div>
                                        <span>Tổng đơn hàng</span>
                                        <strong>
                                            {formatPrice(order.totalPrice)}
                                        </strong>
                                    </div>

                                    <Link
                                        to={`/orders/${order.id}`}
                                        className="uv-order-detail-link"
                                    >
                                        Xem chi tiết
                                        <ArrowRight size={17} />
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}

export default Orders;
