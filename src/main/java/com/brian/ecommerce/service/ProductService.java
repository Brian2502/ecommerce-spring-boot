package com.brian.ecommerce.service;

import com.brian.ecommerce.dto.ProductRequest;
import com.brian.ecommerce.dto.ProductResponse;
import org.springframework.data.domain.Page;

import java.util.List;

public interface ProductService {

    ProductResponse createProduct(ProductRequest request);

    Page<ProductResponse> getAllProducts(
            String keyword,
            Long categoryId,
            String sortBy,
            String sortDir,
            int page,
            int size
    );



    ProductResponse getProductById(Long id);

    ProductResponse updateProduct(Long id, ProductRequest request);

    void deleteProduct(Long id);
}