package com.fatec.itu.stockflow_backend.mappers;

import com.fatec.itu.stockflow_backend.dtos.ProductRequest;
import com.fatec.itu.stockflow_backend.dtos.ProductResponse;
import com.fatec.itu.stockflow_backend.entities.Product;

public class ProductMapper {

    public static Product toEntity(ProductRequest request) {
        Product product = new Product();
        product.setName(request.name());
        product.setDescription(request.description());
        product.setCategory(request.category());
        product.setQuantity(request.quantity());
        product.setMinStock(request.minStock());

        return product;
    }

    public static ProductResponse toDTO(Product product) {
        return new ProductResponse(
            product.getId(),
            product.getName(),
            product.getDescription(),
            product.getCategory(),
            product.getQuantity(),
            product.getMinStock()
        );
    }
}
