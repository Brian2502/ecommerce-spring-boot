package com.brian.ecommerce.service.impl;

import com.brian.ecommerce.entity.*;
import com.brian.ecommerce.enums.OrderStatus;
import com.brian.ecommerce.repository.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.math.BigDecimal;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class TransactionRollbackIntegrationTest {

    @Autowired
    private PlatformTransactionManager transactionManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Test
    void shouldRollbackOrderAndOrderItemAfterRuntimeException() {

        String suffix = UUID.randomUUID().toString();

        // 1. Create test user
        User user = new User();
        user.setName("Rollback User");
        user.setEmail("rollback-tx-" + suffix + "@gmail.com");
        user.setPassword("password");
        user.setRole("USER");
        user = userRepository.save(user);

        // 2. Create category
        Category category = new Category();
        category.setName("TX Category " + suffix);
        category.setDescription("Test");
        category = categoryRepository.save(category);

        // 3. Create product
        Product product = new Product();
        product.setName("TX Product " + suffix);
        product.setDescription("Test");
        product.setPrice(BigDecimal.valueOf(1000));
        product.setStock(10);
        product.setCategory(category);
        product = productRepository.save(product);

        Long userId = user.getId();
        Long productId = product.getId();

        // 4. Create transaction
        TransactionTemplate template =
                new TransactionTemplate(transactionManager);

        // 5. Write data, then throw an exception
        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> template.execute(status -> {

                    User managedUser = userRepository
                            .findById(userId)
                            .orElseThrow();

                    Product managedProduct = productRepository
                            .findById(productId)
                            .orElseThrow();

                    Order order = new Order();
                    order.setUser(managedUser);
                    order.setTotalPrice(BigDecimal.valueOf(2000));
                    order.setStatus(OrderStatus.PENDING);

                    order = orderRepository.saveAndFlush(order);

                    OrderItem orderItem = new OrderItem();
                    orderItem.setOrder(order);
                    orderItem.setProduct(managedProduct);
                    orderItem.setQuantity(2);
                    orderItem.setPrice(BigDecimal.valueOf(1000));

                    orderItemRepository.saveAndFlush(orderItem);

                    // Update stock inside transaction
                    managedProduct.setStock(8);
                    productRepository.flush();

                    // Simulate unexpected failure
                    throw new RuntimeException(
                            "Simulated checkout failure"
                    );
                })
        );

        assertEquals(
                "Simulated checkout failure",
                exception.getMessage()
        );

        // 6. Verify order was rolled back
        assertTrue(
                orderRepository.findByUserId(userId).isEmpty()
        );

        // 7. Verify stock was rolled back
        Product updatedProduct = productRepository
                .findById(productId)
                .orElseThrow();

        assertEquals(10, updatedProduct.getStock());
    }
}
