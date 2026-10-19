package com.brian.ecommerce.controller;

import com.brian.ecommerce.dto.UserRequest;
import com.brian.ecommerce.dto.UserResponse;
import com.brian.ecommerce.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping
    public UserResponse createUser(
            @Valid @RequestBody UserRequest request) {

        return userService.createUser(request);
    }
}