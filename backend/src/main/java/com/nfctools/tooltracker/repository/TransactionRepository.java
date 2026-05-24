package com.nfctools.tooltracker.repository;

import com.nfctools.tooltracker.entity.Transaction;
import com.nfctools.tooltracker.enums.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Optional<Transaction> findByReceiptNumber(String receiptNumber);

    Page<Transaction> findByType(TransactionType type, Pageable pageable);

    Page<Transaction> findByStudentId(Long studentId, Pageable pageable);

    // Overdue borrows: type=BORROW, returnedAt is null, transacted before cutoff
    @Query("SELECT t FROM Transaction t WHERE t.type = 'BORROW' " +
           "AND t.returnedAt IS NULL " +
           "AND t.transactedAt < :cutoff")
    List<Transaction> findOverdueBorrows(@Param("cutoff") LocalDateTime cutoff);

    // Active (unreturned) borrow for a specific student
    @Query("SELECT t FROM Transaction t WHERE t.type = 'BORROW' " +
           "AND t.student.id = :studentId AND t.returnedAt IS NULL")
    List<Transaction> findActiveBorrowsByStudent(@Param("studentId") Long studentId);

    // Transactions within a date range — for admin reports
    @Query("SELECT t FROM Transaction t WHERE " +
           "t.transactedAt BETWEEN :from AND :to")
    Page<Transaction> findByDateRange(@Param("from") LocalDateTime from,
                                      @Param("to") LocalDateTime to,
                                      Pageable pageable);

    long countByType(TransactionType type);

    // Count today's transactions
    @Query("SELECT COUNT(t) FROM Transaction t WHERE " +
           "t.transactedAt >= :startOfDay AND t.transactedAt < :endOfDay")
    long countToday(@Param("startOfDay") LocalDateTime startOfDay,
                    @Param("endOfDay") LocalDateTime endOfDay);
}
