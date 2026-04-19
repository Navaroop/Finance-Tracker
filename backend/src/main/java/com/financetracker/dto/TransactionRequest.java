package com.financetracker.dto;

import com.financetracker.model.Transaction.TransactionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class TransactionRequest {

    @NotBlank
    private String title;

    @NotNull
    @Positive
    private BigDecimal amount;

    @NotNull
    private TransactionType type;

    @NotBlank
    private String category;

    @NotNull
    private LocalDate date;

    private String description;

    private Boolean isRecurring;

    private String frequency;
}
