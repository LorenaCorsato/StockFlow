package com.fatec.itu.stockflow_backend.dtos;

public record ProductResponse(

    Long id,
    String name,
    String description,
    String category,
    Integer quantity,
    Integer minStock,
    boolean lowStock

) {}
