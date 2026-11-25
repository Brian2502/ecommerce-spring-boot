
package com.brian.ecommerce.controller;

import com.brian.ecommerce.dto.variant.*;
import com.brian.ecommerce.service.ProductVariantService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products/{productId}/variants")
public class ProductVariantController {

    private final ProductVariantService service;

    public ProductVariantController(ProductVariantService service) {
        this.service = service;
    }

    @GetMapping
    public List<ProductVariantResponse> getVariants(
            @PathVariable Long productId
    ) {
        return service.getVariants(productId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductVariantResponse createVariant(
            @PathVariable Long productId,
            @Valid @RequestBody ProductVariantRequest request
    ) {
        return service.createVariant(productId, request);
    }
}
