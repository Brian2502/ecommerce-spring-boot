package com.brian.ecommerce.service.impl;

import com.brian.ecommerce.entity.*;
import com.brian.ecommerce.enums.OrderStatus;
import com.brian.ecommerce.repository.*;
import com.brian.ecommerce.service.OrderService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class OrderCheckoutIntegrationTest {

    @Autowired private OrderService orderService;
    @Autowired private UserRepository userRepository;
    @Autowired private CategoryRepository categoryRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private CartRepository cartRepository;
    @Autowired private CartItemRepository cartItemRepository;
    @Autowired private OrderRepository orderRepository;
    @Autowired private OrderItemRepository orderItemRepository;

    @Test
    void shouldCheckoutSuccessfully() {

        String suffix = UUID.randomUUID().toString();

        // 1. Category
        Category category = new Category();
        category.setName("Checkout Category " + suffix);
        category.setDescription("Test");
        category = categoryRepository.save(category);

        // 2. Product A: stock = 10
        Product productA = new Product();
        productA.setName("Product A " + suffix);
        productA.setDescription("Test");
        productA.setPrice(BigDecimal.valueOf(1000));
        productA.setStock(10);
        productA.setCategory(category);
        productA = productRepository.save(productA);

        // 3. Product B: stock = 5
        Product productB = new Product();
        productB.setName("Product B " + suffix);
        productB.setDescription("Test");
        productB.setPrice(BigDecimal.valueOf(2000));
        productB.setStock(5);
        productB.setCategory(category);
        productB = productRepository.save(productB);

        Long productAId = productA.getId();
        Long productBId = productB.getId();

        // 4. User
        User user = new User();
        user.setName("Checkout User");
        user.setEmail("checkout-" + suffix + "@gmail.com");
        user.setPassword("password");
        user.setRole("USER");
        user = userRepository.save(user);

        Long userId = user.getId();
        String email = user.getEmail();

        // 5. Cart
        Cart cart = new Cart();
        cart.setUser(user);
        cart = cartRepository.save(cart);

        // 6. CartItem A: quantity = 2
        CartItem itemA = new CartItem();
        itemA.setCart(cart);
        itemA.setProduct(productA);
        itemA.setQuantity(2);
        cartItemRepository.save(itemA);

        // 7. CartItem B: quantity = 2
        CartItem itemB = new CartItem();
        itemB.setCart(cart);
        itemB.setProduct(productB);
        itemB.setQuantity(2);
        cartItemRepository.save(itemB);

        // 8. Checkout
        assertDoesNotThrow(
                () -> orderService.checkout(email)
        );

        // 9. Verify Order
        List<Order> orders =
                orderRepository.findByUserId(userId);

        assertEquals(1, orders.size());

        Order order = orders.get(0);

        assertEquals(OrderStatus.PENDING, order.getStatus());

        // 2*1000 + 2*2000 = 6000
        assertEquals(
                0,
                BigDecimal.valueOf(6000)
                        .compareTo(order.getTotalPrice())
        );

        // 10. Verify OrderItems
        List<OrderItem> orderItems =
                orderItemRepository.findByOrderId(order.getId());

        assertEquals(2, orderItems.size());

        assertTrue(orderItems.stream().anyMatch(
                item -> item.getProduct().getId().equals(productAId)
                        && item.getQuantity() == 2
                        && item.getPrice().compareTo(
                        BigDecimal.valueOf(1000)) == 0
        ));

        assertTrue(orderItems.stream().anyMatch(
                item -> item.getProduct().getId().equals(productBId)
                        && item.getQuantity() == 2
                        && item.getPrice().compareTo(
                        BigDecimal.valueOf(2000)) == 0
        ));

        // 11. Verify stock
        Product updatedA = productRepository
                .findById(productAId)
                .orElseThrow();

        Product updatedB = productRepository
                .findById(productBId)
                .orElseThrow();

        assertEquals(8, updatedA.getStock());
        assertEquals(3, updatedB.getStock());

        // 12. Verify cart is empty
        assertTrue(
                cartItemRepository.findByCart(cart).isEmpty()
        );
    }
}
