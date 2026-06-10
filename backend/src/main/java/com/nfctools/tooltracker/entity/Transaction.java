package com.nfctools.tooltracker.entity;

import com.nfctools.tooltracker.enums.TransactionType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;


@Entity
@Table(name = "transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TransactionType type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    private Student student;

    @Column(name = "borrower_name", length = 100)
    private String borrowerName;

    @Column(name = "transacted_at", nullable = false)
    private LocalDateTime transactedAt = LocalDateTime.now();

    @Column(name = "returned_at")
    private LocalDateTime returnedAt;

    @Column(name = "receipt_number", unique = true, length = 30)
    private String receiptNumber;       // e.g. "RCP-20240601-0001"

    @Column(name = "notes", length = 255)
    private String notes;

    @OneToMany(mappedBy = "transaction", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TransactionItem> items = new ArrayList<>();

    public void addItem(TransactionItem item) {
        items.add(item);
        item.setTransaction(this);
    }
}
