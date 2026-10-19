
package com.brian.ecommerce.service.impl;

import com.brian.ecommerce.dto.ProductRequest;
import com.brian.ecommerce.dto.ProductResponse;
import com.brian.ecommerce.entity.Category;
import com.brian.ecommerce.entity.Product;
import com.brian.ecommerce.exception.CategoryNotFoundException;
import com.brian.ecommerce.exception.ProductNotFoundException;
import com.brian.ecommerce.repository.CategoryRepository;
import com.brian.ecommerce.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceImplTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private ProductServiceImpl productService;

    private Category category;
    private ProductRequest request;

    @BeforeEach
    void setUp() {
        category = new Category();
        category.setId(1L);
        category.setName("Laptop");

        request = new ProductRequest();
        request.setName("ThinkPad");
        request.setDescription("Business laptop");
        request.setPrice(new BigDecimal("20000000"));
        request.setStock(10);
        request.setCategoryId(1L);
    }

    @Test
    void createProduct_shouldReturnProductResponse() {
        when(categoryRepository.findById(1L))
                .thenReturn(Optional.of(category));

        when(productRepository.save(any(Product.class)))
                .thenAnswer(invocation -> {
                    Product product = invocation.getArgument(0);
                    product.setId(100L);
                    return product;
                });

        ProductResponse response =
                productService.createProduct(request);

        assertNotNull(response);
        assertEquals(100L, response.getId());
        assertEquals("ThinkPad", response.getName());
        assertEquals(new BigDecimal("20000000"), response.getPrice());
        assertEquals(10, response.getStock());
        assertEquals(1L, response.getCategoryId());
        assertEquals("Laptop", response.getCategoryName());

        verify(categoryRepository).findById(1L);
        verify(productRepository).save(any(Product.class));
    }

    @Test
    void createProduct_shouldThrowWhenCategoryNotFound() {
        when(categoryRepository.findById(1L))
                .thenReturn(Optional.empty());

        assertThrows(
                CategoryNotFoundException.class,
                () -> productService.createProduct(request)
        );

        verify(productRepository, never()).save(any(Product.class));
    }

    @Test
    void getProductById_shouldThrowWhenProductNotFound() {
        when(productRepository.findByIdWithCategory(999L))
                .thenReturn(Optional.empty());

        assertThrows(
                ProductNotFoundException.class,
                () -> productService.getProductById(999L)
        );

        verify(productRepository).findByIdWithCategory(999L);
    }


    @Test
    void updateProduct_shouldReturnUpdatedProduct() {
        Product existingProduct = new Product();
        existingProduct.setId(100L);
        existingProduct.setName("Old Laptop");
        existingProduct.setDescription("Old description");
        existingProduct.setPrice(new BigDecimal("15000000"));
        existingProduct.setStock(5);
        existingProduct.setCategory(category);

        request.setName("New Laptop");
        request.setPrice(new BigDecimal("20000000"));
        request.setStock(10);

        when(productRepository.findById(100L))
                .thenReturn(Optional.of(existingProduct));
        when(categoryRepository.findById(1L))
                .thenReturn(Optional.of(category));
        when(productRepository.save(any(Product.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        ProductResponse response = productService.updateProduct(100L, request);

        assertEquals("New Laptop", response.getName());
        assertEquals(new BigDecimal("20000000"), response.getPrice());
        assertEquals(10, response.getStock());

        verify(productRepository).save(existingProduct);
    }

    @Test
    void deleteProduct_shouldDeleteProduct() {
        Product product = new Product();
        product.setId(100L);

        when(productRepository.findById(100L))
                .thenReturn(Optional.of(product));

        productService.deleteProduct(100L);

        verify(productRepository).delete(product);
    }

    @Test
    void getAllProducts_shouldThrowWhenSortFieldInvalid() {
        assertThrows(IllegalArgumentException.class,
                () -> productService.getAllProducts(
                        null, null, "invalidField", "asc", 0, 10
                ));

        verifyNoInteractions(productRepository);
    }

}
