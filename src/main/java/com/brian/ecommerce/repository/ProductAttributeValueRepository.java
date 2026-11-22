package com.brian.ecommerce.repository;

import com.brian.ecommerce.entity.ProductAttributeValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductAttributeValueRepository
        extends JpaRepository<ProductAttributeValue, Long> {

    Optional<ProductAttributeValue>
    findByProductIdAndAttributeId(Long productId, Long attributeId);

    @Query("""
        SELECT pav
        FROM ProductAttributeValue pav
        JOIN FETCH pav.attribute a
        JOIN FETCH a.group
        WHERE pav.product.id = :productId
        ORDER BY a.group.sortOrder ASC,
                 a.group.id ASC,
                 a.sortOrder ASC,
                 a.id ASC
        """)
    List<ProductAttributeValue> findSpecifications(
            @Param("productId") Long productId
    );
}