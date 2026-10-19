package com.brian.ecommerce.dto;

import com.brian.ecommerce.enums.OrderStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderStatusRequest {

    private OrderStatus status;
}