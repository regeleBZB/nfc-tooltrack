package com.nfctools.tooltracker.service.printer;

import com.github.anastaciocintra.escpos.EscPos;
import com.github.anastaciocintra.escpos.EscPosConst;
import com.github.anastaciocintra.escpos.Style;
import com.nfctools.tooltracker.config.PrinterConfig;
import com.nfctools.tooltracker.entity.Transaction;
import com.nfctools.tooltracker.entity.TransactionItem;
import com.nfctools.tooltracker.enums.PrinterMode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.OutputStream;

@Slf4j
@Service
@RequiredArgsConstructor
public class PrinterService {

    private final PrinterConfig config;
    private final UsbPrinterStrategy usbStrategy;
    private final BluetoothPrinterStrategy bluetoothStrategy;

    /**
     * Print a receipt for a completed transaction.
     * Strategy is selected based on current config.mode.
     */
    public void printReceipt(Transaction tx) {
        PrinterStrategy strategy = resolveStrategy();
        log.info("Printing receipt {} via {}", tx.getReceiptNumber(), strategy.getDescription());

        try (OutputStream out = strategy.openStream()) {
            writeReceipt(new EscPos(out), tx);
        } catch (Exception e) {
            // Printing failure must not roll back the transaction
            log.error("Print failed for receipt {}: {}", tx.getReceiptNumber(), e.getMessage());
        }
    }

    public void switchMode(PrinterMode mode) {
        config.setMode(mode);
        log.info("Printer mode switched to {}", mode);
    }

    public PrinterMode getCurrentMode() { return config.getMode(); }

    public boolean isCurrentPrinterAvailable() {
        return resolveStrategy().isAvailable();
    }

    // ── Private ──────────────────────────────────────────────────────────────

    private PrinterStrategy resolveStrategy() {
        return config.getMode() == PrinterMode.USB ? usbStrategy : bluetoothStrategy;
    }

    private void writeReceipt(EscPos escpos, Transaction tx) throws Exception {
        Style center = new Style().setJustification(EscPosConst.Justification.Center);
        Style bold   = new Style().setBold(true);

        escpos.writeLF(center, "================================");
        escpos.writeLF(center, "    AMT LAB — TOOL TRACKER    ");
        escpos.writeLF(center, "================================");
        escpos.writeLF("");
        escpos.writeLF(bold, "Receipt : " + tx.getReceiptNumber());
        escpos.writeLF("Type    : " + tx.getType().name());
        escpos.writeLF("Student : " + resolveStudentName(tx));
        escpos.writeLF("Date    : " + tx.getTransactedAt().toLocalDate());
        escpos.writeLF("Time    : " + tx.getTransactedAt().toLocalTime().toString().substring(0, 5));
        escpos.writeLF("--------------------------------");

        for (TransactionItem item : tx.getItems()) {
            String price = item.getPriceSnapshot() != null
                    ? String.format(" (P%.2f)", item.getPriceSnapshot()) : "";
            escpos.writeLF("  " + item.getTool().getName() + price);
            escpos.writeLF("  Code: " + item.getTool().getToolCode());
        }

        escpos.writeLF("--------------------------------");
        escpos.writeLF("Total items: " + tx.getItems().size());

        if ("BORROW".equals(tx.getType().name())) {
            escpos.writeLF("");
            escpos.writeLF("Please return tools after use.");
            escpos.writeLF("");
            escpos.writeLF("Signature: ____________________");
        }

        escpos.writeLF("");
        escpos.writeLF(center, "Thank you!");
        escpos.writeLF(center, "================================");
        escpos.feed(4);
        escpos.cut(EscPos.CutMode.FULL);
    }

    private String resolveStudentName(Transaction tx) {
        if (tx.getStudent() != null) return tx.getStudent().getName();
        if (tx.getBorrowerName() != null) return tx.getBorrowerName();
        return "Walk-in";
    }
}
