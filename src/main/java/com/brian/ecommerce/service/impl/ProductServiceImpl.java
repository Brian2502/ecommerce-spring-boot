package com.brian.ecommerce.service.impl;

import com.brian.ecommerce.dto.ProductRequest;
import com.brian.ecommerce.dto.ProductResponse;
import com.brian.ecommerce.entity.Category;
import com.brian.ecommerce.entity.Product;
import com.brian.ecommerce.exception.CategoryNotFoundException;
import com.brian.ecommerce.repository.CategoryRepository;
import com.brian.ecommerce.repository.ProductRepository;
import com.brian.ecommerce.service.ProductService;
import org.springframework.stereotype.Service;
import com.brian.ecommerce.exception.ProductNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import java.util.Set;

import com.brian.ecommerce.entity.ProductVariant;

import com.brian.ecommerce.repository.CartItemRepository;
import com.brian.ecommerce.repository.OrderItemRepository;
import com.brian.ecommerce.repository.ProductVariantRepository;
import com.brian.ecommerce.repository.ProductAttributeValueRepository;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import com.brian.ecommerce.dto.variant.ProductVariantSummary;

import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import java.util.List;

@Service
public class ProductServiceImpl implements ProductService {


    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductVariantRepository variantRepository;
    private final CartItemRepository cartItemRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductAttributeValueRepository productAttributeValueRepository;
    private final CacheManager cacheManager;

