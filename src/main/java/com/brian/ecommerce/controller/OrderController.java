package com.brian.ecommerce.controller;

import com.brian.ecommerce.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.brian.ecommerce.dto.OrderDetailResponse;
import com.brian.ecommerce.dto.OrderStatusRequest;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/checkout")
    public ResponseEntity<Void> checkout() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        orderService.checkout(email);

        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<?> getMyOrders() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        return ResponseEntity.ok(
                orderService.getMyOrders(email)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDetailResponse> getOrderById(
            @PathVariable Long id) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        return ResponseEntity.ok(
                orderService.getOrderById(id, email)
        );
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Void> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody OrderStatusRequest request) {

        orderService.updateOrderStatus(
                id,
                request.getStatus()
        );

        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelOrder(
            @PathVariable Long id) {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        String email = authentication.getName();

        orderService.cancelOrder(id, email);

        return ResponseEntity.noContent().build();
    }
}