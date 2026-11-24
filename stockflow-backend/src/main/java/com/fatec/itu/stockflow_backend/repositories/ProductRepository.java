package com.fatec.itu.stockflow_backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.fatec.itu.stockflow_backend.entities.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {
    
}

