package com.nfctools.tooltracker.util;

import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Generates receipt numbers in format: RCP-YYYYMMDD-XXXX
 * The sequence resets per JVM restart — for a prototype this is fine.
 * For production, replace with a DB sequence.
 */
@Component
public class ReceiptNumberGenerator {

    private final AtomicLong sequence = new AtomicLong(1);
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyyMMdd");

    public String generate() {
        return String.format("RCP-%s-%04d",
                LocalDate.now().format(DATE_FMT),
                sequence.getAndIncrement());
    }
}
