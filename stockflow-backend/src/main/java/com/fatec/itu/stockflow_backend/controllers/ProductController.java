package com.fatec.itu.stockflow_backend.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.fatec.itu.stockflow_backend.dtos.ProductResponse;

import com.fatec.itu.stockflow_backend.services.ProductService;

@RestController 
@CrossOrigin 
@RequestMapping ("/products")
public class ProductController {

    @Autowired  
    private ProductService service;


    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAll() {
        return ResponseEntity.ok(service.findAll()); // Devolve uma LISTA de produto
    }             
    
}
