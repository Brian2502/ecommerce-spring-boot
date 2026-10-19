package com.brian.ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.brian.ecommerce.enums.OrderStatus;

@Getter
@AllArgsConstructor
public class OrderResponse {

    private Long id;
    private BigDecimal totalPrice;
    private OrderStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}