export const ORDER_STATUS_LABELS = {
    PENDING: "Chờ xác nhận",
    CONFIRMED: "Đã xác nhận",
    SHIPPED: "Đang giao hàng",
    DELIVERED: "Đã giao hàng",
    CANCELLED: "Đã hủy",
};

export const NEXT_ORDER_STATUS = {
    PENDING: "CONFIRMED",
    CONFIRMED: "SHIPPED",
    SHIPPED: "DELIVERED",
};

export const ORDER_ACTION_LABELS = {
    PENDING: "Xác nhận đơn hàng",
    CONFIRMED: "Bắt đầu giao hàng",
    SHIPPED: "Xác nhận đã giao hàng",
};

export default function OrderStatusBadge({ status }) {
    return (
        <span
            className={`uv-order-status uv-order-status-${
                status?.toLowerCase() || "unknown"
            }`}
        >
            {ORDER_STATUS_LABELS[status] || status}
        </span>
    );
}