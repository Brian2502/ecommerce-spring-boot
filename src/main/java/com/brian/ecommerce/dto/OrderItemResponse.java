
package com.brian.ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class OrderItemResponse {

    private Long productId;
    private Long variantId;
    private String productName;
    private String color;
    private String storage;
    private Integer quantity;
    private BigDecimal price;
}
