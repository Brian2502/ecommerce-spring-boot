
import api from "./api";

export const cartService = {
    getCart: async () => {
        const response = await api.get("/cart");
        return response.data;
    },

    addItem: async (productId, quantity = 1) => {
        await api.post("/cart/items", {
            productId,
            quantity,
        });
    },

    updateItem: async (productId, quantity) => {
        await api.put(`/cart/items/${productId}`, {
            quantity,
        });
    },

    removeItem: async (productId) => {
        await api.delete(`/cart/items/${productId}`);
    },
};
