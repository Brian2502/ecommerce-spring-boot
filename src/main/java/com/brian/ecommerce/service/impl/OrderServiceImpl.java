package com.brian.ecommerce.service.impl;

import com.brian.ecommerce.entity.Cart;
import com.brian.ecommerce.entity.User;
import com.brian.ecommerce.repository.CartRepository;
import com.brian.ecommerce.repository.UserRepository;
import com.brian.ecommerce.service.OrderService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.brian.ecommerce.entity.CartItem;
import com.brian.ecommerce.repository.CartItemRepository;
import com.brian.ecommerce.entity.Product;
import java.math.BigDecimal;
import java.util.List;
import com.brian.ecommerce.entity.Order;
import com.brian.ecommerce.repository.OrderRepository;
import com.brian.ecommerce.repository.OrderItemRepository;
import com.brian.ecommerce.entity.OrderItem;
import com.brian.ecommerce.dto.OrderResponse;
import com.brian.ecommerce.dto.OrderItemResponse;
import com.brian.ecommerce.dto.OrderDetailResponse;
import com.brian.ecommerce.enums.OrderStatus;
import com.brian.ecommerce.exception.InvalidOrderStatusException;
import com.brian.ecommerce.repository.ProductRepository;
import java.util.HashMap;
import java.util.Map;
import com.brian.ecommerce.exception.OrderNotFoundException;
import com.brian.ecommerce.exception.OrderAccessDeniedException;
import com.brian.ecommerce.entity.ProductVariant;
import com.brian.ecommerce.repository.ProductVariantRepository;

import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import java.util.Set;
import java.util.HashSet;

@Service
public class OrderServiceImpl implements OrderService {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final CacheManager cacheManager;

    public OrderServiceImpl(
            UserRepository userRepository,
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            ProductRepository productRepository,
            ProductVariantRepository variantRepository,
            CacheManager cacheManager
    ) {
        this.userRepository = userRepository;
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
        this.variantRepository = variantRepository;
        this.cacheManager = cacheManager;
    }


    @Override
    @Transactional
    public void checkout(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Cart cart = cartRepository.findByUserIdForUpdate(user.getId())
                .orElseThrow(() ->
                        new RuntimeException("Cart not found"));

        List<CartItem> cartItems = cartItemRepository.findByCart(cart);

        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        // Gom số lượng theo từng sản phẩm thường hoặc biến thể.
        Map<Long, Integer> productQuantities = new HashMap<>();
        Map<Long, Integer> variantQuantities = new HashMap<>();

        for (CartItem item : cartItems) {

            int quantity = item.getQuantity();

            if (quantity <= 0) {
                throw new RuntimeException("Invalid quantity");
            }

            if (item.getVariant() != null) {
                Long variantId = item.getVariant().getId();

                variantQuantities.merge(
                        variantId,
                        quantity,
                        Math::addExact
                );
            } else {
                Long productId = item.getProduct().getId();

                productQuantities.merge(
                        productId,
                        quantity,
                        Math::addExact
                );
            }
        }

        Map<Long, Product> lockedProducts = new HashMap<>();
        Map<Long, ProductVariant> lockedVariants = new HashMap<>();

        // Khóa Product theo ID tăng dần.
        List<Long> productIds = productQuantities.keySet()
                .stream()
                .sorted()
                .toList();

        for (Long productId : productIds) {

            Product product = productRepository
                    .findByIdForUpdate(productId)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Product not found: " + productId
                            ));

            if (!variantRepository
                    .findByProductIdOrderByIdAsc(productId)
                    .isEmpty()) {
                throw new RuntimeException(
                        "Please select a product variant"
                );
            }

            int quantity = productQuantities.get(productId);

            if (product.getStock() < quantity) {
                throw new RuntimeException(
                        "Not enough stock: " + product.getName()
                );
            }

