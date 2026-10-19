package com.brian.ecommerce;

import com.brian.ecommerce.entity.Cart;
import com.brian.ecommerce.entity.CartItem;
import com.brian.ecommerce.entity.Category;
import com.brian.ecommerce.entity.Product;
import com.brian.ecommerce.entity.User;
import com.brian.ecommerce.repository.CartItemRepository;
import com.brian.ecommerce.repository.CartRepository;
import com.brian.ecommerce.repository.CategoryRepository;
import com.brian.ecommerce.repository.OrderRepository;
import com.brian.ecommerce.repository.ProductRepository;
import com.brian.ecommerce.repository.UserRepository;
import com.brian.ecommerce.service.OrderService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class OrderConcurrencyTest {

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Test
    void shouldPreventOversellingWhenTwoUsersCheckoutAtSameTime()
            throws Exception {

        // 1. Category

        Category category = new Category();
        category.setName(
                "Concurrency Test Category "
                        + System.currentTimeMillis()
        );
        category.setDescription("Test");

        category = categoryRepository.save(category);


        // 2. Product stock = 1

        Product product = new Product();
        product.setName(
                "Concurrency Test Product "
                        + System.currentTimeMillis()
        );
        product.setDescription("Test");
        product.setPrice(BigDecimal.valueOf(1000));
        product.setStock(1);
        product.setCategory(category);

        product = productRepository.save(product);

        final Long productId = product.getId();


        // 3. User A

        User userA = new User();
        userA.setName("User A");
        userA.setEmail(
                "concurrency-a-"
                        + System.currentTimeMillis()
                        + "@gmail.com"
        );
        userA.setPassword("password");
        userA.setRole("USER");

        userA = userRepository.save(userA);

        final String emailA = userA.getEmail();
        final Long userAId = userA.getId();


        // 4. User B

        User userB = new User();
        userB.setName("User B");
        userB.setEmail(
                "concurrency-b-"
                        + System.currentTimeMillis()
                        + "@gmail.com"
        );
        userB.setPassword("password");
        userB.setRole("USER");

        userB = userRepository.save(userB);

        final String emailB = userB.getEmail();
        final Long userBId = userB.getId();


        // 5. Cart A

        Cart cartA = new Cart();
        cartA.setUser(userA);

        cartA = cartRepository.save(cartA);


        // 6. Cart B

        Cart cartB = new Cart();
        cartB.setUser(userB);

        cartB = cartRepository.save(cartB);


        // 7. CartItem A

        CartItem cartItemA = new CartItem();
        cartItemA.setCart(cartA);
        cartItemA.setProduct(product);
        cartItemA.setQuantity(1);

        cartItemRepository.save(cartItemA);


        // 8. CartItem B

        CartItem cartItemB = new CartItem();
        cartItemB.setCart(cartB);
        cartItemB.setProduct(product);
        cartItemB.setQuantity(1);

        cartItemRepository.save(cartItemB);


        // 9. Chuẩn bị chạy đồng thời

        ExecutorService executor =
                Executors.newFixedThreadPool(2);

        CountDownLatch startLatch =
                new CountDownLatch(1);


        // 10. Checkout A

        Future<Boolean> resultA =
                executor.submit(() -> {

                    startLatch.await();

                    try {
                        orderService.checkout(emailA);
                        return true;
                    } catch (Exception e) {
                        return false;
                    }
                });


        // 11. Checkout B

        Future<Boolean> resultB =
                executor.submit(() -> {

                    startLatch.await();

                    try {
                        orderService.checkout(emailB);
                        return true;
                    } catch (Exception e) {
                        return false;
                    }
                });


        // 12. Cho cả hai bắt đầu

        startLatch.countDown();


        // 13. Lấy kết quả

        boolean successA =
                resultA.get(10, TimeUnit.SECONDS);

        boolean successB =
                resultB.get(10, TimeUnit.SECONDS);


        executor.shutdown();


        // 14. Chỉ một checkout được thành công

        assertTrue(
                successA ^ successB,
                "Exactly one checkout should succeed"
        );


        // 15. Stock phải bằng 0

        Product updatedProduct =
                productRepository
                        .findById(productId)
                        .orElseThrow();

        assertEquals(
                0,
                updatedProduct.getStock()
        );


        // 16. Chỉ một Order được tạo

        long orderCount =
                orderRepository
                        .findByUserId(userAId)
                        .size()
                        +
                        orderRepository
                                .findByUserId(userBId)
                                .size();

        assertEquals(
                1,
                orderCount
        );
    }
}