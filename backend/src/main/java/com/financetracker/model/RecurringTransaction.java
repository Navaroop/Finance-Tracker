package com.financetracker.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "recurring_transactions")
public class RecurringTransaction {

    @Id
    private String id;

    @Indexed
    private String userId;

    private String title;

    private BigDecimal amount;

    private Transaction.TransactionType type;

    private String category;

    private String description;

    private String frequency; // e.g. "MONTHLY"

    private LocalDate nextRunDate;

    private Boolean active = true;

    private LocalDateTime createdAt = LocalDateTime.now();
}