            lockedProducts.put(productId, product);
        }

        // Khóa ProductVariant theo ID tăng dần.
        List<Long> variantIds = variantQuantities.keySet()
                .stream()
                .sorted()
                .toList();

        for (Long variantId : variantIds) {

            ProductVariant variant = variantRepository
                    .findByIdForUpdate(variantId)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Variant not found: " + variantId
                            ));

            int quantity = variantQuantities.get(variantId);

            if (variant.getStock() < quantity) {
                throw new RuntimeException(
                        "Not enough stock for SKU: " + variant.getSku()
                );
            }

            lockedVariants.put(variantId, variant);
        }

        // Tính tổng tiền bằng giá hiện tại của sản phẩm/biến thể.
        BigDecimal totalPrice = BigDecimal.ZERO;

        for (CartItem item : cartItems) {

            BigDecimal price;

            if (item.getVariant() != null) {

                Long variantId = item.getVariant().getId();
                ProductVariant variant = lockedVariants.get(variantId);

                if (!variant.getProduct().getId()
                        .equals(item.getProduct().getId())) {
                    throw new RuntimeException(
                            "Variant does not belong to product"
                    );
                }

                price = variant.getPrice();

            } else {

                Product product = lockedProducts.get(
                        item.getProduct().getId()
                );

                price = product.getPrice();
            }

            totalPrice = totalPrice.add(
                    price.multiply(
                            BigDecimal.valueOf(item.getQuantity())
                    )
            );
        }

        // Tạo Order.
        Order order = new Order();
        order.setUser(user);
        order.setTotalPrice(totalPrice);
        order.setStatus(OrderStatus.PENDING);

        Order savedOrder = orderRepository.save(order);

        // Lưu từng OrderItem với giá tại thời điểm mua.
        for (CartItem item : cartItems) {

            Product product = item.getProduct();

            ProductVariant variant = item.getVariant() == null
                    ? null
                    : lockedVariants.get(item.getVariant().getId());

            BigDecimal price = variant != null
                    ? variant.getPrice()
                    : lockedProducts.get(product.getId()).getPrice();

            OrderItem orderItem = new OrderItem();

            orderItem.setOrder(savedOrder);
            orderItem.setProduct(product);
            orderItem.setVariant(variant);
            orderItem.setQuantity(item.getQuantity());
            orderItem.setPrice(price);

            orderItemRepository.save(orderItem);
        }

        // Trừ tồn kho sau khi đã kiểm tra đủ số lượng.
        for (Long productId : productIds) {

            Product product = lockedProducts.get(productId);

            product.setStock(
                    product.getStock() - productQuantities.get(productId)
            );
        }

        for (Long variantId : variantIds) {

            ProductVariant variant = lockedVariants.get(variantId);

            variant.setStock(
                    variant.getStock() - variantQuantities.get(variantId)
            );
        }

        // Collect affected product IDs
        Set<Long> affectedProductIds = new HashSet<>();

        for (CartItem item : cartItems) {
            affectedProductIds.add(item.getProduct().getId());
        }

        // Xóa các sản phẩm đã checkout khỏi giỏ hàng.
        cartItemRepository.deleteAll(cartItems);

        // Invalidate product caches after successful commit
        evictProductCachesAfterCommit(affectedProductIds);
    }


    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getMyOrders(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found with email: " + email
                        ));

        List<Order> orders =
                orderRepository.findByUserId(user.getId());

        return orders.stream()
                .map(order -> new OrderResponse(
                        order.getId(),
                        order.getTotalPrice(),
                        order.getStatus(),
                        order.getCreatedAt(),
                        order.getUpdatedAt()
                ))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public OrderDetailResponse getOrderById(Long orderId, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found with email: " + email
                        ));


        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new OrderNotFoundException(
                                "Order not found with id: " + orderId
                        ));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new OrderAccessDeniedException(
                    "You cannot access this order"
            );
        }


        List<OrderItem> orderItems =
                orderItemRepository.findByOrderId(orderId);


        List<OrderItemResponse> itemResponses =
                orderItems.stream()
                        .map(item -> {
                            ProductVariant variant = item.getVariant();

                            return new OrderItemResponse(
                                    item.getProduct().getId(),
                                    variant != null ? variant.getId() : null,
                                    item.getProduct().getName(),
                                    variant != null ? variant.getColor() : null,
                                    variant != null ? variant.getStorage() : null,
                                    item.getQuantity(),
                                    item.getPrice()
                            );
                        })
                        .toList();


        return new OrderDetailResponse(
                order.getId(),
                order.getTotalPrice(),
                order.getStatus(),
                order.getCreatedAt(),
                order.getUpdatedAt(),
                itemResponses
        );
    }


    @Override
    @Transactional
    public void updateOrderStatus(Long orderId, OrderStatus status) {

        Order order = orderRepository.findByIdForUpdate(orderId)
                .orElseThrow(() ->
                        new OrderNotFoundException(
                                "Order not found with id: " + orderId
                        ));

        OrderStatus currentStatus = order.getStatus();

        boolean validTransition =
                (currentStatus == OrderStatus.PENDING
                        && status == OrderStatus.CONFIRMED)
                        || (currentStatus == OrderStatus.CONFIRMED
                        && status == OrderStatus.SHIPPED)
                        || (currentStatus == OrderStatus.SHIPPED
                        && status == OrderStatus.DELIVERED);

        if (!validTransition) {
            throw new InvalidOrderStatusException(
                    "Cannot change order status from "
                            + currentStatus
                            + " to "
                            + status
            );
        }

        order.setStatus(status);
    }



    @Override
    @Transactional
    public void cancelOrder(Long orderId, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Order order = orderRepository.findByIdForUpdate(orderId)
                .orElseThrow(() ->
                        new OrderNotFoundException(
                                "Order not found: " + orderId
                        ));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new OrderAccessDeniedException(
                    "You cannot cancel this order"
            );
        }

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new InvalidOrderStatusException(
                    "Only PENDING orders can be cancelled"
            );
        }

        List<OrderItem> orderItems =
                orderItemRepository.findByOrderId(orderId);

        Map<Long, Integer> productQuantities = new HashMap<>();
        Map<Long, Integer> variantQuantities = new HashMap<>();

        for (OrderItem item : orderItems) {

            if (item.getVariant() != null) {
                variantQuantities.merge(
                        item.getVariant().getId(),
                        item.getQuantity(),
                        Math::addExact
                );
            } else {
                productQuantities.merge(
                        item.getProduct().getId(),
                        item.getQuantity(),
                        Math::addExact
                );
            }
        }

        // Khóa và hoàn tồn kho sản phẩm thường.
        for (Long productId : productQuantities.keySet()
                .stream().sorted().toList()) {

            Product product = productRepository
                    .findByIdForUpdate(productId)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Product not found: " + productId
                            ));

            product.setStock(
                    Math.addExact(
                            product.getStock(),
                            productQuantities.get(productId)
                    )
            );
        }

        // Khóa và hoàn tồn kho từng biến thể.
        for (Long variantId : variantQuantities.keySet()
                .stream().sorted().toList()) {

            ProductVariant variant = variantRepository
                    .findByIdForUpdate(variantId)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Variant not found: " + variantId
                            ));

            variant.setStock(
                    Math.addExact(
                            variant.getStock(),
                            variantQuantities.get(variantId)
                    )
            );
        }

        order.setStatus(OrderStatus.CANCELLED);

        // Collect affected product IDs
        Set<Long> affectedProductIds = new HashSet<>();

        for (OrderItem item : orderItems) {
            affectedProductIds.add(item.getProduct().getId());
        }

        // Invalidate product caches after successful commit
        evictProductCachesAfterCommit(affectedProductIds);
    }

    private void evictProductCachesAfterCommit(Set<Long> productIds) {

        if (productIds.isEmpty()) {
            return;
        }

        Set<Long> ids = Set.copyOf(productIds);

        TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {

                    @Override
                    public void afterCommit() {

                        Cache cache = cacheManager.getCache("products");

                        if (cache != null) {
                            for (Long productId : ids) {
                                cache.evict(productId);
                            }
                        }
                    }
                }
        );
    }

}