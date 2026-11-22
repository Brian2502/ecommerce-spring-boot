package com.brian.ecommerce.dto.attribute;

import java.util.List;

public record SpecificationResponse(
        Long groupId,
        String groupName,
        List<SpecificationItem> attributes
) {
    public record SpecificationItem(
            Long attributeId,
            String name,
            String code,
            String value,
            String unit
    ) {}
}