package com.brian.ecommerce.repository;

import com.brian.ecommerce.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    @EntityGraph(attributePaths = "product")
    List<OrderItem> findByOrderId(Long orderId);

}