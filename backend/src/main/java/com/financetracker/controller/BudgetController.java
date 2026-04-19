package com.financetracker.controller;

import com.financetracker.dto.BudgetRequest;
import com.financetracker.model.Budget;
import com.financetracker.repository.UserRepository;
import com.financetracker.service.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;
    private final UserRepository userRepository;

    private String resolveUserId(UserDetails userDetails) {
        return userRepository.findByEmailIgnoreCase(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found")).getId();
    }

    @PostMapping
    public ResponseEntity<Budget> createOrUpdate(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody BudgetRequest request) {
        return ResponseEntity.ok(budgetService.createOrUpdate(resolveUserId(userDetails), request));
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getBudgets(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam int month,
            @RequestParam int year) {
        return ResponseEntity.ok(
                budgetService.getBudgetsWithSpending(resolveUserId(userDetails), month, year));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String id) {
        budgetService.delete(resolveUserId(userDetails), id);
        return ResponseEntity.noContent().build();
    }
}
