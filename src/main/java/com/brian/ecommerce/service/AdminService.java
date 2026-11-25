
package com.brian.ecommerce.service;

import com.brian.ecommerce.dto.admin.AdminDashboardResponse;
import com.brian.ecommerce.dto.admin.AdminOrderResponse;
import com.brian.ecommerce.dto.admin.DailyRevenueResponse;
import com.brian.ecommerce.enums.OrderStatus;
import com.brian.ecommerce.repository.CategoryRepository;
import com.brian.ecommerce.repository.OrderRepository;
import com.brian.ecommerce.repository.ProductRepository;
import com.brian.ecommerce.repository.ProductVariantRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import com.brian.ecommerce.dto.admin.AdminOrderDetailResponse;
import com.brian.ecommerce.dto.OrderItemResponse;
import com.brian.ecommerce.entity.Order;
import com.brian.ecommerce.entity.ProductVariant;
import com.brian.ecommerce.exception.OrderNotFoundException;
import com.brian.ecommerce.repository.OrderItemRepository;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductVariantRepository variantRepository;
    private final OrderItemRepository orderItemRepository;

    public AdminDashboardResponse getDashboard() {

        BigDecimal totalRevenue = zeroIfNull(
                orderRepository.sumTotalPriceByStatus(
                        OrderStatus.DELIVERED
                )
        );

        long totalOrders = orderRepository.count();

        long pendingOrders = orderRepository.countByStatus(
                OrderStatus.PENDING
        );

        long confirmedOrders = orderRepository.countByStatus(
                OrderStatus.CONFIRMED
        );

        long totalProducts = productRepository.count();

        long totalCategories = categoryRepository.count();

        long lowStockVariants =
                variantRepository.countByStockBetween(1, 5);

        List<DailyRevenueResponse> dailyRevenue =
                getDailyRevenue();

        List<AdminOrderResponse> recentOrders =
                orderRepository.findAdminOrders(
                        null,
                        PageRequest.of(0, 5)
                ).getContent();

        return new AdminDashboardResponse(
                totalRevenue,
                totalOrders,
                pendingOrders,
                totalProducts,
                totalCategories,
                confirmedOrders,
                lowStockVariants,
                dailyRevenue,
                recentOrders
        );
    }

    private List<DailyRevenueResponse> getDailyRevenue() {

        LocalDate today = LocalDate.now();

        List<DailyRevenueResponse> result =
                new ArrayList<>();

        for (int i = 6; i >= 0; i--) {

            LocalDate date = today.minusDays(i);

            BigDecimal revenue = zeroIfNull(
                    orderRepository.sumRevenueBetween(
                            OrderStatus.DELIVERED,
                            date.atStartOfDay(),
                            date.plusDays(1).atStartOfDay()
                    )
            );

            result.add(
                    new DailyRevenueResponse(date, revenue)
            );
        }

        return result;
    }

    public Page<AdminOrderResponse> getOrders(
            String keyword,
            OrderStatus status,
            int page,
            int size
    ) {
        String normalizedKeyword =
                keyword == null ? "" : keyword.trim();

        return orderRepository.searchAdminOrders(
                normalizedKeyword,
                status,
                PageRequest.of(page, size)
        );
    }
    public AdminOrderDetailResponse getOrderDetail(
            Long orderId
    ) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new OrderNotFoundException(
                                "Order not found with id: " + orderId
                        )
                );

        List<OrderItemResponse> items =
                orderItemRepository.findByOrderId(orderId)
                        .stream()
                        .map(item -> {

                            ProductVariant variant =
                                    item.getVariant();

                            return new OrderItemResponse(
                                    item.getProduct().getId(),

                                    variant != null
                                            ? variant.getId()
                                            : null,

                                    item.getProduct().getName(),

                                    variant != null
                                            ? variant.getColor()
                                            : null,

                                    variant != null
                                            ? variant.getStorage()
                                            : null,

                                    item.getQuantity(),
                                    item.getPrice()
                            );
                        })
                        .toList();

        return new AdminOrderDetailResponse(
                order.getId(),
                order.getUser().getEmail(),
                order.getTotalPrice(),
                order.getStatus(),
                order.getCreatedAt(),
                order.getUpdatedAt(),
                items
        );
    }


    private BigDecimal zeroIfNull(BigDecimal value) {

        return value == null
                ? BigDecimal.ZERO
                : value;
    }
}
