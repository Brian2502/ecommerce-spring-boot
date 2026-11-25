
import "./ProductCard.css";
import { Link } from "react-router-dom";

const FALLBACK_IMAGE =
    "https://placehold.co/400x400?text=UVMart";

function ProductCard({ product, onAddToCart }) {

    const imageUrl =
        product.imageUrl || FALLBACK_IMAGE;

    const hasVariants = product.hasVariants === true;

    const displayPrice = hasVariants
        ? product.minVariantPrice
        : product.price;

    const displayStock = hasVariants
        ? product.totalVariantStock
        : product.stock;

    const isOutOfStock = displayStock <= 0;

    return (
        <div className="product-card">

            <Link to={`/products/${product.id}`}>
                <img
                    src={imageUrl}
                    alt={product.name}
                    loading="lazy"
                    onError={(e) => {
                        if (e.currentTarget.src !== FALLBACK_IMAGE) {
                            e.currentTarget.src = FALLBACK_IMAGE;
                        }
                    }}
                />
            </Link>

            <div className="product-info">

                <p className="product-category">
                    {product.categoryName}
                </p>

                <h3>
                    <Link
                        to={`/products/${product.id}`}
                        className="product-name-link"
                    >
                        {product.name}
                    </Link>
                </h3>

                <p className="product-price">
                    {hasVariants && (
                        <span className="product-price-prefix">
                            Từ{" "}
                        </span>
                    )}

                    {Number(displayPrice).toLocaleString("vi-VN")} ₫
                </p>

                <div className="product-availability">

                    <p
                        className={
                            isOutOfStock
                                ? "product-stock out-of-stock"
                                : "product-stock in-stock"
                        }
                    >
                        {isOutOfStock
                            ? "Hết hàng"
                            : `Còn ${displayStock} sản phẩm`}
                    </p>

                    {hasVariants && (
                        <span className="product-variant-count">
                            {product.variantCount} phiên bản
                        </span>
                    )}

                </div>

                <button
                    type="button"
                    disabled={isOutOfStock}
                    onClick={() => onAddToCart(product)}
                >
                    {isOutOfStock
                        ? "Hết hàng"
                        : hasVariants
                            ? "Chọn phiên bản"
                            : "Thêm vào giỏ hàng"}
                </button>

            </div>
        </div>
    );
}

export default ProductCard;
