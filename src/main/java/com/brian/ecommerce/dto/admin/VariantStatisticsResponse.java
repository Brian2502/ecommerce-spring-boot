package com.brian.ecommerce.dto.admin;

public record VariantStatisticsResponse(
        long totalVariants,
        long lowStockVariants,
        long outOfStockVariants
) {}