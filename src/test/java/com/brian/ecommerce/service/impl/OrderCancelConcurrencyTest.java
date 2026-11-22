
package com.brian.ecommerce.service.impl;

import com.brian.ecommerce.entity.*;
import com.brian.ecommerce.enums.OrderStatus;
import com.brian.ecommerce.repository.*;
import com.brian.ecommerce.service.OrderService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.*;

import static org.junit.jupiter.api.Assertions.*;

import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class OrderCancelConcurrencyTest {

    @Autowired private OrderService orderService;
    @Autowired private UserRepository userRepository;
    @Autowired private CategoryRepository categoryRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private CartRepository cartRepository;
    @Autowired private CartItemRepository cartItemRepository;
    @Autowired private OrderRepository orderRepository;

    @Test
    void shouldPreventDoubleRestockWhenCancellingConcurrently()
            throws Exception {

        String suffix = UUID.randomUUID().toString();

        // 1. Tạo Category
        Category category = new Category();
        category.setName("Cancel Test " + suffix);
        category.setDescription("Test");
        category = categoryRepository.save(category);

        // 2. Product stock = 10
        Product product = new Product();
        product.setName("Cancel Product " + suffix);
        product.setDescription("Test");
        product.setPrice(BigDecimal.valueOf(1000));
        product.setStock(10);
        product.setCategory(category);
        product = productRepository.save(product);

        Long productId = product.getId();

        // 3. Tạo User
        User user = new User();
        user.setName("Cancel Test User");
        user.setEmail("cancel-" + suffix + "@gmail.com");
        user.setPassword("password");
        user.setRole("USER");
        user = userRepository.save(user);

        String email = user.getEmail();
        Long userId = user.getId();

        // 4. Tạo Cart
        Cart cart = new Cart();
        cart.setUser(user);
        cart = cartRepository.save(cart);

        // 5. Thêm 2 sản phẩm vào Cart
        CartItem item = new CartItem();
        item.setCart(cart);
        item.setProduct(product);
        item.setQuantity(2);
        cartItemRepository.save(item);

        // 6. Checkout
        orderService.checkout(email);

        List<Order> orders =
                orderRepository.findByUserId(userId);

        assertEquals(1, orders.size());

        Long orderId = orders.get(0).getId();

        // Stock sau checkout = 8
        assertEquals(
                8,
                productRepository.findById(productId)
                        .orElseThrow()
                        .getStock()
        );

        // 7. Chuẩn bị hai request hủy đồng thời
        ExecutorService executor =
                Executors.newFixedThreadPool(2);

        CountDownLatch startLatch =
                new CountDownLatch(1);

        try {
            Callable<Boolean> cancelTask = () -> {
                startLatch.await();

                try {
                    orderService.cancelOrder(orderId, email);
                    return true;
                } catch (Exception ex) {
                    return false;
                }
            };

            Future<Boolean> resultA =
                    executor.submit(cancelTask);

            Future<Boolean> resultB =
                    executor.submit(cancelTask);

            // Cho cả hai bắt đầu
            startLatch.countDown();

            boolean successA =
                    resultA.get(15, TimeUnit.SECONDS);

            boolean successB =
                    resultB.get(15, TimeUnit.SECONDS);

            // 8. Chỉ một request hủy thành công
            assertTrue(
                    successA ^ successB,
                    "Exactly one cancellation should succeed"
            );

            // 9. Stock chỉ được hoàn một lần
            Product updatedProduct =
                    productRepository.findById(productId)
                            .orElseThrow();

            assertEquals(
                    10,
                    updatedProduct.getStock(),
                    "Stock must be restored exactly once"
            );

            // 10. Order chuyển sang CANCELLED
            Order updatedOrder =
                    orderRepository.findById(orderId)
                            .orElseThrow();

            assertEquals(
                    OrderStatus.CANCELLED,
                    updatedOrder.getStatus()
            );

        } finally {
            executor.shutdownNow();
        }
    }
}
