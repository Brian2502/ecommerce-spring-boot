package com.brian.ecommerce.controller;

import com.brian.ecommerce.dto.admin.AdminDashboardResponse;
import com.brian.ecommerce.dto.admin.AdminOrderResponse;
import com.brian.ecommerce.dto.admin.AdminOrderDetailResponse;
import com.brian.ecommerce.enums.OrderStatus;
import com.brian.ecommerce.service.AdminService;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard")
    public AdminDashboardResponse getDashboard() {
        return adminService.getDashboard();
    }

    @GetMapping("/orders")
    public Page<AdminOrderResponse> getOrders(

            @RequestParam(defaultValue = "")
            String keyword,

            @RequestParam(required = false)
            OrderStatus status,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "10")
            int size
    ) {

        if (page < 0 || size < 1 || size > 100) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid pagination parameters"
            );
        }

        return adminService.getOrders(
                keyword,
                status,
                page,
                size
        );
    }

    @GetMapping("/orders/{id}")
    public AdminOrderDetailResponse getOrderDetail(
            @PathVariable Long id
    ) {
        return adminService.getOrderDetail(id);
    }
}