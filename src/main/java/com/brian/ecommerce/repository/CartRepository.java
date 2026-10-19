package com.brian.ecommerce.repository;

import com.brian.ecommerce.entity.Cart;
import com.brian.ecommerce.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {

    Optional<Cart> findByUser(User user);

    Optional<Cart> findByUserId(Long userId);
}