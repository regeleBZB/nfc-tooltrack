package com.nfctools.tooltracker.controller;

import com.nfctools.tooltracker.dto.response.ApiResponse;
import com.nfctools.tooltracker.dto.response.DashboardResponse;
import com.nfctools.tooltracker.dto.response.PrinterStatusResponse;
import com.nfctools.tooltracker.enums.PrinterMode;
import com.nfctools.tooltracker.service.TransactionService;
import com.nfctools.tooltracker.service.printer.PrinterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final TransactionService transactionService;
    private final PrinterService printerService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.ok(transactionService.getDashboardStats()));
    }

    @GetMapping("/printer/status")
    public ResponseEntity<ApiResponse<PrinterStatusResponse>> getPrinterStatus() {
        PrinterStatusResponse r = new PrinterStatusResponse();
        r.setMode(printerService.getCurrentMode().name());
        r.setConnected(printerService.isCurrentPrinterAvailable());
        return ResponseEntity.ok(ApiResponse.ok(r));
    }

    @PostMapping("/printer/mode")
    public ResponseEntity<ApiResponse<String>> switchPrinterMode(@RequestParam String mode) {
        printerService.switchMode(PrinterMode.valueOf(mode.toUpperCase()));
        return ResponseEntity.ok(ApiResponse.ok(mode.toUpperCase(), "Printer mode switched"));
    }
}
