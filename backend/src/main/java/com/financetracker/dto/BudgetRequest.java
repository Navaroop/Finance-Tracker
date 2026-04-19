package com.financetracker.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class BudgetRequest {

    @NotBlank
    private String category;

    @NotNull
    @Positive
    private BigDecimal limitAmount;

    @Min(1) @Max(12)
    private int month;

    @Min(2000)
    private int year;
}
