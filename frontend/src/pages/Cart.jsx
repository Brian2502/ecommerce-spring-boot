
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { orderService } from "../services/orderService";
import {
    ArrowLeft,
    ArrowRight,
    ShoppingBag,
    Trash2,
    Package,
    Minus,
    Plus,
} from "lucide-react";

import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import "./Cart.css";

const formatPrice = (value) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(value ?? 0);

function Cart() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [checkingOut, setCheckingOut] = useState(false);

    const {
        cart,
        loading,
        error,
        updateQuantity,
        removeFromCart,
        refreshCart,
    } = useCart();

    const [busyId, setBusyId] = useState(null);
    const [actionError, setActionError] = useState("");

    const items = cart?.items ?? [];

    const itemCount = items.reduce(
        (total, item) => total + item.quantity,
        0
    );


    const handleUpdate = async (cartItemId, quantity) => {
        if (quantity < 1) return;

        setBusyId(cartItemId);
        setActionError("");

        try {
            await updateQuantity(cartItemId, quantity);
        } catch (err) {
            setActionError("Không thể cập nhật số lượng.");
        } finally {
            setBusyId(null);
        }
    };


    const handleRemove = async (cartItemId) => {
        setBusyId(cartItemId);
        setActionError("");

        try {
            await removeFromCart(cartItemId);
        } catch (err) {
            setActionError("Không thể xóa sản phẩm.");
        } finally {
            setBusyId(null);
        }
    };


    const handleCheckout = async () => {
        if (checkingOut || !cart?.items?.length) {
            return;
        }

        setCheckingOut(true);
        setActionError("");

        try {
            await orderService.checkout();

            await refreshCart();

            navigate("/orders", {
                state: {
                    message: "Đặt hàng thành công!",
                },
            });
        } catch (error) {
            console.error("Checkout failed:", error);

            setActionError(
                error.response?.data?.message ||
                "Đặt hàng không thành công. Vui lòng kiểm tra đơn hàng trước khi thử lại."
            );
        } finally {
            setCheckingOut(false);
        }
    };


    if (!isAuthenticated) {
        return (
            <main className="uv-cart-empty">
                <ShoppingBag size={52} />
                <h1>Đăng nhập để xem giỏ hàng</h1>
                <p>Giỏ hàng được liên kết với tài khoản của bạn.</p>
                <Link to="/login" className="uv-cart-primary">
                    Đăng nhập
                    <ArrowRight size={18} />
                </Link>
            </main>
        );
    }

    if (loading && !cart) {
        return (
            <main className="uv-cart-empty">
                <p>Đang tải giỏ hàng...</p>
            </main>
        );
    }

    if (error && !cart) {
        return (
            <main className="uv-cart-empty">
                <p role="alert">{error}</p>
            </main>
        );
    }

    return (
        <main className="uv-cart-page">
            <div className="uv-cart-container">
                <Link to="/" className="uv-cart-back">
                    <ArrowLeft size={17} />
                    Tiếp tục mua sắm
                </Link>

                <div className="uv-cart-heading">
                    <div>
                        <span>YOUR SHOPPING BAG</span>
                        <h1>Giỏ hàng của bạn<span>.</span></h1>
                        <p>{itemCount} sản phẩm trong giỏ hàng</p>
                    </div>

                    <ShoppingBag size={35} />
                </div>

                {actionError && (
                    <p className="uv-cart-error" role="alert">
                        {actionError}
                    </p>
                )}

                {items.length === 0 ? (
                    <div className="uv-cart-empty-state">
                        <Package size={52} />
                        <h2>Giỏ hàng đang trống</h2>
                        <p>Khám phá và thêm sản phẩm yêu thích.</p>

                        <Link to="/" className="uv-cart-primary">
                            Khám phá sản phẩm
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                ) : (
                    <div className="uv-cart-layout">
                        <section className="uv-cart-items">
                            <div className="uv-cart-section-title">
                                <h2>Sản phẩm đã chọn</h2>
                                <span>{itemCount} sản phẩm</span>
                            </div>

                            {items.map((item) => (
                                <article
                                    className="uv-cart-item"
                                    key={item.cartItemId}
                                >
                                    <Link
                                        to={`/products/${item.productId}`}
                                        className="uv-cart-item-image"
                                        aria-label={`Xem ${item.productName}`}
                                    >
                                        <Package size={42} />
                                    </Link>


                                    <div className="uv-cart-item-info">
                                        <Link
                                            to={`/products/${item.productId}`}
                                            className="uv-cart-item-name"
                                        >
                                            {item.productName}
                                        </Link>

                                        {item.variantId != null && (
                                            <p className="uv-cart-item-variant">
                                                {item.color} · {item.storage}
                                            </p>
                                        )}

                                        <p className="uv-cart-item-price">
                                            {formatPrice(item.price)}
                                        </p>


                                        <div className="uv-cart-item-actions">
                                            <div className="uv-cart-quantity">
                                                <button
                                                    type="button"
                                                    aria-label="Giảm số lượng"
                                                    disabled={
                                                        busyId === item.cartItemId ||
                                                        item.quantity <= 1
                                                    }
                                                    onClick={() =>
                                                        handleUpdate(
                                                            item.cartItemId,
                                                            item.quantity - 1
                                                        )
                                                    }
                                                >
                                                    <Minus size={15} />
                                                </button>

                                                <span>{item.quantity}</span>

                                                <button
                                                    type="button"
                                                    aria-label="Tăng số lượng"
                                                    disabled={busyId === item.cartItemId}
                                                    onClick={() =>
                                                        handleUpdate(
                                                            item.cartItemId,
                                                            item.quantity + 1
                                                        )
                                                    }
                                                >
                                                    <Plus size={15} />
                                                </button>
                                            </div>

                                            <button
                                                type="button"
                                                className="uv-cart-remove"
                                                disabled={busyId === item.cartItemId}
                                                onClick={() =>
                                                    handleRemove(item.cartItemId)
                                                }
                                            >
                                                <Trash2 size={16} />
                                                Xóa
                                            </button>
                                        </div>
                                    </div>

                                    <div className="uv-cart-item-subtotal">
                                        {formatPrice(item.subtotal)}
                                    </div>
                                </article>
                            ))}
                        </section>

                        <aside className="uv-cart-summary">
                            <div className="uv-cart-summary-header">
                                <span>ORDER SUMMARY</span>
                                <h2>Tóm tắt đơn hàng</h2>
                            </div>

                            <div className="uv-cart-summary-row">
                                <span>Tạm tính ({itemCount} sản phẩm)</span>
                                <strong>{formatPrice(cart.totalPrice)}</strong>
                            </div>

                            <div className="uv-cart-summary-divider" />

                            <div className="uv-cart-summary-total">
                                <span>Tổng cộng</span>
                                <strong>{formatPrice(cart.totalPrice)}</strong>
                            </div>


                            <button
                                type="button"
                                className="uv-cart-checkout"
                                onClick={handleCheckout}
                                disabled={
                                    checkingOut ||
                                    loading ||
                                    busyId !== null ||
                                    items.length === 0
                                }
                            >
                                {checkingOut
                                    ? "Đang xử lý đơn hàng..."
                                    : "Tiến hành đặt hàng"}

                                {!checkingOut && <ArrowRight size={18} />}
                            </button>


                            <p className="uv-cart-summary-note">
                                Đơn hàng sẽ được xác nhận sau khi bạn nhấn đặt hàng.
                                Chưa tích hợp thanh toán trực tuyến.
                            </p>
                        </aside>
                    </div>
                )}
            </div>
        </main>
    );
}

export default Cart;
