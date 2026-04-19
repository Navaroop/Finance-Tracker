package com.financetracker.repository;

import com.financetracker.model.Budget;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface BudgetRepository extends MongoRepository<Budget, String> {

    List<Budget> findByUserIdAndMonthAndYear(String userId, int month, int year);

    Optional<Budget> findByUserIdAndCategoryAndMonthAndYear(
            String userId, String category, int month, int year);

    void deleteByUserIdAndId(String userId, String id);
}
