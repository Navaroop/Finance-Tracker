package com.financetracker.controller;

import com.financetracker.dto.DashboardSummary;
import com.financetracker.repository.UserRepository;
import com.financetracker.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<DashboardSummary> getSummary(
            @AuthenticationPrincipal UserDetails userDetails) {
        String userId = userRepository.findByEmailIgnoreCase(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found")).getId();
        return ResponseEntity.ok(dashboardService.getSummary(userId));
    }
}
