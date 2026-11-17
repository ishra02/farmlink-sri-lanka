package com.farmlink.backend.demo;

import com.farmlink.backend.model.Product;
import com.farmlink.backend.model.Order;
import com.farmlink.backend.model.OrderItem;
import com.farmlink.backend.repository.OrderItemRepository;
import com.farmlink.backend.repository.OrderRepository;
import com.farmlink.backend.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
		"spring.datasource.url=jdbc:h2:mem:farmlinktest;DB_CLOSE_DELAY=-1",
		"spring.datasource.driver-class-name=org.h2.Driver",
		"spring.datasource.username=sa",
		"spring.datasource.password="
})
@AutoConfigureMockMvc
class DemoApplicationTests {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ProductRepository productRepository;

	@Autowired
	private OrderRepository orderRepository;

	@Autowired
	private OrderItemRepository orderItemRepository;

	@Test
	void contextLoads() {
	}

	@Test
	void getProductsReturnsProductList() throws Exception {
		mockMvc.perform(get("/api/products"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()").value(12))
				.andExpect(jsonPath("$[5].image")
						.value("http://localhost:8080/images/sri-lankan-coconut.png"));
	}

	@Test
	void getProductsAllowsLoopbackFrontendOrigin() throws Exception {
		mockMvc.perform(get("/api/products")
						.header(HttpHeaders.ORIGIN, "http://127.0.0.1:5174"))
				.andExpect(status().isOk())
				.andExpect(header().string(
						HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN,
						"http://127.0.0.1:5174"));
	}

	@Test
	void loginPreflightAllowsFrontendOrigin() throws Exception {
		mockMvc.perform(options("/api/auth/login")
						.header(HttpHeaders.ORIGIN, "http://localhost:5174")
						.header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "POST")
						.header(HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS, "content-type"))
				.andExpect(status().isOk())
				.andExpect(header().string(
						HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN,
						"http://localhost:5174"))
				.andExpect(header().string(
						HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true"));
	}

	@Test
	void postProductCreatesProduct() throws Exception {
		MockHttpSession farmerSession = new MockHttpSession();
		farmerSession.setAttribute("userId", 1);
		farmerSession.setAttribute("userRole", "farmer");
		farmerSession.setAttribute("userName", "Registered Farmer");

		mockMvc.perform(post("/api/products")
						.session(farmerSession)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "name": "Test Product",
								  "category": "Vegetables",
								  "price": 100,
								  "farmer": "Test Farmer",
								  "district": "Kandy",
								  "image": "https://example.com/test.jpg"
								}
								"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id").isNumber())
				.andExpect(jsonPath("$.name").value("Test Product"))
				.andExpect(jsonPath("$.farmer").value("Registered Farmer"))
				.andExpect(jsonPath("$.category").value("Vegetables"))
				.andExpect(jsonPath("$.price").value(100));
	}

	@Test
	void customerRegistrationAllowsFrontendOrigin() throws Exception {
		mockMvc.perform(post("/api/auth/register")
						.header(HttpHeaders.ORIGIN, "http://localhost:5174")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "fullName": "Test Customer",
								  "email": "customer-test@example.test",
								  "password": "secure-test-password",
								  "role": "customer"
								}
								"""))
				.andExpect(status().isOk())
				.andExpect(header().string(
						HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN,
						"http://localhost:5174"))
				.andExpect(jsonPath("$.fullName").value("Test Customer"))
				.andExpect(jsonPath("$.role").value("customer"));
	}

	@Test
	void customerCanViewPreviousOrdersWithItems() throws Exception {
		Order order = new Order();
		order.setCustomerId(42);
		order.setCustomerName("Test Customer");
		order.setCustomerEmail("customer@example.test");
		order.setTotalAmount(200);
		Order savedOrder = orderRepository.save(order);

		OrderItem item = new OrderItem();
		item.setOrder(savedOrder);
		item.setProductId(1);
		item.setProductName("Test Coconut");
		item.setQuantity(2);
		item.setPrice(100);
		orderItemRepository.save(item);

		MockHttpSession customerSession = new MockHttpSession();
		customerSession.setAttribute("userId", 42);
		customerSession.setAttribute("userRole", "customer");

		mockMvc.perform(get("/api/orders/my-orders")
						.session(customerSession))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].id").value(savedOrder.getId()))
				.andExpect(jsonPath("$[0].items[0].productName")
						.value("Test Coconut"))
				.andExpect(jsonPath("$[0].items[0].quantity").value(2));
	}

	@Test
	void farmerCanUpdateStatusForTheirOrder() throws Exception {
		Product product = productRepository.saveAndFlush(new Product(
				null, "Farmer Order Product", "Vegetables", 100,
				"Registered Farmer", "Kandy", "product.jpg"));

		Order order = new Order();
		order.setCustomerId(99);
		order.setCustomerName("Test Customer");
		order.setCustomerEmail("customer@example.test");
		order.setTotalAmount(100);
		Order savedOrder = orderRepository.save(order);

		OrderItem item = new OrderItem();
		item.setOrder(savedOrder);
		item.setProductId(product.getId());
		item.setProductName(product.getName());
		item.setQuantity(1);
		item.setPrice(product.getPrice());
		orderItemRepository.save(item);

		MockHttpSession farmerSession = new MockHttpSession();
		farmerSession.setAttribute("userId", 7);
		farmerSession.setAttribute("userRole", "farmer");
		farmerSession.setAttribute("userName", "Registered Farmer");

		mockMvc.perform(put("/api/orders/" + savedOrder.getId() + "/status")
						.session(farmerSession)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"status":"Confirmed"}
								"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.status").value("Confirmed"));

		assertEquals("Confirmed",
				orderRepository.findById(savedOrder.getId()).orElseThrow().getStatus());
	}

	@Test
	void putProductUpdatesProduct() throws Exception {
		Integer productId = productRepository.findAll().get(0).getId();
		MockHttpSession farmerSession = new MockHttpSession();
		farmerSession.setAttribute("userId", 1);
		farmerSession.setAttribute("userRole", "farmer");
		farmerSession.setAttribute("userName", "Registered Farmer");

		mockMvc.perform(put("/api/products/" + productId)
						.session(farmerSession)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "name": "Updated Product",
								  "category": "Vegetables",
								  "price": 125,
								  "farmer": "Updated Farmer",
								  "district": "Kandy",
								  "image": "/uploads/product.jpg"
								}
								"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id").value(productId))
				.andExpect(jsonPath("$.name").value("Updated Product"))
				.andExpect(jsonPath("$.farmer").value("Registered Farmer"))
				.andExpect(jsonPath("$.price").value(125))
				.andExpect(jsonPath("$.image").value("/uploads/product.jpg"));
	}

	@Test
	void customerCannotDeleteProduct() throws Exception {
		Integer productId = productRepository.findAll().get(0).getId();
		MockHttpSession customerSession = new MockHttpSession();
		customerSession.setAttribute("userId", 2);
		customerSession.setAttribute("userRole", "customer");

		mockMvc.perform(delete("/api/products/" + productId)
						.session(customerSession))
				.andExpect(status().isForbidden());

		org.junit.jupiter.api.Assertions.assertTrue(
				productRepository.existsById(productId));
	}

	@Test
	void farmerCanDeleteProduct() throws Exception {
		Integer productId = productRepository.findAll().get(0).getId();
		MockHttpSession farmerSession = new MockHttpSession();
		farmerSession.setAttribute("userId", 1);
		farmerSession.setAttribute("userRole", "farmer");

		mockMvc.perform(delete("/api/products/" + productId)
						.session(farmerSession))
				.andExpect(status().isOk());

		org.junit.jupiter.api.Assertions.assertFalse(
				productRepository.existsById(productId));
	}

	@Test
	void coconutImageIsServedAsPng() throws Exception {
		mockMvc.perform(get("/images/sri-lankan-coconut.png"))
				.andExpect(status().isOk())
				.andExpect(content().contentTypeCompatibleWith(MediaType.IMAGE_PNG));
	}

	@Test
	void uploadedImagesAreServedFromUploadDirectory() throws Exception {
		Path uploadDirectory = Paths.get("uploads").toAbsolutePath().normalize();
		String fileName = UUID.randomUUID() + ".png";
		byte[] imageBytes = { 1, 2, 3 };
		Path imagePath = uploadDirectory.resolve(fileName);
		Files.createDirectories(uploadDirectory);
		Files.write(imagePath, imageBytes);

		try {
			mockMvc.perform(get("/uploads/" + fileName))
					.andExpect(status().isOk())
					.andExpect(content().bytes(imageBytes));
		} finally {
			Files.deleteIfExists(imagePath);
		}
	}

	@Test
	@Transactional
	void productRepositoryPersistsProducts() {
		Product product = new Product(null, "Test Coconut", "Coconut", 100,
				"Test Farmer", "Galle", "test-image.png");

		Product savedProduct = productRepository.saveAndFlush(product);

		assertEquals("Test Coconut",
				productRepository.findById(savedProduct.getId()).orElseThrow().getName());
	}

}
