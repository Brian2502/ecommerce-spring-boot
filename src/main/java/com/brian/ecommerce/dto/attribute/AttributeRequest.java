package com.brian.ecommerce.dto.attribute;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AttributeRequest(
        @NotNull Long groupId,
        @NotBlank @Size(max = 100) String name,
        @NotBlank @Size(max = 100) String code,
        @Size(max = 30) String unit,
        Integer sortOrder
) {}