package com.brian.ecommerce.dto.variant;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record VariantUpdateRequest(

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