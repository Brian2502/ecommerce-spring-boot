package com.brian.ecommerce.dto.admin;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DailyRevenueResponse(
        LocalDate date,
        BigDecimal revenue
) {
}