package com.brian.ecommerce.dto.variant;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record ProductVariantRequest(

        @NotBlank
        @Size(max = 100)
        String sku,

        @NotBlank
        @Size(max = 100)
        String color,

        @NotBlank
        @Size(max = 100)
        String storage,

        @NotNull
        @DecimalMin(value = "0.0", inclusive = false)
        @Digits(integer = 13, fraction = 2)
        BigDecimal price,

        @NotNull
        @PositiveOrZero
        Integer stock,

        @Size(max = 1000)
        String imageUrl

) {
}