
package com.farmlink.backend.controller;

import com.farmlink.backend.dto.OrderHistoryResponse;
import com.farmlink.backend.model.Order;
import com.farmlink.backend.model.OrderItem;
import com.farmlink.backend.model.Product;
import com.farmlink.backend.repository.OrderRepository;
import com.farmlink.backend.repository.OrderItemRepository;
import com.farmlink.backend.repository.ProductRepository;

import jakarta.servlet.http.HttpSession;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(
    origins = {
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5177",
        "http://127.0.0.1:5174"
    },
    allowCredentials = "true"
)
public class OrderController {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;

    public OrderController(
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            ProductRepository productRepository) {

        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
    }

    // PLACE CUSTOMER ORDER
    @PostMapping
    @Transactional
    public ResponseEntity<?> placeOrder(
            @RequestBody Map<String, Object> request,
            HttpSession session) {

        Integer customerId = (Integer) session.getAttribute("userId");
        String role = (String) session.getAttribute("userRole");

        if (customerId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Please log in to place an order.");
        }

        if (!"customer".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Only customers can place orders.");
        }

        try {
            List<Map<String, Object>> items =
                    (List<Map<String, Object>>) request.get("items");

            if (items == null || items.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body("Your cart is empty.");
            }

            Order order = new Order();
            order.setCustomerId(customerId);
            order.setCustomerName((String) request.get("customerName"));
            order.setCustomerEmail((String) request.get("customerEmail"));

            double total = 0;
            List<OrderItem> orderItems = new ArrayList<>();

            for (Map<String, Object> item : items) {

                Integer productId =
                        Integer.valueOf(item.get("productId").toString());

                Integer quantity =
                        Integer.valueOf(item.get("quantity").toString());

                if (quantity <= 0) {
                    return ResponseEntity.badRequest()
                            .body("Invalid product quantity.");
                }

                Product product = productRepository.findById(productId)
                        .orElse(null);

                if (product == null) {
                    return ResponseEntity.badRequest()
                            .body("A product in your cart no longer exists.");
                }

                OrderItem orderItem = new OrderItem();
                orderItem.setOrder(order);
                orderItem.setProductId(product.getId());
                orderItem.setProductName(product.getName());
                orderItem.setQuantity(quantity);
                orderItem.setPrice(product.getPrice());

                total += product.getPrice() * quantity;
                orderItems.add(orderItem);
            }

            order.setTotalAmount(total);

            Order savedOrder = orderRepository.save(order);

            for (OrderItem item : orderItems) {
                item.setOrder(savedOrder);
            }

            orderItemRepository.saveAll(orderItems);

            return ResponseEntity.ok(savedOrder);

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body("Unable to place order. Please check your details.");
        }
    }

    // CUSTOMER ORDER HISTORY
    @GetMapping("/my-orders")
    public ResponseEntity<?> getMyOrders(HttpSession session) {

        Integer customerId = (Integer) session.getAttribute("userId");
        String role = (String) session.getAttribute("userRole");

        if (customerId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Please log in.");
        }

        if (!"customer".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Only customers can view their orders.");
        }

        List<OrderHistoryResponse> orders = orderRepository
                .findByCustomerId(customerId)
                .stream()
                .map(order -> new OrderHistoryResponse(
                        order.getId(),
                        order.getCustomerName(),
                        order.getCustomerEmail(),
                        order.getTotalAmount(),
                        order.getStatus(),
                        order.getOrderDate(),
                        orderItemRepository.findByOrderId(order.getId())
                                .stream()
                                .map(item -> new OrderHistoryResponse.Item(
                                        item.getId(),
                                        item.getProductId(),
                                        item.getProductName(),
                                        item.getQuantity(),
                                        item.getPrice()))
                                .toList()))
                .toList();

        return ResponseEntity.ok(orders);
    }

