package com.brian.ecommerce.service.impl;

import com.brian.ecommerce.dto.CartItemRequest;
import com.brian.ecommerce.repository.CartItemRepository;
import com.brian.ecommerce.repository.CartRepository;
import com.brian.ecommerce.repository.ProductRepository;
import com.brian.ecommerce.repository.UserRepository;
import com.brian.ecommerce.service.CartService;
import org.springframework.stereotype.Service;
import com.brian.ecommerce.entity.Cart;
import com.brian.ecommerce.entity.Product;
import com.brian.ecommerce.entity.User;
import com.brian.ecommerce.exception.ProductNotFoundException;
import com.brian.ecommerce.entity.CartItem;
import java.util.Optional;
import com.brian.ecommerce.dto.CartResponse;
import com.brian.ecommerce.dto.CartItemResponse;
import com.brian.ecommerce.dto.CartItemUpdateRequest;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.transaction.annotation.Transactional;
@Service
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartServiceImpl(
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            ProductRepository productRepository,
            UserRepository userRepository) {

        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public void addToCart(String email, CartItemRequest request) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found with email: " + email
                        ));

        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseGet(() -> {

                    Cart newCart = new Cart();
                    newCart.setUser(user);

                    return cartRepository.save(newCart);
                });

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() ->
                        new ProductNotFoundException(
                                "Product not found with id: " + request.getProductId()
                        ));

        if (request.getQuantity() > product.getStock()) {
            throw new RuntimeException(
                    "Not enough stock for product: " + product.getName()
            );
        }

        Optional<CartItem> existingCartItem =
                cartItemRepository.findByCartAndProduct(cart, product);

        if (existingCartItem.isPresent()) {

            CartItem cartItem = existingCartItem.get();

            int newQuantity =
                    cartItem.getQuantity() + request.getQuantity();

            if (newQuantity > product.getStock()) {
                throw new RuntimeException(
                        "Not enough stock for product: " + product.getName()
                );
            }

            cartItem.setQuantity(newQuantity);

            cartItemRepository.save(cartItem);

        } else {

            CartItem cartItem = new CartItem();

            cartItem.setCart(cart);
            cartItem.setProduct(product);
            cartItem.setQuantity(request.getQuantity());

            cartItemRepository.save(cartItem);
        }
    }
    @Override
    @Transactional(readOnly = true)
    public CartResponse getCart(String email) {

        // 1. Tìm người dùng
        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found with email: " + email
                        ));

        // 2. Tìm giỏ hàng
        Optional<Cart> cartOptional =
                cartRepository.findByUserId(user.getId());

        // 3. Nếu chưa có giỏ hàng, trả về giỏ hàng rỗng
        if (cartOptional.isEmpty()) {
            return new CartResponse(
                    null,
                    List.of(),
                    BigDecimal.ZERO
            );
        }

        Cart cart = cartOptional.get();

        // 4. Lấy danh sách sản phẩm
        List<CartItem> cartItems =
                cartItemRepository.findByCart(cart);

        List<CartItemResponse> items = cartItems.stream()
                .map(item -> {

                    Product product = item.getProduct();

                    BigDecimal subtotal = product.getPrice()
                            .multiply(
                                    BigDecimal.valueOf(item.getQuantity())
                            );

                    return new CartItemResponse(
                            product.getId(),
                            product.getName(),
                            product.getPrice(),
                            item.getQuantity(),
                            subtotal
                    );
                })
                .toList();

        // 5. Tính tổng tiền
        BigDecimal totalPrice = items.stream()
                .map(CartItemResponse::subtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 6. Trả về giỏ hàng
        return new CartResponse(
                cart.getId(),
                items,
                totalPrice
        );
    }

    @Override
    @Transactional
    public void updateCartItem(
            String email,
            Long productId,
            CartItemUpdateRequest request) {

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

        CartItem cartItem = cartItemRepository
                .findByCartAndProductId(cart, productId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Product not found in cart"
                        ));

        Product product = cartItem.getProduct();

        if (request.quantity() > product.getStock()) {
            throw new RuntimeException(
                    "Quantity exceeds available stock"
            );
        }

        cartItem.setQuantity(request.quantity());

        cartItemRepository.save(cartItem);
    }

    @Override
    @Transactional
    public void removeFromCart(String email, Long productId) {

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

        CartItem cartItem = cartItemRepository
                .findByCartAndProductId(cart, productId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Product not found in cart"
                        ));

        cartItemRepository.delete(cartItem);
    }

}