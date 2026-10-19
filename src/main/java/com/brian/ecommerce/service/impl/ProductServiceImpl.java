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
import java.util.List;
import java.util.Set;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductServiceImpl(
            ProductRepository productRepository,
            CategoryRepository categoryRepository) {

        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
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
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setCategory(category);

        Product savedProduct = productRepository.save(product);

        return toResponse(savedProduct);
    }



    @Override
    public ProductResponse getProductById(Long id) {

        Product product = productRepository.findByIdWithCategory(id)
                .orElseThrow(() ->
                        new ProductNotFoundException(
                                "Product not found with id: " + id
                        ));

        return toResponse(product);
    }

    @Override
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
        existingProduct.setPrice(request.getPrice());
        existingProduct.setStock(request.getStock());
        existingProduct.setCategory(category);

        Product updatedProduct =
                productRepository.save(existingProduct);

        return toResponse(updatedProduct);
    }

    @Override
    public void deleteProduct(Long id) {

        Product product = productRepository.findById(id)
                .orElseThrow(() ->
                        new ProductNotFoundException(
                                "Product not found with id: " + id
                        ));

        productRepository.delete(product);
    }

    private ProductResponse toResponse(Product product) {

        Category category = product.getCategory();

        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getStock(),
                category.getId(),
                category.getName(),
                product.getCreatedAt(),
                product.getUpdatedAt()
        );
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

        if (keyword != null && !keyword.isBlank()
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

        return products.map(product ->
                new ProductResponse(
                        product.getId(),
                        product.getName(),
                        product.getDescription(),
                        product.getPrice(),
                        product.getStock(),
                        product.getCategory().getId(),
                        product.getCategory().getName(),
                        product.getCreatedAt(),
                        product.getUpdatedAt()
                )
        );
    }

}