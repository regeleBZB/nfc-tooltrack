package com.nfctools.tooltracker.entity;

import jakarta.persistence.*;
import lombok.*;

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

    @Column(name = "price_snapshot", columnDefinition = "DECIMAL(10,2)")
    private Double priceSnapshot;

    @Column(name = "returned", nullable = false)
    private boolean returned = false;

    @Column(name = "condition_note", length = 255)
    private String conditionNote;
}
