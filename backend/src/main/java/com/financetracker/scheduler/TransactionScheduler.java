package com.financetracker.scheduler;

import com.financetracker.model.RecurringTransaction;
import com.financetracker.model.Transaction;
import com.financetracker.repository.RecurringTransactionRepository;
import com.financetracker.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class TransactionScheduler {

    private final RecurringTransactionRepository recurringRepository;
    private final TransactionRepository transactionRepository;

    // Run every day at 1:00 AM
    @Scheduled(cron = "0 0 1 * * ?")
    @Transactional
    public void processRecurringTransactions() {
        log.info("Starting recurring transactions processor...");
        LocalDate today = LocalDate.now();
        List<RecurringTransaction> dueTransactions = recurringRepository.findByActiveTrueAndNextRunDateLessThanEqual(today);

        int processedCount = 0;

        for (RecurringTransaction rule : dueTransactions) {
            try {
                // Generate a new transaction from the rule
                Transaction tx = new Transaction();
                tx.setUserId(rule.getUserId());
                tx.setTitle(rule.getTitle());
                tx.setAmount(rule.getAmount());
                tx.setType(rule.getType());
                tx.setCategory(rule.getCategory());
                tx.setDescription(rule.getDescription());
                tx.setDate(today);
                tx.setIsRecurring(true);

                transactionRepository.save(tx);

                // Update the rule's next run date based on frequency
                LocalDate nextDate = rule.getNextRunDate();
                if ("MONTHLY".equalsIgnoreCase(rule.getFrequency())) {
                    nextDate = nextDate.plusMonths(1);
                } else if ("WEEKLY".equalsIgnoreCase(rule.getFrequency())) {
                    nextDate = nextDate.plusWeeks(1);
                } else if ("YEARLY".equalsIgnoreCase(rule.getFrequency())) {
                    nextDate = nextDate.plusYears(1);
                } else {
                    // Fallback to monthly if not specified or unknown
                    nextDate = nextDate.plusMonths(1);
                }

                // If somehow the updated nextRunDate is STILL in the past (e.g. system was down for a long time),
                // it will just process it again in the next cycle until it catches up, 
                // but let's just forcefully set it to future or exact next period to prevent runaway loops if desired.
                // For simplicity, we just bump by interval.
                while(nextDate.isBefore(today) || nextDate.isEqual(today)) {
                     if ("MONTHLY".equalsIgnoreCase(rule.getFrequency())) {
                        nextDate = nextDate.plusMonths(1);
                    } else if ("WEEKLY".equalsIgnoreCase(rule.getFrequency())) {
                        nextDate = nextDate.plusWeeks(1);
                    } else if ("YEARLY".equalsIgnoreCase(rule.getFrequency())) {
                        nextDate = nextDate.plusYears(1);
                    }
                }

                rule.setNextRunDate(nextDate);
                recurringRepository.save(rule);
                processedCount++;
            } catch (Exception e) {
                log.error("Failed to process recurring transaction rule: " + rule.getId(), e);
            }
        }
        log.info("Finished processing {} recurring transactions.", processedCount);
    }
}
