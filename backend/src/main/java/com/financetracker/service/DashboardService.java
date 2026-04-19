package com.financetracker.service;

import com.financetracker.dto.DashboardSummary;
import com.financetracker.dto.InsightItem;
import com.financetracker.model.Budget;
import com.financetracker.model.Transaction;
import com.financetracker.model.Transaction.TransactionType;
import com.financetracker.repository.BudgetRepository;
import com.financetracker.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;

    public DashboardSummary getSummary(String userId) {
        LocalDate now = LocalDate.now();
        LocalDate startOfPeriod = now.minusDays(30);
        LocalDate endOfPeriod = now;

        List<Transaction> monthlyTx = transactionRepository
                .findByUserIdAndDateBetweenOrderByDateDesc(userId, startOfPeriod, endOfPeriod);

        BigDecimal totalIncome = monthlyTx.stream()
                .filter(t -> t.getType() == TransactionType.INCOME)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpenses = monthlyTx.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, BigDecimal> expenseByCategory = new LinkedHashMap<>();
        monthlyTx.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .forEach(t -> expenseByCategory.merge(t.getCategory(), t.getAmount(), BigDecimal::add));

        List<Transaction> recentTransactions = transactionRepository
                .findTop5ByUserIdOrderByDateDesc(userId);

        List<InsightItem> insights = new java.util.ArrayList<>();

        // Insight 1: Highest Expense
        if (!expenseByCategory.isEmpty()) {
            Map.Entry<String, BigDecimal> maxCat = expenseByCategory.entrySet().stream()
                    .max(Map.Entry.comparingByValue())
                    .orElse(null);
            if (maxCat != null) {
                insights.add(new InsightItem("Your highest expense was on " + maxCat.getKey(), "NEUTRAL"));
            }
        }

        // Insight 2: Month over month comparison (simplified to previous 30 days vs current month for quick insight)
        // Let's get last month's transactions
        LocalDate startOfLastPeriod = now.minusDays(60);
        LocalDate endOfLastPeriod = now.minusDays(31);
        BigDecimal lastMonthExpenses = transactionRepository
                .findByUserIdAndDateBetweenAndTypeOrderByDateDesc(userId, startOfLastPeriod, endOfLastPeriod, TransactionType.EXPENSE)
                .stream()
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (lastMonthExpenses.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal diff = totalExpenses.subtract(lastMonthExpenses);
            if (diff.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal pct = diff.multiply(new BigDecimal("100")).divide(lastMonthExpenses, 0, java.math.RoundingMode.HALF_UP);
                insights.add(new InsightItem("You spent " + pct + "% more this month compared to last month", "NEGATIVE"));
            } else if (diff.compareTo(BigDecimal.ZERO) < 0) {
                BigDecimal pct = diff.abs().multiply(new BigDecimal("100")).divide(lastMonthExpenses, 0, java.math.RoundingMode.HALF_UP);
                insights.add(new InsightItem("Great! You spent " + pct + "% less this month than last month", "POSITIVE"));
            }
        }

        // Insight 3: Budget check
        List<Budget> budgets = budgetRepository.findByUserIdAndMonthAndYear(userId, now.getMonthValue(), now.getYear());
        if (!budgets.isEmpty() && !expenseByCategory.isEmpty()) {
            boolean overBudget = false;
            for (Budget b : budgets) {
                BigDecimal spent = expenseByCategory.getOrDefault(b.getCategory(), BigDecimal.ZERO);
                if (spent.compareTo(b.getLimitAmount()) > 0) {
                    overBudget = true;
                    insights.add(new InsightItem("You exceeded your budget for " + b.getCategory(), "WARNING"));
                }
            }
            if (!overBudget) {
                insights.add(new InsightItem("You are within budget 👍", "POSITIVE"));
            }
        }

        if (insights.isEmpty()) {
             insights.add(new InsightItem("Keep tracking to see smart insights here!", "NEUTRAL"));
        }

        return DashboardSummary.builder()
                .totalIncome(totalIncome)
                .totalExpenses(totalExpenses)
                .balance(totalIncome.subtract(totalExpenses))
                .expenseByCategory(expenseByCategory)
                .recentTransactions(recentTransactions)
                .insights(insights)
                .build();
    }
}
