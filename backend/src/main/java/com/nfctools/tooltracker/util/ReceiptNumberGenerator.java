package com.nfctools.tooltracker.util;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Slf4j
@Component
public class ReceiptNumberGenerator {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyyMMdd");

    @PersistenceContext
    private EntityManager em;
    public String generate() {
        String prefix = "RCP-" + LocalDate.now().format(DATE_FMT) + "-";

        // Find the highest sequence number already used today
        Long maxSeq = (Long) em.createQuery(
                        "SELECT COALESCE(MAX(CAST(SUBSTRING(t.receiptNumber, 14) AS long)), 0) " +
                                "FROM Transaction t " +
                                "WHERE t.receiptNumber LIKE :prefix")
                .setParameter("prefix", prefix + "%")
                .getSingleResult();

        long next = maxSeq + 1;
        String receipt = String.format("%s%04d", prefix, next);
        log.debug("Generated receipt number: {}", receipt);
        return receipt;
    }
}