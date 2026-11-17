
package com.farmlink.backend;

import com.farmlink.backend.model.Product;
import com.farmlink.backend.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class ProductDataInitializer {

    @Bean
    CommandLineRunner loadProducts(ProductRepository repository) {
        return args -> {

            // Insert sample products only when the database is empty
            if (repository.count() == 0) {

                List<Product> products = List.of(

                    new Product(null, "Fresh Tomatoes", "Vegetables", 250,
                        "Sunil Fernando", "Kandy",
                        "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=700&q=85"),

                    new Product(null, "Fresh Carrots", "Vegetables", 180,
                        "Nimal Perera", "Matale",
                        "https://images.unsplash.com/photo-1445282768818-728615cc910a?auto=format&fit=crop&w=700&q=85"),

                    new Product(null, "Green Beans", "Vegetables", 200,
                        "Priyantha Silva", "Kurunegala",
                        "https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?auto=format&fit=crop&w=700&q=85"),

                    new Product(null, "Sweet Bananas", "Fruits", 150,
                        "Ruwan Jayasinghe", "Badulla",
                        "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=700&q=85"),

                    new Product(null, "Fresh Leafy Greens", "Leafy Greens", 120,
                        "Kamal Perera", "Gampaha",
                        "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=700&q=85"),

                    new Product(null, "Fresh Coconuts", "Coconut", 100,
                        "Chandima Silva", "Kurunegala",
                        "http://localhost:8080/images/sri-lankan-coconut.png"),

                    new Product(null, "Rice", "Grains", 220,
                        "Saman Kumara", "Anuradhapura",
                        "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=700&q=85"),

                    new Product(null, "Fresh Chillies", "Spices", 300,
                        "Kasun Bandara", "Matale",
                        "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=700&q=85"),

                    new Product(null, "Fresh Cow Milk", "Dairy", 450,
                        "Local Dairy Farmer", "Kandy",
                        "https://ip.index.hr/remote/bucket.index.hr/b/index/a4d4d923-3674-45f8-8305-94b673ef8885.png"),

                    new Product(null, "Natural Set Yoghurt", "Dairy", 180,
                        "Local Dairy Farmer", "Matale",
                        "https://storage.pathaofood.live/food/d40c8f69-b056-4b6c-88c9-8be20a05b8ce.webp"),

                    new Product(null, "Buffalo Curd with Kithul Treacle", "Dairy", 350,
                        "Local Dairy Farmer", "Hambantota",
                        "https://upload.wikimedia.org/wikipedia/commons/4/4f/Curd_and_treacle.jpg"),

                    new Product(null, "Traditional Farm Butter", "Dairy", 650,
                        "Local Dairy Farmer", "Nuwara Eliya",
                        "https://www.trulydesi.in/cdn/shop/articles/Why_Truly_Desi_Makkhan..3_01a9d0d6-1fad-4723-8110-fe6dfad6c2f4.jpg?v=1768214490")
                );

                repository.saveAll(products);

                System.out.println("12 FarmLink products inserted into the database!");
            }
        };
    }
}
