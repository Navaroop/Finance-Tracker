package com.financetracker.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "budgets")
public class Budget {

    @Id
    private String id;

    private String userId;

    private String category;

    private BigDecimal limitAmount;

    private int month;  // 1–12

    private int year;

    private LocalDateTime createdAt = LocalDateTime.now();
}
