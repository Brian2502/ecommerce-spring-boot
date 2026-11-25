package com.brian.ecommerce.dto.admin;

import java.math.BigDecimal;

public record AdminVariantResponse(
        Long id,
        Long productId,
        String productName,
        String sku,
        String color,
        String storage,
        BigDecimal price,
        Integer stock,
        String imageUrl
) {
}