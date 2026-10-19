package com.brian.ecommerce.repository;

import com.brian.ecommerce.entity.Cart;
import com.brian.ecommerce.entity.CartItem;
import com.brian.ecommerce.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    Optional<CartItem> findByCartAndProduct(Cart cart, Product product);

    List<CartItem> findByCart(Cart cart);

    Optional<CartItem> findByCartAndProductId(
            Cart cart,
            Long productId
    );


}