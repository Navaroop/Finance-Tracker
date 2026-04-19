package com.financetracker.dto;

import com.financetracker.model.Transaction;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class DashboardSummary {
    private BigDecimal totalIncome;
    private BigDecimal totalExpenses;
    private BigDecimal balance;
    private Map<String, BigDecimal> expenseByCategory;
    private List<Transaction> recentTransactions;
    private List<InsightItem> insights;
}
