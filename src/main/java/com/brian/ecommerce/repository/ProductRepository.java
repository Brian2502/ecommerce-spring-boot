package com.brian.ecommerce.repository;

import com.brian.ecommerce.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("""
            SELECT p
            FROM Product p
            JOIN FETCH p.category
            """)
    List<Product> findAllWithCategory();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""  
        SELECT p
        FROM Product p
        WHERE p.id = :id
        """)
    Optional<Product> findByIdForUpdate(@Param("id") Long id);

    @EntityGraph(attributePaths = "category")
    Page<Product> findByNameContainingIgnoreCase(
            String keyword,
            Pageable pageable
    );

    @EntityGraph(attributePaths = "category")
    Page<Product> findByCategoryId(
            Long categoryId,
            Pageable pageable
    );

    @EntityGraph(attributePaths = "category")
    Page<Product> findByNameContainingIgnoreCaseAndCategoryId(
            String keyword,
            Long categoryId,
            Pageable pageable
    );

    @EntityGraph(attributePaths = "category")
    @Query("""
        SELECT p
        FROM Product p
        """)
    Page<Product> findAllWithCategory(Pageable pageable);

    @Query("""
        SELECT p
        FROM Product p
        JOIN FETCH p.category
        WHERE p.id = :id
        """)
    Optional<Product> findByIdWithCategory(@Param("id") Long id);

    @Query(
            value = """
        SELECT p
        FROM Product p
        WHERE (
            :keyword = ''
            OR LOWER(p.name) LIKE LOWER(
                CONCAT('%', :keyword, '%')
            )
        )
        AND (:categoryId IS NULL OR p.category.id = :categoryId)
        ORDER BY
            CASE WHEN :sortDir = 'asc' THEN
                COALESCE(
                    (SELECT MIN(v.price)
                     FROM ProductVariant v
                     WHERE v.product.id = p.id
                     AND v.stock > 0),
                    (SELECT MIN(v.price)
                     FROM ProductVariant v
                     WHERE v.product.id = p.id),
                    p.price
                )
            END ASC,
            CASE WHEN :sortDir = 'desc' THEN
                COALESCE(
                    (SELECT MIN(v.price)
                     FROM ProductVariant v
                     WHERE v.product.id = p.id
                     AND v.stock > 0),
                    (SELECT MIN(v.price)
                     FROM ProductVariant v
                     WHERE v.product.id = p.id),
                    p.price
                )
            END DESC,
            p.id ASC
        """,
            countQuery = """
        SELECT COUNT(p)
        FROM Product p
        WHERE (
            :keyword = ''
            OR LOWER(p.name) LIKE LOWER(
                CONCAT('%', :keyword, '%')
            )
        )
        AND (:categoryId IS NULL OR p.category.id = :categoryId)
        """
    )
    @EntityGraph(attributePaths = "category")
    Page<Product> findAllSortedByEffectivePrice(
            @Param("keyword") String keyword,
            @Param("categoryId") Long categoryId,
            @Param("sortDir") String sortDir,
            Pageable pageable
    );
}