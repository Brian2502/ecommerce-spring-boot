
package com.brian.ecommerce.repository;

import com.brian.ecommerce.entity.ProductVariant;
import com.brian.ecommerce.dto.admin.AdminVariantResponse;

import jakarta.persistence.LockModeType;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.brian.ecommerce.dto.variant.ProductVariantSummary;

import java.util.List;
import java.util.Optional;

public interface ProductVariantRepository
        extends JpaRepository<ProductVariant, Long> {

    List<ProductVariant> findByProductIdOrderByIdAsc(
            Long productId
    );

    boolean existsBySkuIgnoreCase(String sku);

    boolean existsByProductIdAndColorIgnoreCaseAndStorageIgnoreCase(
            Long productId,
            String color,
            String storage
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT v FROM ProductVariant v WHERE v.id = :id")
    Optional<ProductVariant> findByIdForUpdate(
            @Param("id") Long id
    );

    long countByStockBetween(int minStock, int maxStock);

    // Admin statistics

    long countByStock(Integer stock);

    // Admin search and pagination

    @Query(
            value = """
            SELECT new com.brian.ecommerce.dto.admin.AdminVariantResponse(
                v.id,
                p.id,
                p.name,
                v.sku,
                v.color,
                v.storage,
                v.price,
                v.stock,
                v.imageUrl
            )
            FROM ProductVariant v
            JOIN v.product p
            WHERE (
                :keyword = ''
                OR LOWER(v.sku) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
            )
            AND (:productId IS NULL OR p.id = :productId)
            AND (
                :stockStatus = 'ALL'
                OR (:stockStatus = 'LOW_STOCK' AND v.stock BETWEEN 1 AND 5)
                OR (:stockStatus = 'OUT_OF_STOCK' AND v.stock = 0)
                OR (:stockStatus = 'IN_STOCK' AND v.stock > 5)
            )
            ORDER BY v.id DESC
            """,
            countQuery = """
            SELECT COUNT(v)
            FROM ProductVariant v
            JOIN v.product p
            WHERE (
                :keyword = ''
                OR LOWER(v.sku) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
            )
            AND (:productId IS NULL OR p.id = :productId)
            AND (
                :stockStatus = 'ALL'
                OR (:stockStatus = 'LOW_STOCK' AND v.stock BETWEEN 1 AND 5)
                OR (:stockStatus = 'OUT_OF_STOCK' AND v.stock = 0)
                OR (:stockStatus = 'IN_STOCK' AND v.stock > 5)
            )
            """
    )
    Page<AdminVariantResponse> findAdminVariants(
            @Param("keyword") String keyword,
            @Param("productId") Long productId,
            @Param("stockStatus") String stockStatus,
            Pageable pageable
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
    SELECT v
    FROM ProductVariant v
    WHERE v.product.id = :productId
    ORDER BY v.id ASC
    """)
    List<ProductVariant> findByProductIdForUpdate(
            @Param("productId") Long productId
    );


    @Query("""
    SELECT new com.brian.ecommerce.dto.variant.ProductVariantSummary(
        v.product.id,
        COUNT(v),
        MIN(v.price),
        MAX(v.price),
        MIN(CASE WHEN v.stock > 0 THEN v.price ELSE NULL END),
        SUM(v.stock)
    )
    FROM ProductVariant v
    WHERE v.product.id IN :productIds
    GROUP BY v.product.id
    """)
    List<ProductVariantSummary> findVariantSummaries(
            @Param("productIds") List<Long> productIds
    );
}
