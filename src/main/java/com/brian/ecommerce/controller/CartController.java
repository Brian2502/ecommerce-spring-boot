package com.brian.ecommerce.controller;

import com.brian.ecommerce.dto.CartItemRequest;
import com.brian.ecommerce.service.CartService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.brian.ecommerce.dto.CartResponse;
import org.springframework.web.bind.annotation.GetMapping;
import com.brian.ecommerce.dto.CartItemUpdateRequest;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @PostMapping("/items")
    public ResponseEntity<Void> addToCart(
            @Valid @RequestBody CartItemRequest request) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        cartService.addToCart(email, request);

        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<CartResponse> getCart() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        CartResponse response = cartService.getCart(email);

        return ResponseEntity.ok(response);
    }


    @PutMapping("/items/{cartItemId}")
    public ResponseEntity<Void> updateCartItem(
            @PathVariable("cartItemId") Long cartItemId,
            @Valid @RequestBody CartItemUpdateRequest request
    ) {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        cartService.updateCartItem(
                email,
                cartItemId,
                request
        );

        return ResponseEntity.ok().build();
    }



    @DeleteMapping("/items/{cartItemId}")
    public ResponseEntity<Void> removeFromCart(
            @PathVariable("cartItemId") Long cartItemId
    ) {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        cartService.removeFromCart(email, cartItemId);

        return ResponseEntity.noContent().build();
    }

}