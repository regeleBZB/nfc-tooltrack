package com.nfctools.tooltracker.controller;

import com.nfctools.tooltracker.dto.request.CreateTransactionRequest;
import com.nfctools.tooltracker.dto.request.ReturnItemsRequest;
import com.nfctools.tooltracker.dto.response.ApiResponse;
import com.nfctools.tooltracker.dto.response.TransactionResponse;
import com.nfctools.tooltracker.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping
    public ResponseEntity<ApiResponse<TransactionResponse>> create(
            @Valid @RequestBody CreateTransactionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(transactionService.createTransaction(request), "Transaction recorded"));
    }

    @PostMapping("/{id}/return")
    public ResponseEntity<ApiResponse<TransactionResponse>> returnItems(
            @PathVariable Long id,
            @Valid @RequestBody ReturnItemsRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                transactionService.returnItems(id, request), "Items returned"));
    }

    // Reprint route removed — reprinting now happens in the browser over WebUSB
    // (the receipt screen rebuilds the ESC/POS bytes and resends them).

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TransactionResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(transactionService.getTransactionById(id)));
    }

    @GetMapping("/receipt/{receiptNumber}")
    public ResponseEntity<ApiResponse<TransactionResponse>> getByReceipt(
            @PathVariable String receiptNumber) {
        return ResponseEntity.ok(ApiResponse.ok(
                transactionService.getTransactionByReceipt(receiptNumber)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<TransactionResponse>>> getAll(
            @PageableDefault(size = 20) Pageable pageable,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {

        if (from != null && to != null) {
            return ResponseEntity.ok(ApiResponse.ok(
                    transactionService.getTransactionsByDateRange(from, to, pageable)));
        }
        return ResponseEntity.ok(ApiResponse.ok(transactionService.getAllTransactions(pageable)));
    }

    @GetMapping("/overdue")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getOverdue(
            @RequestParam(defaultValue = "24") int hours) {
        return ResponseEntity.ok(ApiResponse.ok(transactionService.getOverdueBorrows(hours)));
    }

    @GetMapping("/student/{studentId}/active")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getActiveBorrows(
            @PathVariable Long studentId) {
        return ResponseEntity.ok(ApiResponse.ok(
                transactionService.getActiveBorrowsByStudent(studentId)));
    }
}