package com.farmlink.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String name;
    private String category;
    private double price;
    private String farmer;
    private String district;
    private String image;

    protected Product() {
    }

    public Product(Integer id, String name, String category, double price,
                   String farmer, String district, String image) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.price = price;
        this.farmer = farmer;
        this.district = district;
        this.image = image;
    }

    public Integer getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getCategory() {
        return category;
    }

    public double getPrice() {
        return price;
    }

    public String getFarmer() {
        return farmer;
    }

    public String getDistrict() {
        return district;
    }

    public String getImage() {
        return image;
    }
}
