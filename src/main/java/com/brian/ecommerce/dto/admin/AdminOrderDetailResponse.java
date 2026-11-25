package com.brian.ecommerce.dto.admin;

import com.brian.ecommerce.dto.OrderItemResponse;
import com.brian.ecommerce.enums.OrderStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record AdminOrderDetailResponse(
        Long id,
        String customerEmail,
        BigDecimal totalPrice,
        OrderStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<OrderItemResponse> items
) {
}