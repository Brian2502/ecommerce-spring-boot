
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";

import { useAuth } from "./AuthContext";
import { cartService } from "../services/cartService";

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const { isAuthenticated, token } = useAuth();

    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const refreshCart = useCallback(async () => {
        if (!token) {
            setCart(null);
            return;
        }

        setLoading(true);
        setError("");

        try {
            const data = await cartService.getCart();
            setCart(data);
        } catch (err) {
            console.error("Failed to load cart:", err);
            setError("Không thể tải giỏ hàng.");
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (!isAuthenticated) {
            setCart(null);
            setError("");
            return;
        }

        refreshCart();
    }, [isAuthenticated, refreshCart]);

    const addToCart = async (productId, quantity = 1) => {
        if (!isAuthenticated) {
            throw new Error("AUTH_REQUIRED");
        }

        await cartService.addItem(productId, quantity);
        await refreshCart();
    };

    const updateQuantity = async (productId, quantity) => {
        await cartService.updateItem(productId, quantity);
        await refreshCart();
    };

    const removeFromCart = async (productId) => {
        await cartService.removeItem(productId);
        await refreshCart();
    };

    return (
        <CartContext.Provider
            value={{
                cart,
                loading,
                error,
                refreshCart,
                addToCart,
                updateQuantity,
                removeFromCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);

    if (!context) {
        throw new Error("useCart must be used within CartProvider");
    }

    return context;
}
