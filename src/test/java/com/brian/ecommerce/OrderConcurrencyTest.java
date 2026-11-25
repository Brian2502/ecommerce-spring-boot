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

import org.springframework.test.context.ActiveProfiles;

import com.brian.ecommerce.entity.ProductVariant;
import com.brian.ecommerce.repository.ProductVariantRepository;
import java.util.UUID;
import java.util.concurrent.Callable;

@SpringBootTest
@ActiveProfiles("test")
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

    @Autowired
    private ProductVariantRepository variantRepository;

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


    @Test
    void shouldPreventDuplicateCheckoutForSameUser()
            throws Exception {

        String suffix = java.util.UUID.randomUUID().toString();

        // 1. Category
        Category category = new Category();
        category.setName("Same User Test " + suffix);
        category.setDescription("Test");
        category = categoryRepository.save(category);

        // 2. Product stock = 10
        Product product = new Product();
        product.setName("Same User Product " + suffix);
        product.setDescription("Test");
        product.setPrice(BigDecimal.valueOf(1000));
        product.setStock(10);
        product.setCategory(category);
        product = productRepository.save(product);

        Long productId = product.getId();

        // 3. User
        User user = new User();
        user.setName("Same User");
        user.setEmail("same-user-" + suffix + "@gmail.com");
        user.setPassword("password");
        user.setRole("USER");
        user = userRepository.save(user);

        String email = user.getEmail();
        Long userId = user.getId();

        // 4. Cart
        Cart cart = new Cart();
        cart.setUser(user);
        cart = cartRepository.save(cart);

        // 5. CartItem: quantity = 2
        CartItem item = new CartItem();
        item.setCart(cart);
        item.setProduct(product);
        item.setQuantity(2);
        cartItemRepository.save(item);

        // 6. Hai request Checkout đồng thời
        ExecutorService executor = Executors.newFixedThreadPool(2);
        CountDownLatch startLatch = new CountDownLatch(1);

        try {
            java.util.concurrent.Callable<Boolean> checkoutTask = () -> {
                startLatch.await();

                try {
                    orderService.checkout(email);
                    return true;
                } catch (RuntimeException ex) {
                    return false;
                }
            };

            Future<Boolean> resultA = executor.submit(checkoutTask);
            Future<Boolean> resultB = executor.submit(checkoutTask);

            startLatch.countDown();

            boolean successA = resultA.get(15, TimeUnit.SECONDS);
            boolean successB = resultB.get(15, TimeUnit.SECONDS);

            // Chỉ một Checkout thành công
            assertTrue(
                    successA ^ successB,
                    "Exactly one checkout should succeed"
            );

            // Chỉ tạo một Order
            assertEquals(
                    1,
                    orderRepository.findByUserId(userId).size()
            );

            // Stock: 10 - 2 = 8
            assertEquals(
                    8,
                    productRepository.findById(productId)
                            .orElseThrow()
                            .getStock()
            );

            // Cart đã trống
            assertTrue(
                    cartItemRepository.findByCart(cart).isEmpty()
            );

        } finally {
            executor.shutdownNow();
        }
    }


    @Test
    void shouldPreventVariantOversellingWhenTwoUsersCheckoutAtSameTime()
            throws Exception {

        String suffix = UUID.randomUUID().toString();

        // 1. Create category
        Category category = new Category();
        category.setName("Variant Concurrency " + suffix);
        category.setDescription("Test");
        category = categoryRepository.save(category);

        // 2. Create base product
        Product product = new Product();
        product.setName("iPhone " + suffix);
        product.setDescription("Variant concurrency test");
        product.setPrice(BigDecimal.valueOf(20000000));
        product.setStock(100);
        product.setCategory(category);
        product = productRepository.save(product);

        Long productId = product.getId();

        // 3. Create variant: stock = 5
        ProductVariant variant = new ProductVariant();
        variant.setProduct(product);
        variant.setSku("CONC-" + suffix);
        variant.setColor("Black");
        variant.setStorage("128GB");
        variant.setPrice(BigDecimal.valueOf(22000000));
        variant.setStock(5);
        variant = variantRepository.save(variant);

        Long variantId = variant.getId();

        // 4. Create user A
        User userA = new User();
        userA.setName("Variant User A");
        userA.setEmail("variant-a-" + suffix + "@gmail.com");
        userA.setPassword("password");
        userA.setRole("USER");
        userA = userRepository.save(userA);

        String emailA = userA.getEmail();
        Long userAId = userA.getId();

        // 5. Create user B
        User userB = new User();
        userB.setName("Variant User B");
        userB.setEmail("variant-b-" + suffix + "@gmail.com");
        userB.setPassword("password");
        userB.setRole("USER");
        userB = userRepository.save(userB);

        String emailB = userB.getEmail();
        Long userBId = userB.getId();

        // 6. Create cart A
        Cart cartA = new Cart();
        cartA.setUser(userA);
        cartA = cartRepository.save(cartA);

        // 7. Create cart B
        Cart cartB = new Cart();
        cartB.setUser(userB);
        cartB = cartRepository.save(cartB);

        // 8. User A wants 4 units
        CartItem itemA = new CartItem();
        itemA.setCart(cartA);
        itemA.setProduct(product);
        itemA.setVariant(variant);
        itemA.setQuantity(4);
        cartItemRepository.save(itemA);

        // 9. User B wants 4 units
        CartItem itemB = new CartItem();
        itemB.setCart(cartB);
        itemB.setProduct(product);
        itemB.setVariant(variant);
        itemB.setQuantity(4);
        cartItemRepository.save(itemB);

        // 10. Prepare concurrent checkout
        ExecutorService executor =
                Executors.newFixedThreadPool(2);

        CountDownLatch readyLatch =
                new CountDownLatch(2);

        CountDownLatch startLatch =
                new CountDownLatch(1);

        try {
            Callable<Boolean> checkoutA = () -> {
                readyLatch.countDown();
                startLatch.await();

                try {
                    orderService.checkout(emailA);
                    return true;

                } catch (RuntimeException ex) {
                    if (ex.getMessage() != null
                            && ex.getMessage().contains("Not enough stock")) {
                        return false;
                    }

                    throw ex;
                }
            };

            Callable<Boolean> checkoutB = () -> {
                readyLatch.countDown();
                startLatch.await();

                try {
                    orderService.checkout(emailB);
                    return true;

                } catch (RuntimeException ex) {
                    if (ex.getMessage() != null
                            && ex.getMessage().contains("Not enough stock")) {
                        return false;
                    }

                    throw ex;
                }
            };

            Future<Boolean> resultA =
                    executor.submit(checkoutA);

            Future<Boolean> resultB =
                    executor.submit(checkoutB);

            // 11. Wait until both threads are ready
            assertTrue(
                    readyLatch.await(5, TimeUnit.SECONDS),
                    "Both checkout tasks must be ready"
            );

            // 12. Start both requests
            startLatch.countDown();

            boolean successA =
                    resultA.get(15, TimeUnit.SECONDS);

            boolean successB =
                    resultB.get(15, TimeUnit.SECONDS);

            // 13. Exactly one checkout succeeds
            assertTrue(
                    successA ^ successB,
                    "Exactly one checkout should succeed"
            );

            // 14. Variant stock: 5 - 4 = 1
            assertEquals(
                    1,
                    variantRepository.findById(variantId)
                            .orElseThrow()
                            .getStock(),
                    "Variant stock must be exactly 1"
            );

            // 15. Base product stock remains unchanged
            assertEquals(
                    100,
                    productRepository.findById(productId)
                            .orElseThrow()
                            .getStock()
            );

            // 16. Verify order count for each user
            assertEquals(
                    successA ? 1 : 0,
                    orderRepository.findByUserId(userAId).size()
            );

            assertEquals(
                    successB ? 1 : 0,
                    orderRepository.findByUserId(userBId).size()
            );

            // 17. Identify successful and failed carts
            Cart successfulCart = successA ? cartA : cartB;
            Cart failedCart = successA ? cartB : cartA;

            // 18. Successful cart must be empty
            assertTrue(
                    cartItemRepository.findByCart(successfulCart)
                            .isEmpty()
            );

            // 19. Failed cart must remain unchanged
            var remainingItems =
                    cartItemRepository.findByCart(failedCart);

            assertEquals(1, remainingItems.size());

            CartItem remainingItem = remainingItems.get(0);

            assertEquals(4, remainingItem.getQuantity());

            assertEquals(
                    variantId,
                    remainingItem.getVariant().getId()
            );

        } finally {
            startLatch.countDown();
            executor.shutdownNow();
        }
    }


}