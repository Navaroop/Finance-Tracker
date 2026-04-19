package com.financetracker.repository;

import com.financetracker.model.Transaction;
import com.financetracker.model.Transaction.TransactionType;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.util.List;

public interface TransactionRepository extends MongoRepository<Transaction, String> {

    List<Transaction> findByUserIdOrderByDateDesc(String userId);

    List<Transaction> findByUserIdAndTypeOrderByDateDesc(String userId, TransactionType type);

    List<Transaction> findByUserIdAndCategoryOrderByDateDesc(String userId, String category);

    List<Transaction> findByUserIdAndDateBetweenOrderByDateDesc(String userId, LocalDate start, LocalDate end);

    List<Transaction> findByUserIdAndDateBetweenAndTypeOrderByDateDesc(
            String userId, LocalDate start, LocalDate end, TransactionType type);

    List<Transaction> findTop5ByUserIdOrderByDateDesc(String userId);

    List<Transaction> findByUserIdAndTitleContainingIgnoreCaseOrderByDateDesc(String userId, String title);
}
