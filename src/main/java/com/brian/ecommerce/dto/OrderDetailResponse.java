package com.brian.ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import com.brian.ecommerce.enums.OrderStatus;
@Getter
@AllArgsConstructor
public class OrderDetailResponse {

    private Long id;
    private BigDecimal totalPrice;
    private OrderStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<OrderItemResponse> items;
}