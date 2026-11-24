package com.fatec.itu.stockflow_backend.mappers;

import com.fatec.itu.stockflow_backend.dtos.ProductRequest;
import com.fatec.itu.stockflow_backend.dtos.ProductResponse;
import com.fatec.itu.stockflow_backend.entities.Product;

public class ProductMapper {

    public static Product toEntity(ProductRequest request) {
        Product p = new Product();
        p.setName(request.name());
        p.setDescription(request.description());
        p.setCategory(request.category());
        p.setQuantity(request.quantity());
        p.setMinStock(request.minStock());

        return p;
    }

    public static ProductResponse toDTO(Product product) {
        return new ProductResponse(
            product.getId(),
            product.getName(),
            product.getDescription(),
            product.getCategory(),
            product.getQuantity(),
            product.getMinStock(),
            product.getQuantity() <= product.getMinStock()
        );
    }
}
