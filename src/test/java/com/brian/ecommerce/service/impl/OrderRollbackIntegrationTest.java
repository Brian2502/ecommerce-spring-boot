
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
}
