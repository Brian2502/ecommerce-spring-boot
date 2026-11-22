
import api from "./api";

export const orderService = {
    checkout: async () => {
        await api.post("/orders/checkout");
    },

    getMyOrders: async () => {
        const response = await api.get("/orders");
        return response.data;
    },

    getOrderById: async (orderId) => {
        const response = await api.get(`/orders/${orderId}`);
        return response.data;
    },

    cancelOrder: async (orderId) => {
        await api.put(`/orders/${orderId}/cancel`);
    },
};
