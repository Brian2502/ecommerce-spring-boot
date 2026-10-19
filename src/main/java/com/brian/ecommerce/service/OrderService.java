package com.brian.ecommerce.service;

import com.brian.ecommerce.dto.OrderResponse;

import java.util.List;
import com.brian.ecommerce.dto.OrderDetailResponse;
import com.brian.ecommerce.enums.OrderStatus;

public interface OrderService {

    void checkout(String email);

    List<OrderResponse> getMyOrders(String email);

    OrderDetailResponse getOrderById(Long orderId, String email);

    void updateOrderStatus(Long orderId, OrderStatus status);

    void cancelOrder(Long orderId, String email);
}