package com.brian.ecommerce.dto.variant;

import java.math.BigDecimal;

public record ProductVariantResponse(
        Long id,
        Long productId,
        String sku,
        String color,
        String storage,
        BigDecimal price,
        Integer stock,
        String imageUrl
) {
}