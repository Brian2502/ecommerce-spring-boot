
import api from "../../services/api";

export const adminService = {
    // Dashboard
    getDashboard: async () => {
        const response = await api.get("/admin/dashboard");
        return response.data;
    },

    // Orders
    getOrders: async (params = {}) => {
        const response = await api.get("/admin/orders", {
            params,
        });
        return response.data;
    },

    getOrderDetail: async (id) => {
        const response = await api.get(`/admin/orders/${id}`);
        return response.data;
    },

    updateOrderStatus: async (id, status) => {
        const response = await api.put(
            `/orders/${id}/status`,
            { status }
        );
        return response.data;
    },

    // Categories
    getCategories: async () => {
        const response = await api.get("/categories");
        return response.data;
    },

    createCategory: async (data) => {
        const response = await api.post("/categories", data);
        return response.data;
    },

    updateCategory: async (id, data) => {
        const response = await api.put(
            `/categories/${id}`,
            data
        );
        return response.data;
    },

    deleteCategory: async (id) => {
        await api.delete(`/categories/${id}`);
    },

    // Products
    getProducts: async (params = {}) => {
        const response = await api.get("/products", {
            params,
        });
        return response.data;
    },

    getProductById: async (id) => {
        const response = await api.get(`/products/${id}`);
        return response.data;
    },

    createProduct: async (data) => {
        const response = await api.post("/products", data);
        return response.data;
    },

    updateProduct: async (id, data) => {
        const response = await api.put(
            `/products/${id}`,
            data
        );
        return response.data;
    },

    deleteProduct: async (id) => {
        await api.delete(`/products/${id}`);
    },

    // Image upload
    uploadImage: async (file, onProgress) => {
        const formData = new FormData();

        formData.append("file", file);

        const response = await api.post(
            "/admin/upload/image",
            formData,
            {
                onUploadProgress: (event) => {
                    if (event.total && onProgress) {
                        const percent = Math.round(
                            (event.loaded * 100) / event.total
                        );

                        onProgress(percent);
                    }
                },
            }
        );

        return response.data;
    },

    // Variants

    getVariants: async (params = {}) => {
        const response = await api.get("/admin/variants", {
            params,
        });
        return response.data;
    },

    getVariantStatistics: async () => {
        const response = await api.get(
            "/admin/variants/statistics"
        );
        return response.data;
    },

    createVariant: async (productId, data) => {
        const response = await api.post(
            `/products/${productId}/variants`,
            data
        );
        return response.data;
    },

    updateVariant: async (id, data) => {
        const response = await api.put(
            `/admin/variants/${id}`,
            data
        );
        return response.data;
    },

    deleteVariant: async (id) => {
        await api.delete(`/admin/variants/${id}`);
    },




};
