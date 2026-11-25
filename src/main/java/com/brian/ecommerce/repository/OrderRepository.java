
package com.brian.ecommerce.repository;

import com.brian.ecommerce.dto.admin.AdminOrderResponse;
import com.brian.ecommerce.entity.Order;
import com.brian.ecommerce.enums.OrderStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserId(Long userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT o
        FROM Order o
        WHERE o.id = :id
        """)
    Optional<Order> findByIdForUpdate(@Param("id") Long id);

    // Đếm đơn hàng theo trạng thái
    long countByStatus(OrderStatus status);

    // Tổng doanh thu
    @Query("""
        SELECT SUM(o.totalPrice)
        FROM Order o
        WHERE o.status = :status
        """)
    BigDecimal sumTotalPriceByStatus(
            @Param("status") OrderStatus status
    );

    // Doanh thu theo khoảng thời gian đặt hàng
    @Query("""
        SELECT SUM(o.totalPrice)
        FROM Order o
        WHERE o.status = :status
        AND o.createdAt >= :from
        AND o.createdAt < :to
        """)
    BigDecimal sumRevenueBetween(
            @Param("status") OrderStatus status,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );

    // Danh sách đơn hàng dành cho Admin
    @Query(
            value = """
            SELECT new com.brian.ecommerce.dto.admin.AdminOrderResponse(
                o.id,
                o.user.email,
                o.totalPrice,
                o.status,
                o.createdAt
            )
            FROM Order o
            WHERE (:status IS NULL OR o.status = :status)
            ORDER BY o.createdAt DESC, o.id DESC
            """,
            countQuery = """
            SELECT COUNT(o)
            FROM Order o
            WHERE (:status IS NULL OR o.status = :status)
            """
    )
    Page<AdminOrderResponse> findAdminOrders(
            @Param("status") OrderStatus status,
            Pageable pageable
    );

    @Query(
            value = """
        SELECT new com.brian.ecommerce.dto.admin.AdminOrderResponse(
            o.id,
            o.user.email,
            o.totalPrice,
            o.status,
            o.createdAt
        )
        FROM Order o
        WHERE (:status IS NULL OR o.status = :status)
        AND (
            :keyword = ''
            OR LOWER(o.user.email) LIKE
                LOWER(CONCAT('%', :keyword, '%'))
            OR CAST(o.id AS String) = :keyword
        )
        ORDER BY o.createdAt DESC, o.id DESC
        """,
            countQuery = """
        SELECT COUNT(o)
        FROM Order o
        WHERE (:status IS NULL OR o.status = :status)
        AND (
            :keyword = ''
            OR LOWER(o.user.email) LIKE
                LOWER(CONCAT('%', :keyword, '%'))
            OR CAST(o.id AS String) = :keyword
        )
        """
    )
    Page<AdminOrderResponse> searchAdminOrders(
            @Param("keyword") String keyword,
            @Param("status") OrderStatus status,
            Pageable pageable
    );
}
