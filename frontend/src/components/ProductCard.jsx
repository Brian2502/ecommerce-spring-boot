
import "./ProductCard.css";
import { Link } from "react-router-dom";

function ProductCard({ product, onAddToCart }) {
    const isOutOfStock = product.stock <= 0;

    const imageUrl =
        product.image ||
        "https://placehold.co/400x400?text=UVMart";

    return (
        <div className="product-card">
            <Link to={`/products/${product.id}`}>
                <img src={imageUrl} alt={product.name} />
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
                    {Number(product.price).toLocaleString("vi-VN")} ₫
                </p>

                <p>
                    {isOutOfStock
                        ? "Hết hàng"
                        : `Còn ${product.stock} sản phẩm`}
                </p>

                <button
                    disabled={isOutOfStock}
                    onClick={() => onAddToCart(product)}
                >
                    {isOutOfStock ? "Hết hàng" : "Thêm vào giỏ hàng"}
                </button>
            </div>
        </div>
    );
}

export default ProductCard;
