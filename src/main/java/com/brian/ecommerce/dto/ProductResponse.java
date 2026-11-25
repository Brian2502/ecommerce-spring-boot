package com.brian.ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {

    private Long id;
    private String name;
    private String description;
    private String imageUrl;
    private BigDecimal price;
    private Integer stock;
    private Long categoryId;
    private String categoryName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Variant summary

    private boolean hasVariants;
    private long variantCount;
    private BigDecimal minVariantPrice;
    private BigDecimal maxVariantPrice;
    private long totalVariantStock;

    // Backward-compatible constructor

    public ProductResponse(
            Long id,
            String name,
            String description,
            String imageUrl,
            BigDecimal price,
            Integer stock,
            Long categoryId,
            String categoryName,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {
        this(
                id,
                name,
                description,
                imageUrl,
                price,
                stock,
                categoryId,
                categoryName,
                createdAt,
                updatedAt,
                false,
                0L,
                null,
                null,
                0L
        );
    }
}