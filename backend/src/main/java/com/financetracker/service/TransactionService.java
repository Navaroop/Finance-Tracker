package com.financetracker.service;

import com.financetracker.dto.TransactionRequest;
import com.financetracker.model.RecurringTransaction;
import com.financetracker.model.Transaction;
import com.financetracker.model.Transaction.TransactionType;
import com.financetracker.repository.RecurringTransactionRepository;
import com.financetracker.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final RecurringTransactionRepository recurringTransactionRepository;

    public Transaction create(String userId, TransactionRequest request) {
        Transaction tx = new Transaction();
        tx.setUserId(userId);
        tx.setTitle(request.getTitle());
        tx.setAmount(request.getAmount());
        tx.setType(request.getType());
        tx.setCategory(request.getCategory());
        tx.setDate(request.getDate());
        tx.setDescription(request.getDescription());
        tx.setIsRecurring(request.getIsRecurring() != null ? request.getIsRecurring() : false);
        Transaction saved = transactionRepository.save(tx);

        if (Boolean.TRUE.equals(request.getIsRecurring())) {
            RecurringTransaction rule = new RecurringTransaction();
            rule.setUserId(userId);
            rule.setTitle(request.getTitle());
            rule.setAmount(request.getAmount());
            rule.setType(request.getType());
            rule.setCategory(request.getCategory());
            rule.setDescription(request.getDescription());
            
            String freq = request.getFrequency() != null ? request.getFrequency() : "MONTHLY";
            rule.setFrequency(freq);

            LocalDate nextDate = request.getDate();
            if ("MONTHLY".equalsIgnoreCase(freq)) nextDate = nextDate.plusMonths(1);
            else if ("WEEKLY".equalsIgnoreCase(freq)) nextDate = nextDate.plusWeeks(1);
            else if ("YEARLY".equalsIgnoreCase(freq)) nextDate = nextDate.plusYears(1);
            else nextDate = nextDate.plusMonths(1);

            rule.setNextRunDate(nextDate);
            recurringTransactionRepository.save(rule);
        }

        return saved;
    }

    public List<Transaction> getAll(String userId, String type, String category,
                                     String search, LocalDate startDate, LocalDate endDate) {
        // Search by title takes priority when provided
        if (search != null && !search.isBlank()) {
            return transactionRepository
                    .findByUserIdAndTitleContainingIgnoreCaseOrderByDateDesc(userId, search);
        }

        // Date range + optional type filter
        if (startDate != null && endDate != null) {
            if (type != null && !type.equalsIgnoreCase("ALL")) {
                return transactionRepository.findByUserIdAndDateBetweenAndTypeOrderByDateDesc(
                        userId, startDate, endDate, TransactionType.valueOf(type.toUpperCase()));
            }
            return transactionRepository.findByUserIdAndDateBetweenOrderByDateDesc(userId, startDate, endDate);
        }

        // Type filter only
        if (type != null && !type.equalsIgnoreCase("ALL")) {
            return transactionRepository.findByUserIdAndTypeOrderByDateDesc(
                    userId, TransactionType.valueOf(type.toUpperCase()));
        }

        // Category filter only
        if (category != null && !category.isBlank()) {
            return transactionRepository.findByUserIdAndCategoryOrderByDateDesc(userId, category);
        }

        return transactionRepository.findByUserIdOrderByDateDesc(userId);
    }

    public Transaction update(String userId, String id, TransactionRequest request) {
        Transaction tx = findAndVerifyOwnership(userId, id);
        tx.setTitle(request.getTitle());
        tx.setAmount(request.getAmount());
        tx.setType(request.getType());
        tx.setCategory(request.getCategory());
        tx.setDate(request.getDate());
        tx.setDescription(request.getDescription());
        return transactionRepository.save(tx);
    }

    public void delete(String userId, String id) {
        Transaction tx = findAndVerifyOwnership(userId, id);
        transactionRepository.delete(tx);
    }

    private Transaction findAndVerifyOwnership(String userId, String id) {
        Transaction tx = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
        if (!tx.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        return tx;
    }
}
