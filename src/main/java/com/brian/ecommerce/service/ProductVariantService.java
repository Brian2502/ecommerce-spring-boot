
package com.brian.ecommerce.service;

import com.brian.ecommerce.dto.variant.*;
import com.brian.ecommerce.entity.*;
import com.brian.ecommerce.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.brian.ecommerce.dto.admin.AdminVariantResponse;
import com.brian.ecommerce.dto.admin.VariantStatisticsResponse;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.Set;

import java.util.List;

@Service
public class ProductVariantService {

    private final ProductVariantRepository variantRepository;
    private final ProductRepository productRepository;
    private final CartItemRepository cartItemRepository;
    private final OrderItemRepository orderItemRepository;

    public ProductVariantService(
            ProductVariantRepository variantRepository,
            ProductRepository productRepository,
            CartItemRepository cartItemRepository,
            OrderItemRepository orderItemRepository
    ) {
        this.variantRepository = variantRepository;
        this.productRepository = productRepository;
        this.cartItemRepository = cartItemRepository;
        this.orderItemRepository = orderItemRepository;
    }

    @Transactional
    public ProductVariantResponse createVariant(
            Long productId,
            ProductVariantRequest request
    ) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Product not found"
                ));

        String sku = request.sku().trim();
        String color = request.color().trim();
        String storage = request.storage().trim();

        if (variantRepository.existsBySkuIgnoreCase(sku)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "SKU already exists"
            );
        }

        if (variantRepository
                .existsByProductIdAndColorIgnoreCaseAndStorageIgnoreCase(
                        productId, color, storage
                )) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Product variant already exists"
            );
        }

        ProductVariant variant = new ProductVariant();
        variant.setProduct(product);
        variant.setSku(sku);
        variant.setColor(color);
        variant.setStorage(storage);
        variant.setPrice(request.price());
        variant.setStock(request.stock());
        variant.setImageUrl(request.imageUrl());

        return toResponse(variantRepository.save(variant));
    }

    @Transactional(readOnly = true)
    public List<ProductVariantResponse> getVariants(Long productId) {
        if (!productRepository.existsById(productId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Product not found"
            );
        }

        return variantRepository.findByProductIdOrderByIdAsc(productId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private ProductVariantResponse toResponse(
            ProductVariant variant
    ) {
        return new ProductVariantResponse(
                variant.getId(),
                variant.getProduct().getId(),
                variant.getSku(),
                variant.getColor(),
                variant.getStorage(),
                variant.getPrice(),
                variant.getStock(),
                variant.getImageUrl()
        );
    }



    @Transactional(readOnly = true)
    public Page<AdminVariantResponse> getAdminVariants(
            String keyword,
            Long productId,
            String stockStatus,
            int page,
            int size
    ) {
        if (page < 0 || size < 1 || size > 100) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid pagination parameters"
            );
        }

        if (!Set.of(
                "ALL",
                "LOW_STOCK",
                "OUT_OF_STOCK",
                "IN_STOCK"
        ).contains(stockStatus)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid stock status"
            );
        }

        return variantRepository.findAdminVariants(
                keyword == null ? "" : keyword.trim(),
                productId,
                stockStatus,
                PageRequest.of(page, size)
        );
    }

    @Transactional(readOnly = true)
    public VariantStatisticsResponse getStatistics() {

        return new VariantStatisticsResponse(
                variantRepository.count(),
                variantRepository.countByStockBetween(1, 5),
                variantRepository.countByStock(0)
        );
    }

    @Transactional
    public ProductVariantResponse updateVariant(
            Long variantId,
            VariantUpdateRequest request
    ) {
        ProductVariant variant =
                variantRepository.findByIdForUpdate(variantId)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Product variant not found"
                                )
                        );

        variant.setPrice(request.price());
        variant.setStock(request.stock());
        variant.setImageUrl(request.imageUrl());

        return toResponse(
                variantRepository.save(variant)
        );
    }


    @Transactional
    public void deleteVariant(Long variantId) {

        ProductVariant variant =
                variantRepository.findByIdForUpdate(variantId)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Product variant not found"
                                )
                        );

        if (orderItemRepository.existsByVariantId(variantId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Cannot delete variant because it exists in orders"
            );
        }

        if (cartItemRepository.existsByVariantId(variantId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Cannot delete variant because it exists in shopping carts"
            );
        }

        try {
            variantRepository.delete(variant);
            variantRepository.flush();

        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Cannot delete variant because it is being used",
                    ex
            );
        }
    }


}