    public ProductServiceImpl(
            ProductRepository productRepository,
            CategoryRepository categoryRepository,
            ProductVariantRepository variantRepository,
            CartItemRepository cartItemRepository,
            OrderItemRepository orderItemRepository,
            ProductAttributeValueRepository productAttributeValueRepository,
            CacheManager cacheManager
    ) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.variantRepository = variantRepository;
        this.cartItemRepository = cartItemRepository;
        this.orderItemRepository = orderItemRepository;
        this.productAttributeValueRepository = productAttributeValueRepository;
        this.cacheManager = cacheManager;
    }


    @Override
    public ProductResponse createProduct(ProductRequest request) {

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() ->
                        new CategoryNotFoundException(
                                "Category not found with id: "
                                        + request.getCategoryId()
                        ));

        Product product = new Product();

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setImageUrl(request.getImageUrl());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setCategory(category);

        Product savedProduct = productRepository.save(product);

        return toResponse(savedProduct);
    }



    @Override
    @Cacheable(
            value = "products",
            key = "#id"
    )
    public ProductResponse getProductById(Long id) {

        Product product = productRepository.findByIdWithCategory(id)
                .orElseThrow(() ->
                        new ProductNotFoundException(
                                "Product not found with id: " + id
                        ));

        return toResponse(product);
    }

    @Override
    @CacheEvict(value = "products", key = "#id")
    public ProductResponse updateProduct(
            Long id,
            ProductRequest request) {

        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() ->
                        new ProductNotFoundException(
                                "Product not found with id: " + id
                        ));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() ->
                        new CategoryNotFoundException(
                                "Category not found with id: "
                                        + request.getCategoryId()
                        ));

        existingProduct.setName(request.getName());
        existingProduct.setDescription(request.getDescription());
        existingProduct.setImageUrl(request.getImageUrl());
        existingProduct.setPrice(request.getPrice());
        existingProduct.setStock(request.getStock());
        existingProduct.setCategory(category);

        Product updatedProduct =
                productRepository.save(existingProduct);

        return toResponse(updatedProduct);
    }


    @Override
    @Transactional
    public void deleteProduct(Long id) {

        // 1. Find and lock product
        Product product = productRepository.findByIdForUpdate(id)
                .orElseThrow(() ->
                        new ProductNotFoundException(
                                "Product not found with id: " + id
                        )
                );

        // 2. Find and lock all variants
        List<ProductVariant> variants =
                variantRepository.findByProductIdForUpdate(id);

        // 3. Check order history
        if (orderItemRepository.existsByProductId(id)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Cannot delete product because it exists in orders"
            );
        }

        // 4. Check shopping carts
        if (cartItemRepository.existsByProductId(id)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Cannot delete product because it exists in shopping carts"
            );
        }

        // 5. Check variant references
        for (ProductVariant variant : variants) {

            if (orderItemRepository.existsByVariantId(
                    variant.getId()
            )) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Cannot delete product because its variants exist in orders"
                );
            }

            if (cartItemRepository.existsByVariantId(
                    variant.getId()
            )) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Cannot delete product because its variants exist in shopping carts"
                );
            }
        }

        try {

            // 6. Delete product specifications
            productAttributeValueRepository.deleteByProductId(id);
            productAttributeValueRepository.flush();

            // 7. Delete product variants
            variantRepository.deleteAll(variants);
            variantRepository.flush();

            // 8. Delete product
            productRepository.delete(product);
            productRepository.flush();

        } catch (DataIntegrityViolationException ex) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Cannot delete product because it is being used",
                    ex
            );
        }

        // 9. Evict Redis cache after successful commit
        TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {

                    @Override
                    public void afterCommit() {

                        Cache cache =
                                cacheManager.getCache("products");

                        if (cache != null) {
                            cache.evict(id);
                        }
                    }
                }
        );
    }



    private ProductResponse toResponse(Product product) {

        Category category = product.getCategory();

        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getImageUrl(),
                product.getPrice(),
                product.getStock(),
                category.getId(),
                category.getName(),
                product.getCreatedAt(),
                product.getUpdatedAt()
        );
    }

    private ProductResponse applyVariantSummary(
            ProductResponse response,
            ProductVariantSummary summary
    ) {
        if (summary == null) {
            return response;
        }

        response.setHasVariants(true);

        response.setVariantCount(
                summary.variantCount()
        );

        response.setMinVariantPrice(
                summary.minAvailablePrice() != null
                        ? summary.minAvailablePrice()
                        : summary.minPrice()
        );

        response.setMaxVariantPrice(
                summary.maxPrice()
        );

        response.setTotalVariantStock(
                summary.totalStock()
        );

        return response;
    }


    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> getAllProducts(
            String keyword,
            Long categoryId,
            String sortBy,
            String sortDir,
            int page,
            int size) {

        Set<String> allowedSortFields =
                Set.of("price", "name", "createdAt");

        if (!allowedSortFields.contains(sortBy)) {
            throw new IllegalArgumentException(
                    "Invalid sort field: " + sortBy
            );
        }

        Sort sort;

        if (sortDir.equalsIgnoreCase("asc")) {
            sort = Sort.by(sortBy).ascending();
        } else {
            sort = Sort.by(sortBy).descending();
        }

        Pageable pageable =
                PageRequest.of(page, size, sort);

        Page<Product> products;

        if ("price".equals(sortBy)) {

            products = productRepository.findAllSortedByEffectivePrice(
                    keyword == null ? "" : keyword.trim(),
                    categoryId,
                    "asc".equalsIgnoreCase(sortDir) ? "asc" : "desc",
                    PageRequest.of(page, size)
            );

        } else if (keyword != null && !keyword.isBlank()
                && categoryId != null) {

            products =
                    productRepository
                            .findByNameContainingIgnoreCaseAndCategoryId(
                                    keyword,
                                    categoryId,
                                    pageable
                            );

        } else if (keyword != null && !keyword.isBlank()) {

            products =
                    productRepository.findByNameContainingIgnoreCase(
                            keyword,
                            pageable
                    );

        } else if (categoryId != null) {

            products =
                    productRepository.findByCategoryId(
                            categoryId,
                            pageable
                    );

        } else {

            products =
                    productRepository.findAllWithCategory(pageable);
        }

        if (products.isEmpty()) {
            return products.map(this::toResponse);
        }

        List<Long> productIds = products.getContent()
                .stream()
                .map(Product::getId)
                .toList();

        Map<Long, ProductVariantSummary> summaryMap =
                variantRepository.findVariantSummaries(productIds)
                        .stream()
                        .collect(Collectors.toMap(
                                ProductVariantSummary::productId,
                                Function.identity()
                        ));

        return products.map(product ->
                applyVariantSummary(
                        toResponse(product),
                        summaryMap.get(product.getId())
                )
        );
    }

}