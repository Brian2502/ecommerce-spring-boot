
package com.brian.ecommerce.controller;

import com.brian.ecommerce.entity.Attribute;
import com.brian.ecommerce.service.CategoryAttributeService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryAttributeController {

    private final CategoryAttributeService service;

    public CategoryAttributeController(CategoryAttributeService service) {
        this.service = service;
    }

    public record AttributeResponse(
            Long id,
            Long groupId,
            String name,
            String code,
            String unit,
            Integer sortOrder
    ) {}

    @GetMapping("/{categoryId}/attributes")
    public List<AttributeResponse> getAttributes(
            @PathVariable Long categoryId
    ) {
        return service.getAttributes(categoryId)
                .stream()
                .map(attribute -> new AttributeResponse(
                        attribute.getId(),
                        attribute.getGroup().getId(),
                        attribute.getName(),
                        attribute.getCode(),
                        attribute.getUnit(),
                        attribute.getSortOrder()
                ))
                .toList();
    }

    @PostMapping("/{categoryId}/attributes/{attributeId}")
    @ResponseStatus(HttpStatus.CREATED)
    public void addAttribute(
            @PathVariable Long categoryId,
            @PathVariable Long attributeId
    ) {
        service.addAttribute(categoryId, attributeId);
    }

    @DeleteMapping("/{categoryId}/attributes/{attributeId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeAttribute(
            @PathVariable Long categoryId,
            @PathVariable Long attributeId
    ) {
        service.removeAttribute(categoryId, attributeId);
    }
}
