package com.fatec.itu.stockflow_backend.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.fatec.itu.stockflow_backend.dtos.ProductRequest;
import com.fatec.itu.stockflow_backend.dtos.ProductResponse;
import com.fatec.itu.stockflow_backend.entities.Product;
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

    public ProductResponse save(ProductRequest request) {
        Product product = repository.save(ProductMapper.toEntity(request));
        return ProductMapper.toDTO(product);
    }

    
    public void deleteById(long id) {
      if(repository.existsById(id))
            repository.deleteById(id);
        else
           throw new EntityNotFoundException("Produto não cadastrado");
    }

    public void update(ProductRequest request, Long id) {
        Product product = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Produto não cadastrado"));

        product.setName(request.name());
        product.setDescription(request.description());
        product.setCategory(request.category());
        product.setQuantity(request.quantity());
        product.setMinStock(request.minStock());
        repository.save(product);
    }
}
