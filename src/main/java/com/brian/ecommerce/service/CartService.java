package com.brian.ecommerce.service;

import com.brian.ecommerce.dto.CartItemRequest;
import com.brian.ecommerce.dto.CartResponse;
import com.brian.ecommerce.dto.CartItemUpdateRequest;

public interface CartService {

    void addToCart(String email, CartItemRequest request);

    CartResponse getCart(String email);

    void updateCartItem(
            String email,
            Long productId,
            CartItemUpdateRequest request
    );

    void removeFromCart(String email, Long productId);

}