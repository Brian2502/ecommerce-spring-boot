package com.brian.ecommerce.service;

import com.brian.ecommerce.dto.UserRequest;
import com.brian.ecommerce.dto.UserResponse;

public interface UserService {

    UserResponse createUser(UserRequest request);
}