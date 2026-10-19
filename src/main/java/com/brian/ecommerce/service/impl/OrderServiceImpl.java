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

@Service
public class OrderServiceImpl implements OrderService {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;

    public OrderServiceImpl(
            UserRepository userRepository,
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            ProductRepository productRepository
    ) {
        this.userRepository = userRepository;
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
    }

    @Override
    @Transactional
    public void checkout(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found with email: " + email
                        ));

        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Cart not found for user: " + user.getId()
                        ));

        List<CartItem> cartItems =
                cartItemRepository.findByCart(cart);

        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        BigDecimal totalPrice = BigDecimal.ZERO;

        Map<Long, Product> lockedProducts = new HashMap<>();

        // 1. Lock Product + kiểm tra stock + tính tổng tiền
        for (CartItem cartItem : cartItems) {

            Long productId =
                    cartItem.getProduct().getId();

            Product product =
                    productRepository.findByIdForUpdate(productId)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Product not found with id: "
                                                    + productId
                                    ));

            if (cartItem.getQuantity() > product.getStock()) {
                throw new RuntimeException(
                        "Not enough stock for product: "
                                + product.getName()
                );
            }

            lockedProducts.put(productId, product);

            BigDecimal itemTotal =
                    product.getPrice()
                            .multiply(
                                    BigDecimal.valueOf(
                                            cartItem.getQuantity()
                                    )
                            );

            totalPrice = totalPrice.add(itemTotal);
        }

        // 2. Tạo Order
        Order order = new Order();

        order.setUser(user);
        order.setTotalPrice(totalPrice);
        order.setStatus(OrderStatus.PENDING);

        Order savedOrder =
                orderRepository.save(order);

        // 3. Tạo OrderItem + trừ stock
        for (CartItem cartItem : cartItems) {

            Long productId =
                    cartItem.getProduct().getId();

            Product product =
                    lockedProducts.get(productId);

            OrderItem orderItem =
                    new OrderItem();

            orderItem.setOrder(savedOrder);
            orderItem.setProduct(product);
            orderItem.setQuantity(
                    cartItem.getQuantity()
            );
            orderItem.setPrice(
                    product.getPrice()
            );

            orderItemRepository.save(orderItem);

            product.setStock(
                    product.getStock()
                            - cartItem.getQuantity()
            );
        }

        // 4. Xóa CartItem
        for (CartItem cartItem : cartItems) {
            cartItemRepository.delete(cartItem);
        }
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
                        .map(item -> new OrderItemResponse(
                                item.getProduct().getId(),
                                item.getProduct().getName(),
                                item.getQuantity(),
                                item.getPrice()
                        ))
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

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Order not found with id: " + orderId
                        ));

        OrderStatus currentStatus = order.getStatus();

        boolean validTransition =
                (currentStatus == OrderStatus.PENDING
                        && (status == OrderStatus.CONFIRMED
                        || status == OrderStatus.CANCELLED))

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
                        new RuntimeException(
                                "User not found with email: " + email
                        ));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new OrderNotFoundException(
                                "Order not found with id: " + orderId
                        ));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new RuntimeException(
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

        for (OrderItem orderItem : orderItems) {

            Product product = orderItem.getProduct();

            product.setStock(
                    product.getStock() + orderItem.getQuantity()
            );
        }

        order.setStatus(OrderStatus.CANCELLED);
    }
}