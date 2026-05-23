package com.nfctools.tooltracker.entity;

import com.nfctools.tooltracker.enums.ToolStatus;
import jakarta.persistence.*;
import lombok.*;

/**
 * Represents a physical tool in the lab.
 * One Tool can have one active Tag linked to it (via Tag entity).
 * Status transitions: AVAILABLE → BORROWED → AVAILABLE
 *                     AVAILABLE → MAINTENANCE → AVAILABLE
 *                     ANY       → RETIRED
 */
@Entity
@Table(name = "tools")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tool extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tool_code", nullable = false, unique = true, length = 20)
    private String toolCode;        // e.g. "TW-001" — human-readable ID

    @Column(nullable = false, length = 100)
    private String name;            // e.g. "Torque Wrench"

    @Column(length = 50)
    private String category;        // e.g. "Wrench", "Measuring", "Power Tool"

    @Column(length = 255)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ToolStatus status = ToolStatus.AVAILABLE;

    @Column(name = "purchase_price", columnDefinition = "DECIMAL(10,2)")
    private Double purchasePrice;   // for purchase transaction receipts

    // Navigational — lazily loaded, not always needed
    @OneToOne(mappedBy = "tool", fetch = FetchType.LAZY)
    private Tag tag;
}
