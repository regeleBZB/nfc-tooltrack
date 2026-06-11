package com.nfctools.tooltracker.service;

import com.nfctools.tooltracker.dto.request.CreateTransactionRequest;
import com.nfctools.tooltracker.dto.request.ReturnItemsRequest;
import com.nfctools.tooltracker.dto.response.DashboardResponse;
import com.nfctools.tooltracker.dto.response.TransactionResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

public interface TransactionService {
    TransactionResponse createTransaction(CreateTransactionRequest request);
    TransactionResponse returnItems(Long transactionId, ReturnItemsRequest request);
    void reprintReceipt(Long transactionId);
    TransactionResponse getTransactionById(Long id);
    TransactionResponse getTransactionByReceipt(String receiptNumber);
    Page<TransactionResponse> getAllTransactions(Pageable pageable);
    Page<TransactionResponse> getTransactionsByDateRange(LocalDateTime from, LocalDateTime to, Pageable pageable);
    List<TransactionResponse> getOverdueBorrows(int overdueAfterHours);
    List<TransactionResponse> getActiveBorrowsByStudent(Long studentId);
    DashboardResponse getDashboardStats();
}