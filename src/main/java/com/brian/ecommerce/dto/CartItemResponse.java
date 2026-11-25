
package com.brian.ecommerce.dto;

import java.math.BigDecimal;

public record CartItemResponse(
        Long cartItemId,
        Long productId,
        Long variantId,
        String productName,
        String color,
        String storage,
        BigDecimal price,
        Integer quantity,
        BigDecimal subtotal
) {}
