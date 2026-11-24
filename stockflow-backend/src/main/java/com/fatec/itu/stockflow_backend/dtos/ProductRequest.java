package com.fatec.itu.stockflow_backend.dtos;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ProductRequest(

    @NotBlank(message = "Name is required")
    String name,

    String description,

    @NotBlank(message = "Category is required")
    String category,

    @NotNull(message = "Quantity is required")
    @Min(value = 0, message = "Quantity must be greater than or equal to 0")
    Integer quantity,

    @NotNull(message = "Minimum stock is required")
    @Min(value = 0, message = "Minimum stock must be greater than or equal to 0")
    Integer minStock

) {}
