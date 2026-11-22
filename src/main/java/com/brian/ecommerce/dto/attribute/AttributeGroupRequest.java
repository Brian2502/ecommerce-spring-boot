package com.brian.ecommerce.dto.attribute;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AttributeGroupRequest(
        @NotBlank @Size(max = 100) String name,
        Integer sortOrder
) {}