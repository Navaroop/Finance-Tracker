package com.financetracker.repository;

import com.financetracker.model.RecurringTransaction;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RecurringTransactionRepository extends MongoRepository<RecurringTransaction, String> {
    List<RecurringTransaction> findByActiveTrueAndNextRunDateLessThanEqual(LocalDate date);
    List<RecurringTransaction> findByUserId(String userId);
}
