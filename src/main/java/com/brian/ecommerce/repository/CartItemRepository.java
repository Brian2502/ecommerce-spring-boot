package com.brian.ecommerce.repository;

import com.brian.ecommerce.entity.Cart;
import com.brian.ecommerce.entity.CartItem;
import com.brian.ecommerce.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import com.brian.ecommerce.entity.ProductVariant;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    Optional<CartItem> findByCartAndProduct(Cart cart, Product product);

    List<CartItem> findByCart(Cart cart);

    Optional<CartItem> findByCartAndProductId(
            Cart cart,
            Long productId
    );

    Optional<CartItem> findByCartAndVariant(
            Cart cart,
            ProductVariant variant
    );

    Optional<CartItem> findByCartAndProductAndVariantIsNull(
            Cart cart,
            Product product
    );

    Optional<CartItem> findByIdAndCart(Long id, Cart cart);

    boolean existsByVariantId(Long variantId);

    boolean existsByProductId(Long productId);
}