package com.brian.ecommerce.dto.admin;

import com.brian.ecommerce.enums.OrderStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AdminOrderResponse(
        Long id,
        String customerEmail,
        BigDecimal totalPrice,
        OrderStatus status,
        LocalDateTime createdAt
) {
}