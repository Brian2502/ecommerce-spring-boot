package com.brian.ecommerce.dto.admin;

import java.math.BigDecimal;
import java.util.List;

public record AdminDashboardResponse(
        BigDecimal totalRevenue,
        long totalOrders,
        long pendingOrders,
        long totalProducts,
        long totalCategories,
        long confirmedOrders,
        long lowStockVariants,
        List<DailyRevenueResponse> dailyRevenue,
        List<AdminOrderResponse> recentOrders
) {
}