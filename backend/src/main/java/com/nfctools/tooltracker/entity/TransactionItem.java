package com.nfctools.tooltracker.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * One row per tool per transaction.
 * Keeping this separate from Transaction means:
 *  - partial returns are possible (return item A, keep item B)
 *  - per-item pricing snapshots for purchase receipts
 *  - future: per-item condition notes
 */
@Entity
@Table(name = "transaction_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionItem extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id", nullable = false)
    private Transaction transaction;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tool_id", nullable = false)
    private Tool tool;

    // Price snapshot at time of purchase — avoids retroactive price changes affecting records
    @Column(name = "price_snapshot", columnDefinition = "DECIMAL(10,2)")
    private Double priceSnapshot;

    @Column(name = "returned", nullable = false)
    private boolean returned = false;   // for per-item return tracking

    @Column(name = "condition_note", length = 255)
    private String conditionNote;       // e.g. "Returned with minor scratch"
}
