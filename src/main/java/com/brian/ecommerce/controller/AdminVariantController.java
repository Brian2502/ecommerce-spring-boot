
package com.brian.ecommerce.controller;

import com.brian.ecommerce.dto.admin.AdminVariantResponse;
import com.brian.ecommerce.dto.admin.VariantStatisticsResponse;
import com.brian.ecommerce.dto.variant.ProductVariantResponse;
import com.brian.ecommerce.dto.variant.VariantUpdateRequest;
import com.brian.ecommerce.service.ProductVariantService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/admin/variants")
@RequiredArgsConstructor
public class AdminVariantController {

    private final ProductVariantService variantService;

    @GetMapping
    public Page<AdminVariantResponse> getVariants(
            @RequestParam(defaultValue = "")
            String keyword,

            @RequestParam(required = false)
            Long productId,

            @RequestParam(defaultValue = "ALL")
            String stockStatus,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "10")
            int size
    ) {
        return variantService.getAdminVariants(
                keyword,
                productId,
                stockStatus,
                page,
                size
        );
    }

    @GetMapping("/statistics")
    public VariantStatisticsResponse getStatistics() {
        return variantService.getStatistics();
    }

    @PutMapping("/{id}")
    public ProductVariantResponse updateVariant(
            @PathVariable Long id,
            @Valid @RequestBody VariantUpdateRequest request
    ) {
        return variantService.updateVariant(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteVariant(@PathVariable Long id) {
        variantService.deleteVariant(id);
    }
}
