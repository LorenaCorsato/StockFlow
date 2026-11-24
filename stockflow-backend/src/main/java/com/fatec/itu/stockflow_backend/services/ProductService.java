package com.fatec.itu.stockflow_backend.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fatec.itu.stockflow_backend.dtos.ProductResponse;
import com.fatec.itu.stockflow_backend.mappers.ProductMapper;
import com.fatec.itu.stockflow_backend.repositories.ProductRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class ProductService {
    @Autowired
    private ProductRepository repository;

    public List<ProductResponse> findAll() {
        return repository.findAll()
                .stream()
                .map(ProductMapper::toDTO)
                .toList();
    }

    public ProductResponse findById(Long id) {
        return repository.findById(id)
                .map(ProductMapper::toDTO)
                .orElseThrow(() -> new EntityNotFoundException());
    }

}