    // FARMER ORDER HISTORY
    @GetMapping("/farmer-orders")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getFarmerOrders(HttpSession session) {

        Integer farmerId = (Integer) session.getAttribute("userId");
        String role = (String) session.getAttribute("userRole");

        if (farmerId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Please log in.");
        }

        if (!"farmer".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Only farmers can view farmer orders.");
        }

        String farmerName = (String) session.getAttribute("userName");

        if (farmerName == null || farmerName.isBlank()) {
            return ResponseEntity.badRequest()
                    .body("Farmer profile information is unavailable.");
        }

        Set<Integer> farmerProductIds = productRepository.findAll()
                .stream()
                .filter(product ->
                        farmerName.equalsIgnoreCase(product.getFarmer()))
                .map(Product::getId)
                .collect(Collectors.toSet());

        List<Map<String, Object>> farmerOrders = new ArrayList<>();

        for (Order order : orderRepository.findAll()) {

            List<Map<String, Object>> matchingItems =
                    orderItemRepository.findByOrderId(order.getId())
                            .stream()
                            .filter(item ->
                                    farmerProductIds.contains(item.getProductId()))
                            .map(item -> {
                                Map<String, Object> itemData =
                                        new java.util.HashMap<>();

                                itemData.put("id", item.getId());
                                itemData.put("productId", item.getProductId());
                                itemData.put("productName", item.getProductName());
                                itemData.put("quantity", item.getQuantity());
                                itemData.put("price", item.getPrice());
                                itemData.put(
                                        "subtotal",
                                        item.getPrice() * item.getQuantity()
                                );

                                return itemData;
                            })
                            .toList();

            if (!matchingItems.isEmpty()) {

                Map<String, Object> orderData =
                        new java.util.HashMap<>();

                orderData.put("id", order.getId());
                orderData.put("customerName", order.getCustomerName());
                orderData.put("customerEmail", order.getCustomerEmail());
                orderData.put("orderDate", order.getOrderDate());
                orderData.put("status", order.getStatus());
                orderData.put("items", matchingItems);

                double farmerTotal = matchingItems.stream()
                        .mapToDouble(item ->
                                ((Number) item.get("subtotal")).doubleValue())
                        .sum();

                orderData.put("totalAmount", farmerTotal);
                farmerOrders.add(orderData);
            }
        }

        return ResponseEntity.ok(farmerOrders);
    }

    // UPDATE ORDER STATUS - FARMER ONLY
    @PutMapping("/{orderId}/status")
    @Transactional
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Integer orderId,
            @RequestBody Map<String, String> request,
            HttpSession session) {

        Integer farmerId = (Integer) session.getAttribute("userId");
        String role = (String) session.getAttribute("userRole");

        if (farmerId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Please log in.");
        }

        if (!"farmer".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Only farmers can update order status.");
        }

        String farmerName = (String) session.getAttribute("userName");

        if (farmerName == null || farmerName.isBlank()) {
            return ResponseEntity.badRequest()
                    .body("Farmer profile information is unavailable.");
        }

        Order order = orderRepository.findById(orderId).orElse(null);

        if (order == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Order not found.");
        }

        // Check whether this order contains the farmer's products.
        Set<Integer> farmerProductIds = productRepository.findAll()
                .stream()
                .filter(product ->
                        farmerName.equalsIgnoreCase(product.getFarmer()))
                .map(Product::getId)
                .collect(Collectors.toSet());

        boolean ownsProductInOrder =
                orderItemRepository.findByOrderId(orderId)
                        .stream()
                        .anyMatch(item ->
                                farmerProductIds.contains(item.getProductId()));

        if (!ownsProductInOrder) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You cannot update this order.");
        }

        String newStatus = request.get("status");

        List<String> allowedStatuses = List.of(
                "Pending",
                "Confirmed",
                "Preparing",
                "Shipped",
                "Delivered"
        );

        if (newStatus == null || !allowedStatuses.contains(newStatus)) {
            return ResponseEntity.badRequest()
                    .body("Invalid order status.");
        }

        order.setStatus(newStatus);
        orderRepository.save(order);

        return ResponseEntity.ok(
                Map.of(
                        "message", "Order status updated successfully.",
                        "status", order.getStatus()
                )
        );
    }
}
