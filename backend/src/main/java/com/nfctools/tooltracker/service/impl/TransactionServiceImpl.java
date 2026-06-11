package com.nfctools.tooltracker.service.impl;

import com.nfctools.tooltracker.dto.request.CreateTransactionRequest;
import com.nfctools.tooltracker.dto.request.ReturnItemsRequest;
import com.nfctools.tooltracker.dto.response.DashboardResponse;
import com.nfctools.tooltracker.dto.response.StudentResponse;
import com.nfctools.tooltracker.dto.response.TransactionItemResponse;
import com.nfctools.tooltracker.dto.response.TransactionResponse;
import com.nfctools.tooltracker.entity.*;
import com.nfctools.tooltracker.enums.ToolStatus;
import com.nfctools.tooltracker.enums.TransactionType;
import com.nfctools.tooltracker.exception.BusinessException;
import com.nfctools.tooltracker.exception.ResourceNotFoundException;
import com.nfctools.tooltracker.repository.*;
import com.nfctools.tooltracker.service.TransactionService;
import com.nfctools.tooltracker.service.printer.PrinterService;
import com.nfctools.tooltracker.util.ReceiptNumberGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final ToolRepository toolRepository;
    private final StudentRepository studentRepository;
    private final AppUserRepository appUserRepository;
    private final ReceiptNumberGenerator receiptNumberGenerator;
    private final PrinterService printerService;

    @Override
    @Transactional
    public TransactionResponse createTransaction(CreateTransactionRequest request) {
        TransactionType type = TransactionType.valueOf(request.getType().toUpperCase());

        Transaction tx = Transaction.builder()
                .type(type)
                .receiptNumber(receiptNumberGenerator.generate())
                .borrowerName(request.getBorrowerName())
                .notes(request.getNotes())
                .transactedAt(LocalDateTime.now())
                .build();

        // Resolve student if provided
        if (request.getStudentId() != null) {
            Student student = studentRepository.findById(request.getStudentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student", request.getStudentId()));
            tx.setStudent(student);
        }

        // Add tools and validate availability
        for (Long toolId : request.getToolIds()) {
            Tool tool = toolRepository.findById(toolId)
                    .orElseThrow(() -> new ResourceNotFoundException("Tool", toolId));

            if (type == TransactionType.BORROW && tool.getStatus() != ToolStatus.AVAILABLE) {
                throw new BusinessException(
                        "Tool '" + tool.getName() + "' is not available (status: " + tool.getStatus() + ")");
            }

            TransactionItem item = TransactionItem.builder()
                    .tool(tool)
                    .priceSnapshot(tool.getPurchasePrice())
                    .returned(false)
                    .build();
            tx.addItem(item);

            // Update tool status
            tool.setStatus(type == TransactionType.BORROW ? ToolStatus.BORROWED : ToolStatus.AVAILABLE);
            toolRepository.save(tool);
        }

        Transaction saved = transactionRepository.save(tx);

        // Fire and forget — print failure must not fail the transaction
        printerService.printReceipt(saved);

        return toResponse(saved);
    }

    @Override
    @Transactional
    public TransactionResponse returnItems(Long transactionId, ReturnItemsRequest request) {
        Transaction tx = findTransactionOrThrow(transactionId);

        if (tx.getType() != TransactionType.BORROW) {
            throw new BusinessException("Only BORROW transactions can have items returned");
        }

        for (Long itemId : request.getTransactionItemIds()) {
            tx.getItems().stream()
                    .filter(i -> i.getId().equals(itemId))
                    .findFirst()
                    .ifPresent(item -> {
                        item.setReturned(true);
                        item.setConditionNote(request.getConditionNote());
                        item.getTool().setStatus(ToolStatus.AVAILABLE);
                        toolRepository.save(item.getTool());
                    });
        }

        // Mark transaction returned only when ALL items are back
        boolean allReturned = tx.getItems().stream().allMatch(TransactionItem::isReturned);
        if (allReturned) {
            tx.setReturnedAt(LocalDateTime.now());
        }

        return toResponse(transactionRepository.save(tx));
    }

    @Override
    public TransactionResponse getTransactionById(Long id) {
        return toResponse(findTransactionOrThrow(id));
    }

    @Override
    public TransactionResponse getTransactionByReceipt(String receiptNumber) {
        return toResponse(transactionRepository.findByReceiptNumber(receiptNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", receiptNumber)));
    }

    @Override
    public Page<TransactionResponse> getAllTransactions(Pageable pageable) {
        return transactionRepository.findAll(pageable).map(this::toResponse);
    }

    @Override
    public Page<TransactionResponse> getTransactionsByDateRange(LocalDateTime from, LocalDateTime to, Pageable pageable) {
        return transactionRepository.findByDateRange(from, to, pageable).map(this::toResponse);
    }

    @Override
    public List<TransactionResponse> getOverdueBorrows(int overdueAfterHours) {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(overdueAfterHours);
        return transactionRepository.findOverdueBorrows(cutoff)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public List<TransactionResponse> getActiveBorrowsByStudent(Long studentId) {
        return transactionRepository.findActiveBorrowsByStudent(studentId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public DashboardResponse getDashboardStats() {
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        LocalDateTime endOfDay   = startOfDay.plusDays(1);

        DashboardResponse d = new DashboardResponse();
        d.setTotalTools(toolRepository.count());
        d.setAvailableTools(toolRepository.findByStatus(ToolStatus.AVAILABLE).size());
        d.setBorrowedTools(toolRepository.findByStatus(ToolStatus.BORROWED).size());
        d.setMaintenanceTools(toolRepository.findByStatus(ToolStatus.MAINTENANCE).size());
        d.setTodayTransactions(transactionRepository.countToday(startOfDay, endOfDay));
        d.setOverdueBorrows(transactionRepository.findOverdueBorrows(
                LocalDateTime.now().minusHours(24)).size());
        d.setTotalStudents(studentRepository.count());
        d.setPrinterMode(printerService.getCurrentMode().name());
        return d;
    }

    @Override
    @Transactional(readOnly = true)
    public void reprintReceipt(Long transactionId) {
        Transaction tx = findTransactionOrThrow(transactionId);
        printerService.printReceipt(tx);
    }

    // ── Private ──────────────────────────────────────────────────────────────

    private Transaction findTransactionOrThrow(Long id) {
        return transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", id));
    }

    private TransactionResponse toResponse(Transaction tx) {
        TransactionResponse r = new TransactionResponse();
        r.setId(tx.getId());
        r.setReceiptNumber(tx.getReceiptNumber());
        r.setType(tx.getType());
        r.setBorrowerName(tx.getBorrowerName());
        r.setTransactedAt(tx.getTransactedAt());
        r.setReturnedAt(tx.getReturnedAt());
        r.setNotes(tx.getNotes());

        if (tx.getStudent() != null) {
            StudentResponse sr = new StudentResponse();
            sr.setId(tx.getStudent().getId());
            sr.setName(tx.getStudent().getName());
            sr.setSection(tx.getStudent().getSection());
            sr.setQrCode(tx.getStudent().getQrCode());
            r.setStudent(sr);
        }

        r.setItems(tx.getItems().stream().map(item -> {
            TransactionItemResponse ir = new TransactionItemResponse();
            ir.setId(item.getId());
            ir.setToolId(item.getTool().getId());
            ir.setToolCode(item.getTool().getToolCode());
            ir.setToolName(item.getTool().getName());
            ir.setPriceSnapshot(item.getPriceSnapshot());
            ir.setReturned(item.isReturned());
            ir.setConditionNote(item.getConditionNote());
            return ir;
        }).collect(Collectors.toList()));

        return r;
    }
}
