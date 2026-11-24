package com.fatec.itu.stockflow_backend.controllers;

import java.net.URI;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.fatec.itu.stockflow_backend.dtos.ProductRequest;
import com.fatec.itu.stockflow_backend.dtos.ProductResponse;
import com.fatec.itu.stockflow_backend.dtos.StockMovementRequest;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.fatec.itu.stockflow_backend.services.ProductService;

import jakarta.validation.Valid;

@RestController 
@CrossOrigin 
@RequestMapping({"/api/produtos", "/api/products", "/products"})
public class ProductController {

    @Autowired  
    private ProductService service;


    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAll() {
        return ResponseEntity.ok(service.findAll()); 
    }            
    
    @GetMapping("{id}")
    public ResponseEntity<ProductResponse> getById(@PathVariable long id){ 
        return ResponseEntity.ok(service.findById(id));
    }

     @PostMapping
    public ResponseEntity<ProductResponse> save(@Valid @RequestBody ProductRequest product)
    {
        ProductResponse p = service.save(product);
       
        URI location = ServletUriComponentsBuilder
                       .fromCurrentRequest()
                       .path("/{id}")
                       .buildAndExpand(p.id())
                       .toUri();
        return ResponseEntity.created(location).body(p);


    }

     @DeleteMapping("{id}")
    public ResponseEntity<Void> deleteById(@PathVariable long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }

     @PutMapping("{id}")
    public ResponseEntity<ProductResponse> update(@PathVariable long id,
                                       @Valid @RequestBody ProductRequest product)
    {
            return ResponseEntity.ok(service.update(product, id));
    }

    @PatchMapping("/{id}/movement")
    public ResponseEntity<ProductResponse> moveStock(@PathVariable Long id,
            @Valid @RequestBody StockMovementRequest request) {
        return ResponseEntity.ok(service.moveStock(id, request));
    }
    
}
