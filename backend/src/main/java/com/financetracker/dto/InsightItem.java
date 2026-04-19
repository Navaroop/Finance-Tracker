package com.financetracker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class InsightItem {
    private String message;
    /** POSITIVE | NEGATIVE | WARNING | NEUTRAL */
    private String type;
}
