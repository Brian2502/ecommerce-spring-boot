
package com.brian.ecommerce.service.impl;

import com.brian.ecommerce.entity.*;
import com.brian.ecommerce.repository.*;
import com.brian.ecommerce.service.OrderService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class OrderRollbackIntegrationTest {

    @Autowired private OrderService orderService;
    @Autowired private UserRepository userRepository;
    @Autowired private CartRepository cartRepository;
    @Autowired private CartItemRepository cartItemRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private CategoryRepository categoryRepository;
    @Autowired private OrderRepository orderRepository;
    @Autowired
    private ProductVariantRepository variantRepository;

    @Test
    void shouldNotCreateOrderOrChangeStockWhenCheckoutFails() {

        String suffix = UUID.randomUUID().toString();

        // 1. Create category
        Category category = new Category();
        category.setName("Rollback Category " + suffix);
        category.setDescription("Test");
        category = categoryRepository.save(category);

        // 2. Product A: enough stock
        Product productA = new Product();
        productA.setName("Product A " + suffix);
        productA.setDescription("Test");
        productA.setPrice(BigDecimal.valueOf(1000));
        productA.setStock(10);
        productA.setCategory(category);
        productA = productRepository.save(productA);

        // 3. Product B: insufficient stock
        Product productB = new Product();
        productB.setName("Product B " + suffix);
        productB.setDescription("Test");
        productB.setPrice(BigDecimal.valueOf(2000));
        productB.setStock(1);
        productB.setCategory(category);
        productB = productRepository.save(productB);

        Long productAId = productA.getId();
        Long productBId = productB.getId();

        // 4. Create user
        User user = new User();
        user.setName("Rollback User");
        user.setEmail("rollback-" + suffix + "@gmail.com");
        user.setPassword("password");
        user.setRole("USER");
        user = userRepository.save(user);

        Long userId = user.getId();
        String email = user.getEmail();

        // 5. Create cart
        Cart cart = new Cart();
        cart.setUser(user);
        cart = cartRepository.save(cart);

        // 6. Add Product A
        CartItem itemA = new CartItem();
        itemA.setCart(cart);
        itemA.setProduct(productA);
        itemA.setQuantity(2);
        cartItemRepository.save(itemA);

        // 7. Add Product B
        CartItem itemB = new CartItem();
        itemB.setCart(cart);
        itemB.setProduct(productB);
        itemB.setQuantity(5);
        cartItemRepository.save(itemB);

        // 8. Checkout must fail
        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> orderService.checkout(email)
        );

        assertTrue(
                exception.getMessage().contains("Not enough stock")
        );

        // 9. Verify stock unchanged
        Product updatedA = productRepository
                .findById(productAId)
                .orElseThrow();

        Product updatedB = productRepository
                .findById(productBId)
                .orElseThrow();

        assertEquals(10, updatedA.getStock());
        assertEquals(1, updatedB.getStock());

        // 10. No order created
        assertEquals(
                0,
                orderRepository.findByUserId(userId).size()
        );

        // 11. Cart items remain unchanged
        List<CartItem> remainingItems =
                cartItemRepository.findByCart(cart);

        assertEquals(2, remainingItems.size());

        assertTrue(remainingItems.stream().anyMatch(
                item -> item.getProduct().getId().equals(productAId)
                        && item.getQuantity() == 2
        ));

        assertTrue(remainingItems.stream().anyMatch(
                item -> item.getProduct().getId().equals(productBId)
                        && item.getQuantity() == 5
        ));
    }


    @Test
    void shouldNotCreateOrderOrChangeVariantStockWhenCheckoutFails() {

        String suffix = UUID.randomUUID().toString();

        // 1. Create category
        Category category = new Category();
        category.setName("Variant Rollback " + suffix);
        category.setDescription("Test");
        category = categoryRepository.save(category);

        // 2. Create base product
        Product product = new Product();
        product.setName("iPhone " + suffix);
        product.setDescription("Variant rollback test");
        product.setPrice(BigDecimal.valueOf(20000000));
        product.setStock(100);
        product.setCategory(category);
        product = productRepository.save(product);

        Long productId = product.getId();

        // 3. Variant A: enough stock
        ProductVariant variantA = new ProductVariant();
        variantA.setProduct(product);
        variantA.setSku("ROLL-A-" + suffix);
        variantA.setColor("Black");
        variantA.setStorage("128GB");
        variantA.setPrice(BigDecimal.valueOf(22000000));
        variantA.setStock(10);
        variantA = variantRepository.save(variantA);

        Long variantAId = variantA.getId();

        // 4. Variant B: insufficient stock
        ProductVariant variantB = new ProductVariant();
        variantB.setProduct(product);
        variantB.setSku("ROLL-B-" + suffix);
        variantB.setColor("White");
        variantB.setStorage("256GB");
        variantB.setPrice(BigDecimal.valueOf(25000000));
        variantB.setStock(1);
        variantB = variantRepository.save(variantB);

        Long variantBId = variantB.getId();

        // 5. Create user
        User user = new User();
        user.setName("Variant Rollback User");
        user.setEmail("variant-rollback-" + suffix + "@gmail.com");
        user.setPassword("password");
        user.setRole("USER");
        user = userRepository.save(user);

        Long userId = user.getId();
        String email = user.getEmail();

        // 6. Create cart
        Cart cart = new Cart();
        cart.setUser(user);
        cart = cartRepository.save(cart);

        // 7. Add variant A: quantity = 2
        CartItem itemA = new CartItem();
        itemA.setCart(cart);
        itemA.setProduct(product);
        itemA.setVariant(variantA);
        itemA.setQuantity(2);
        cartItemRepository.save(itemA);

        // 8. Add variant B: quantity = 3
        CartItem itemB = new CartItem();
        itemB.setCart(cart);
        itemB.setProduct(product);
        itemB.setVariant(variantB);
        itemB.setQuantity(3);
        cartItemRepository.save(itemB);

        // 9. Checkout must fail
        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> orderService.checkout(email)
        );

        assertTrue(
                exception.getMessage().contains("Not enough stock"),
                exception.getMessage()
        );

        // 10. Verify variant stock unchanged
        ProductVariant updatedA = variantRepository
                .findById(variantAId)
                .orElseThrow();

        ProductVariant updatedB = variantRepository
                .findById(variantBId)
                .orElseThrow();

        assertEquals(10, updatedA.getStock());
        assertEquals(1, updatedB.getStock());

        // 11. Verify base product stock unchanged
        Product updatedProduct = productRepository
                .findById(productId)
                .orElseThrow();

        assertEquals(100, updatedProduct.getStock());

        // 12. No order created
        assertTrue(
                orderRepository.findByUserId(userId).isEmpty()
        );

        // 13. Cart items remain unchanged
        List<CartItem> remainingItems =
                cartItemRepository.findByCart(cart);

        assertEquals(2, remainingItems.size());

        assertTrue(remainingItems.stream().anyMatch(
                item -> item.getVariant() != null
                        && item.getVariant().getId().equals(variantAId)
                        && item.getQuantity() == 2
        ));

        assertTrue(remainingItems.stream().anyMatch(
                item -> item.getVariant() != null
                        && item.getVariant().getId().equals(variantBId)
                        && item.getQuantity() == 3
        ));
    }

}
