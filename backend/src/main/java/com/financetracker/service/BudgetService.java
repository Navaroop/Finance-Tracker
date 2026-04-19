package com.financetracker.service;

import com.financetracker.dto.BudgetRequest;
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
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository;

    public Budget createOrUpdate(String userId, BudgetRequest request) {
        Budget budget = budgetRepository
                .findByUserIdAndCategoryAndMonthAndYear(
                        userId, request.getCategory(), request.getMonth(), request.getYear())
                .orElse(new Budget());

        budget.setUserId(userId);
        budget.setCategory(request.getCategory());
        budget.setLimitAmount(request.getLimitAmount());
        budget.setMonth(request.getMonth());
        budget.setYear(request.getYear());
        return budgetRepository.save(budget);
    }

    /**
     * Returns budgets with their spent amounts for a given month/year.
     */
    public List<Map<String, Object>> getBudgetsWithSpending(String userId, int month, int year) {
        List<Budget> budgets = budgetRepository.findByUserIdAndMonthAndYear(userId, month, year);

        // Compute start/end of the requested month
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());

        List<Transaction> expenses = transactionRepository
                .findByUserIdAndDateBetweenAndTypeOrderByDateDesc(userId, start, end, TransactionType.EXPENSE);

        // Aggregate spending per category
        Map<String, BigDecimal> spentMap = new LinkedHashMap<>();
        for (Transaction tx : expenses) {
            spentMap.merge(tx.getCategory(), tx.getAmount(), BigDecimal::add);
        }

        return budgets.stream().map(b -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", b.getId());
            row.put("category", b.getCategory());
            row.put("limitAmount", b.getLimitAmount());
            row.put("month", b.getMonth());
            row.put("year", b.getYear());
            BigDecimal spent = spentMap.getOrDefault(b.getCategory(), BigDecimal.ZERO);
            row.put("spent", spent);
            double pct = b.getLimitAmount().compareTo(BigDecimal.ZERO) > 0
                    ? spent.doubleValue() / b.getLimitAmount().doubleValue() * 100
                    : 0;
            row.put("percentage", Math.min(Math.round(pct), 100));
            return row;
        }).toList();
    }

    public void delete(String userId, String id) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found"));
        if (!budget.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        budgetRepository.delete(budget);
    }
}
