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

import com.brian.ecommerce.entity.ProductVariant;
import com.brian.ecommerce.repository.ProductVariantRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ProductVariantRepository variantRepository;


    public CartServiceImpl(
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            ProductRepository productRepository,
            UserRepository userRepository,
            ProductVariantRepository variantRepository
    ) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.variantRepository = variantRepository;
    }


    @Override
    @Transactional
    public void addToCart(String email, CartItemRequest request) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"
                ));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ProductNotFoundException(
                        "Product not found with id: " + request.getProductId()
                ));

        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    return cartRepository.save(newCart);
                });

        ProductVariant variant = null;
        int availableStock;

        if (request.getVariantId() != null) {
            variant = variantRepository.findById(request.getVariantId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Variant not found"
                    ));

            if (!variant.getProduct().getId().equals(product.getId())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Variant does not belong to product"
                );
            }

            availableStock = variant.getStock();

        } else {
            if (!variantRepository.findByProductIdOrderByIdAsc(
                    product.getId()).isEmpty()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Please select a product variant"
                );
            }

            availableStock = product.getStock();
        }

        Optional<CartItem> existingCartItem;

        if (variant != null) {
            existingCartItem =
                    cartItemRepository.findByCartAndVariant(cart, variant);
        } else {
            existingCartItem =
                    cartItemRepository.findByCartAndProductAndVariantIsNull(
                            cart, product
                    );
        }

        int existingQuantity = existingCartItem
                .map(CartItem::getQuantity)
                .orElse(0);

        if (request.getQuantity() == null || request.getQuantity() <= 0
                || (long) existingQuantity + request.getQuantity() > availableStock) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid quantity or insufficient stock"
            );
        }

        CartItem cartItem = existingCartItem.orElseGet(CartItem::new);

        cartItem.setCart(cart);
        cartItem.setProduct(product);
        cartItem.setVariant(variant);
        cartItem.setQuantity(existingQuantity + request.getQuantity());

        cartItemRepository.save(cartItem);
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
                    ProductVariant variant = item.getVariant();

                    BigDecimal price = variant != null
                            ? variant.getPrice()
                            : product.getPrice();

                    BigDecimal subtotal = price.multiply(
                            BigDecimal.valueOf(item.getQuantity())
                    );

                    return new CartItemResponse(
                            item.getId(),
                            product.getId(),
                            variant != null ? variant.getId() : null,
                            product.getName(),
                            variant != null ? variant.getColor() : null,
                            variant != null ? variant.getStorage() : null,
                            price,
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
            Long cartItemId,
            CartItemUpdateRequest request
    ) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"
                ));

        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Cart not found"
                ));

        CartItem cartItem = cartItemRepository
                .findByIdAndCart(cartItemId, cart)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Cart item not found"
                ));

        int availableStock = cartItem.getVariant() != null
                ? cartItem.getVariant().getStock()
                : cartItem.getProduct().getStock();

        if (request.quantity() == null || request.quantity() <= 0
                || request.quantity() > availableStock) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid quantity or insufficient stock"
            );
        }

        cartItem.setQuantity(request.quantity());
        cartItemRepository.save(cartItem);
    }



    @Override
    @Transactional
    public void removeFromCart(String email, Long cartItemId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"
                ));

        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Cart not found"
                ));

        CartItem cartItem = cartItemRepository
                .findByIdAndCart(cartItemId, cart)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Cart item not found"
                ));

        cartItemRepository.delete(cartItem);
    }


}