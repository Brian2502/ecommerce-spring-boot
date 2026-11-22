package com.brian.ecommerce.dto.attribute;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AttributeValueRequest(
        @NotBlank @Size(max = 500) String value
) {}