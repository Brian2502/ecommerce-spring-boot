
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    CheckCircle2,
    ChevronRight,
    Minus,
    Plus,
    ShoppingCart,
    ShieldCheck,
    PackageCheck,
} from "lucide-react";

import api from "../services/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import "./ProductDetail.css";

function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { isAuthenticated } = useAuth();
    const { addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [variants, setVariants] = useState([]);
    const [selectedVariantId, setSelectedVariantId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [specifications, setSpecifications] = useState([]);
    const [specsLoading, setSpecsLoading] = useState(true);
    const [specsError, setSpecsError] = useState(false);

    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);
    const [cartMessage, setCartMessage] = useState("");
    const [cartSuccess, setCartSuccess] = useState(false);

    useEffect(() => {
        const controller = new AbortController();

        async function fetchProduct() {
            try {
                setLoading(true);
                setError("");
                setProduct(null);
                setQuantity(1);
                setCartMessage("");
                setCartSuccess(false);

                const response = await api.get(`/products/${id}`, {
                    signal: controller.signal,
                });

                if (!controller.signal.aborted) {
                    setProduct(response.data);
                }
            } catch (err) {
                if (controller.signal.aborted) return;

                console.error("Failed to load product:", err);

                setError(
                    err.response?.status === 404
                        ? "Không tìm thấy sản phẩm."
                        : "Không thể tải thông tin sản phẩm."
                );
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        fetchProduct();
        async function fetchSpecifications() {
            try {
                setSpecsLoading(true);
                setSpecsError(false);
                setSpecifications([]);

                const response = await api.get(
                    `/products/${id}/specifications`,
                    { signal: controller.signal }
                );

                if (!controller.signal.aborted) {
                    setSpecifications(response.data);
                }
            } catch (err) {
                if (controller.signal.aborted) return;

                console.error("Failed to load specifications:", err);
                setSpecsError(true);
            } finally {
                if (!controller.signal.aborted) {
                    setSpecsLoading(false);
                }
            }
        }

        fetchSpecifications();

        async function fetchVariants() {
            try {
                setVariants([]);
                setSelectedVariantId(null);

                const response = await api.get(
                    `/products/${id}/variants`,
                    { signal: controller.signal }
                );

                if (!controller.signal.aborted) {
                    const data = response.data;
                    setVariants(data);
                    const defaultVariant =
                        data.find((variant) => variant.stock > 0)
                        ?? data[0];

                    setSelectedVariantId(
                        defaultVariant?.id ?? null
                    );
                }
            } catch (err) {
                if (controller.signal.aborted) return;
                console.error("Failed to load variants:", err);
            }
        }

        fetchVariants();


        return () => controller.abort();
    }, [id]);

    const handleAddToCart = async () => {
        if (!product || displayStock <= 0 || adding) return;

        if (!isAuthenticated) {
            navigate("/login");
            return;
        }

        setAdding(true);
        setCartMessage("");
        setCartSuccess(false);

        try {
            await addToCart(product.id, quantity, selectedVariant?.id ?? null);

            setCartSuccess(true);
            setCartMessage(
                `Đã thêm ${quantity} sản phẩm vào giỏ hàng!`
            );
        } catch (err) {
            console.error("Add to cart failed:", err);

            setCartMessage(
                "Không thể thêm sản phẩm. Vui lòng thử lại."
            );
        } finally {
            setAdding(false);
        }
    };

    if (loading) {
        return (
            <main className="product-detail">
                <p>Đang tải sản phẩm...</p>
            </main>
        );
    }

    if (error || !product) {
        return (
            <main className="product-detail">
                <p role="alert">
                    {error || "Không tìm thấy sản phẩm."}
                </p>
                <Link to="/">Quay về trang chủ</Link>
            </main>
        );
    }


    const selectedVariant = variants.find(
        (variant) => variant.id === selectedVariantId
    );

    const displayPrice = selectedVariant?.price ?? product.price;
    const displayStock = selectedVariant?.stock ?? product.stock;

    const isOutOfStock = displayStock <= 0;

    const productImageUrl =
        product.imageUrl ||
        product.image ||
        "/images/product-placeholder.png";

    const imageUrl =
        selectedVariant?.imageUrl ||
        productImageUrl;

    const formatPrice = (price) =>
        Number(price).toLocaleString("vi-VN") + " ₫";


    return (
        <main className="product-detail">

            <nav className="detail-breadcrumb" aria-label="Breadcrumb">
                <Link to="/">Trang chủ</Link>
                <ChevronRight size={15} />
                <span>{product.categoryName}</span>
                <ChevronRight size={15} />
                <span className="breadcrumb-current">
                    {product.name}
                </span>
            </nav>

            <div className="detail-container">

                <div className="detail-gallery">
                    <div className="detail-image">
                        <img
                            key={imageUrl}
                            src={imageUrl}
                            alt={
                                selectedVariant
                                    ? `${product.name} - ${selectedVariant.color} - ${selectedVariant.storage}`
                                    : product.name
                            }
                            onError={(e) => {
                                const placeholder = "/images/product-placeholder.png";

                                const fallbackUrl = new URL(
                                    productImageUrl,
                                    window.location.origin
                                ).href;

                                if (
                                    e.currentTarget.src !== fallbackUrl &&
                                    !e.currentTarget.src.endsWith(placeholder)
                                ) {
                                    e.currentTarget.src = productImageUrl;
                                } else if (
                                    !e.currentTarget.src.endsWith(placeholder)
                                ) {
                                    e.currentTarget.src = placeholder;
                                }
                            }}
                        />
                    </div>

                    <div className="detail-gallery-caption">
                        <PackageCheck size={18} />
                        <span>Thông tin sản phẩm tại UVMart</span>
                    </div>
                </div>

                <div className="detail-info">

                    <span className="detail-category">
                        {product.categoryName}
                    </span>

                    <h1>{product.name}</h1>

                    <p className="detail-subtitle">
                        {product.description ||
                            "Khám phá sản phẩm công nghệ tại UVMart."}
                    </p>

                    <div className="detail-price-box">
                        <p className="detail-price">
                            {formatPrice(displayPrice)}
                        </p>
                        <span>Giá bán hiện tại</span>
                    </div>


                    {variants.length > 0 && (
                        <div className="detail-variants">
                            <h3>Chọn phiên bản</h3>

                            <div className="variant-options">
                                {variants.map((variant) => (
                                    <button
                                        key={variant.id}
                                        type="button"
                                        className={`variant-option ${
                                            selectedVariantId === variant.id
                                                ? "active"
                                                : ""
                                        }`}
                                        onClick={() => {
                                            setSelectedVariantId(variant.id);
                                            setQuantity(1);
                                        }}
                                    >
                                        <strong>{variant.storage}</strong>
                                        <span>{variant.color}</span>
                                        <small>{formatPrice(variant.price)}</small>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}


                    <div className="detail-stock-row">
                        <span
                            className={
                                isOutOfStock
                                    ? "out-of-stock"
                                    : "in-stock"
                            }
                        >
                            <CheckCircle2 size={18} />
                            {isOutOfStock
                                ? "Hết hàng"
                                : `Còn ${displayStock} sản phẩm`}
                        </span>
                    </div>

                    {!isOutOfStock && (
                        <div className="detail-quantity">
                            <span>Số lượng</span>

                            <div className="quantity-control">
                                <button
                                    type="button"
                                    aria-label="Giảm số lượng"
                                    disabled={adding || quantity <= 1}
                                    onClick={() =>
                                        setQuantity((prev) =>
                                            Math.max(1, prev - 1)
                                        )
                                    }
                                >
                                    <Minus size={17} />
                                </button>

                                <span>{quantity}</span>

                                <button
                                    type="button"
                                    aria-label="Tăng số lượng"
                                    disabled={
                                        adding ||
                                        quantity >= displayStock
                                    }
                                    onClick={() =>
                                        setQuantity((prev) =>
                                            Math.min(
                                                displayStock,
                                                prev + 1
                                            )
                                        )
                                    }
                                >
                                    <Plus size={17} />
                                </button>
                            </div>
                        </div>
                    )}

                    <button
                        type="button"
                        className="detail-add-cart"
                        disabled={isOutOfStock || adding}
                        onClick={handleAddToCart}
                    >
                        <ShoppingCart size={20} />
                        {isOutOfStock
                            ? "Hết hàng"
                            : adding
                                ? "Đang thêm..."
                                : "Thêm vào giỏ hàng"}
                    </button>

                    {cartMessage && (
                        <div
                            className={`detail-cart-message ${
                                cartSuccess ? "success" : "error"
                            }`}
                            role="status"
                        >
                            <span>{cartMessage}</span>

                            {cartSuccess && (
                                <Link to="/cart">
                                    Xem giỏ hàng
                                </Link>
                            )}
                        </div>
                    )}

                    <div className="detail-benefits">
                        <div>
                            <ShieldCheck size={21} />
                            <span>Đặt hàng an toàn</span>
                        </div>
                        <div>
                            <PackageCheck size={21} />
                            <span>Theo dõi đơn hàng dễ dàng</span>
                        </div>
                    </div>

                </div>
            </div>

            <section className="detail-description-section">
                <h2>Thông tin sản phẩm</h2>
                <p>
                    {product.description || "Chưa có mô tả sản phẩm."}
                </p>
            </section>

            <section className="detail-specifications-section">
                <h2>Thông số kỹ thuật</h2>

                {specsLoading ? (
                    <p>Đang tải thông số kỹ thuật...</p>
                ) : specsError ? (
                    <p>Không thể tải thông số kỹ thuật.</p>
                ) : specifications.length === 0 ? (
                    <p>Chưa có thông số kỹ thuật cho sản phẩm này.</p>
                ) : (
                    specifications.map((group) => (
                        <div
                            key={group.groupId}
                            className="specification-group"
                        >
                            <h3>{group.groupName}</h3>

                            <div className="specification-table">
                                {group.attributes.map((attribute) => (
                                    <div
                                        key={attribute.attributeId}
                                        className="specification-row"
                                    >
                                        <span>{attribute.name}</span>

                                        <strong>
                                            {attribute.value}
                                            {attribute.unit
                                                ? ` ${attribute.unit}`
                                                : ""}
                                        </strong>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </section>

            <Link to="/" className="detail-back-bottom">
                <ArrowLeft size={17} />
                Tiếp tục mua sắm
            </Link>

        </main>
    );
}

export default ProductDetail;
