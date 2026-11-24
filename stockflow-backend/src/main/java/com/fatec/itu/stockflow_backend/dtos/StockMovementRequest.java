package com.fatec.itu.stockflow_backend.dtos;

import com.fatec.itu.stockflow_backend.entities.MovementType;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record StockMovementRequest(
    @NotNull(message = "Tipo é obrigatório: ENTRADA ou SAIDA")
    MovementType tipo,

    @NotNull(message = "Quantidade é obrigatória")
    @Positive(message = "Quantidade deve ser um inteiro maior que zero")
    Integer quantidade
) {}
