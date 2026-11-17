package com.farmlink.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

public record OrderHistoryResponse(
        Integer id,
        String customerName,
        String customerEmail,
        double totalAmount,
        String status,
        LocalDateTime orderDate,
        List<Item> items) {

    public record Item(
            Integer id,
            Integer productId,
            String productName,
            Integer quantity,
            double price) {
    }
}
