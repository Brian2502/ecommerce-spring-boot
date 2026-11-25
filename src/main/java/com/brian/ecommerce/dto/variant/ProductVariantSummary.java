package com.brian.ecommerce.dto.variant;

import java.math.BigDecimal;

public record ProductVariantSummary(
        Long productId,
        Long variantCount,
        BigDecimal minPrice,
        BigDecimal maxPrice,
        BigDecimal minAvailablePrice,
        Long totalStock
) {
}