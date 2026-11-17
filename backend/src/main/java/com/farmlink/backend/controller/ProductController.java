

package com.farmlink.backend.controller;

import com.farmlink.backend.model.Product;
import com.farmlink.backend.repository.ProductRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.DeleteMapping;
import jakarta.servlet.http.HttpSession;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(
    origins = {
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5177",
        "http://127.0.0.1:5174"
    },
    allowCredentials = "true"
)
public class ProductController {

    private final ProductRepository productRepository;

    public ProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    // Get all products
    @GetMapping
    public List<Product> getAllProducts() {
        return productRepository.findAll(Sort.by("id"));
    }

    // Add a new product
    
@PostMapping
public Product addProduct(
        @RequestBody Product product,
        HttpSession session) {

    String farmerName = requireFarmerName(session);

    Product newProduct = new Product(
        null,
        product.getName(),
        product.getCategory(),
        product.getPrice(),
        farmerName,
        product.getDistrict(),
        product.getImage()
    );

    validateProduct(newProduct);

    return productRepository.save(newProduct);
}


@PutMapping("/{id}")
public Product updateProduct(
        @PathVariable Integer id,
        @RequestBody Product updatedProduct,
        HttpSession session) {

    String farmerName = requireFarmerName(session);

    productRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Product not found"
            ));

    validateProduct(updatedProduct);

    Product product = new Product(
            id,
            updatedProduct.getName(),
            updatedProduct.getCategory(),
            updatedProduct.getPrice(),
            farmerName,
            updatedProduct.getDistrict(),
            updatedProduct.getImage()
    );

    validateProduct(product);

    return productRepository.save(product);
}

@DeleteMapping("/{id}")
public void deleteProduct(
        @PathVariable Integer id,
        HttpSession session) {

    if (session.getAttribute("userId") == null) {
        throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Please login first."
        );
    }

    if (!"farmer".equals(session.getAttribute("userRole"))) {
        throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "Only farmers can delete products."
        );
    }

    if (!productRepository.existsById(id)) {
        throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Product not found"
        );
    }

    productRepository.deleteById(id);
}

private String requireFarmerName(HttpSession session) {
    if (session.getAttribute("userId") == null) {
        throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Please login first."
        );
    }

    if (!"farmer".equals(session.getAttribute("userRole"))) {
        throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "Only farmers can manage products."
        );
    }

    Object userName = session.getAttribute("userName");
    if (!(userName instanceof String farmerName) || farmerName.isBlank()) {
        throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Please log in again."
        );
    }

    return farmerName;
}

private void validateProduct(Product product) {
    if (product.getName() == null || product.getName().isBlank()
            || product.getCategory() == null || product.getCategory().isBlank()
            || product.getPrice() <= 0
            || product.getFarmer() == null || product.getFarmer().isBlank()
            || product.getDistrict() == null || product.getDistrict().isBlank()
            || product.getImage() == null || product.getImage().isBlank()) {
        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Please provide valid product details."
        );
    }
}

}
