package com.brian.ecommerce.repository;

import com.brian.ecommerce.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    @EntityGraph(attributePaths = "product")
    List<OrderItem> findByOrderId(Long orderId);

    boolean existsByVariantId(Long variantId);

    @Query("""
    SELECT CASE WHEN COUNT(oi) > 0
                THEN true ELSE false END
    FROM OrderItem oi
    WHERE oi.product.id = :productId
    """)
    boolean existsByProductId(
            @Param("productId") Long productId
    );
}