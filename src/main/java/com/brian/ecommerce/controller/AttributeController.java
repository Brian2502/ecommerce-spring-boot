
package com.brian.ecommerce.controller;

import com.brian.ecommerce.dto.attribute.*;
import com.brian.ecommerce.entity.*;
import com.brian.ecommerce.service.AttributeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class AttributeController {

    private final AttributeService service;

    public AttributeController(AttributeService service) {
        this.service = service;
    }

    public record GroupResponse(Long id, String name, Integer sortOrder) {}

    public record AttributeResponse(
            Long id, Long groupId, String name,
            String code, String unit, Integer sortOrder
    ) {}

    @GetMapping("/attribute-groups")
    public List<GroupResponse> getGroups() {
        return service.getGroups().stream()
                .map(g -> new GroupResponse(
                        g.getId(), g.getName(), g.getSortOrder()
                ))
                .toList();
    }

    @PostMapping("/attribute-groups")
    @ResponseStatus(HttpStatus.CREATED)
    public GroupResponse createGroup(
            @Valid @RequestBody AttributeGroupRequest request
    ) {
        AttributeGroup group = service.createGroup(request);

        return new GroupResponse(
                group.getId(), group.getName(), group.getSortOrder()
        );
    }

    @PostMapping("/attributes")
    @ResponseStatus(HttpStatus.CREATED)
    public AttributeResponse createAttribute(
            @Valid @RequestBody AttributeRequest request
    ) {
        Attribute attribute = service.createAttribute(request);

        return new AttributeResponse(
                attribute.getId(),
                attribute.getGroup().getId(),
                attribute.getName(),
                attribute.getCode(),
                attribute.getUnit(),
                attribute.getSortOrder()
        );
    }

    @PutMapping("/products/{productId}/attributes/{attributeId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void setProductAttribute(
            @PathVariable Long productId,
            @PathVariable Long attributeId,
            @Valid @RequestBody AttributeValueRequest request
    ) {
        service.setProductAttribute(productId, attributeId, request);
    }

    @GetMapping("/products/{productId}/specifications")
    public List<SpecificationResponse> getSpecifications(
            @PathVariable Long productId
    ) {
        return service.getSpecifications(productId);
    }

    @GetMapping("/attributes")
    public List<AttributeResponse> getAttributes(
            @RequestParam(required = false) Long groupId
    ) {
        return service.getAttributes(groupId).stream()
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
}
