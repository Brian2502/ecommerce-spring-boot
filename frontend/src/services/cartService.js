
import api from "./api";

export const cartService = {
    getCart: async () => {
        const response = await api.get("/cart");
        return response.data;
    },

    addItem: async (productId, quantity = 1, variantId = null) => {
        await api.post("/cart/items", {
            productId,
            variantId,
            quantity,
        });
    },

    updateItem: async (cartItemId, quantity) => {
        await api.put(`/cart/items/${cartItemId}`, {
            quantity,
        });
    },

    removeItem: async (cartItemId) => {
        await api.delete(`/cart/items/${cartItemId}`);
    },
};
